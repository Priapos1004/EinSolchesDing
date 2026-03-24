import type {
  JoinGameRequest,
  PlayCardRequest,
  CastVoteRequest,
  VoteState,
} from "@esd/shared";
import { createSessionToken, verifySessionToken } from "../auth";
import { gameManager } from "../game-manager";
import { playCard, drawTwoCards } from "../game-logic";
import {
  broadcast,
  broadcastGameState,
} from "../sse";

export async function handleGameInfo(
  req: Request,
  gameId: string
): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  const storedToken = await gameManager.getInviteToken(gameId);
  if (!storedToken || token !== storedToken) {
    return Response.json({ error: "Invalid invite token" }, { status: 403 });
  }

  const state = await gameManager.loadGameState(gameId);
  if (!state) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }

  const players = await gameManager.getPlayers(gameId);
  return Response.json({
    game_id: gameId,
    player_count: state.player_count,
    language: state.language,
    joined_count: players.size,
    players: Array.from(players.entries()).map(([idx, p]) => ({
      index: idx,
      name: p.display_name,
    })),
  });
}

export async function handleJoinGame(
  req: Request,
  gameId: string
): Promise<Response> {
  const body = (await req.json()) as JoinGameRequest;

  const storedToken = await gameManager.getInviteToken(gameId);
  if (!storedToken || body.token !== storedToken) {
    return Response.json({ error: "Invalid invite token" }, { status: 403 });
  }

  const state = await gameManager.loadGameState(gameId);
  if (!state) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }

  const currentPlayers = await gameManager.getPlayerCount(gameId);
  if (currentPlayers >= state.player_count) {
    return Response.json({ error: "Game is full" }, { status: 400 });
  }

  const playerIndex = currentPlayers;
  await gameManager.addPlayer(gameId, playerIndex, body.display_name);

  // If all players have joined, start the game
  if (playerIndex + 1 === state.player_count) {
    state.status = "playing";
    await gameManager.updateGameState(state);
  }

  const sessionToken = await createSessionToken(
    gameId,
    playerIndex,
    body.display_name
  );

  // Broadcast player joined event
  broadcast(gameId, {
    type: "player_joined",
    player_index: playerIndex,
    display_name: body.display_name,
  });

  // If game just started, broadcast initial state
  if (state.status === "playing") {
    await broadcastGameState(state);
  }

  return Response.json({
    player_id: `${gameId}-${playerIndex}`,
    player_index: playerIndex,
    session_token: sessionToken,
  });
}

export async function handlePlayCard(
  req: Request,
  gameId: string
): Promise<Response> {
  const session = await getSession(req);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.game_id !== gameId) {
    return Response.json({ error: "Wrong game" }, { status: 403 });
  }

  const body = (await req.json()) as PlayCardRequest;
  const state = await gameManager.loadGameState(gameId);
  if (!state) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }

  const result = playCard(state, session.player_index, body.keyword);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  await gameManager.updateGameState(result);
  await broadcastGameState(result);

  return Response.json({ ok: true });
}

export async function handleVoteStart(
  req: Request,
  gameId: string
): Promise<Response> {
  const session = await getSession(req);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await gameManager.loadGameState(gameId);
  if (!state) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }

  if (state.played_cards.length === 0) {
    return Response.json(
      { error: "No cards played yet this round" },
      { status: 400 }
    );
  }

  const existingVote = await gameManager.getVote(gameId);
  if (existingVote) {
    return Response.json(
      { error: "Vote already in progress" },
      { status: 400 }
    );
  }

  // Target is the previous player
  const targetIndex =
    (state.current_player - 1 + state.player_count) % state.player_count;
  const players = await gameManager.getPlayers(gameId);
  const targetPlayer = players.get(targetIndex);

  const vote: VoteState = {
    initiator: session.player_index,
    target: targetIndex,
    target_name: targetPlayer?.display_name || `Player ${targetIndex + 1}`,
    votes_yes: [],
    votes_no: [],
    votes_needed: state.player_count - 1, // everyone except target
  };

  await gameManager.saveVote(gameId, vote);

  broadcast(gameId, {
    type: "vote_started",
    initiator: vote.initiator,
    target: vote.target,
    target_name: vote.target_name,
  });

  return Response.json({ ok: true });
}

export async function handleVoteCast(
  req: Request,
  gameId: string
): Promise<Response> {
  const session = await getSession(req);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CastVoteRequest;
  const vote = await gameManager.getVote(gameId);
  if (!vote) {
    return Response.json({ error: "No active vote" }, { status: 400 });
  }

  if (session.player_index === vote.target) {
    return Response.json(
      { error: "Target cannot vote" },
      { status: 400 }
    );
  }

  // Check if already voted
  if (
    vote.votes_yes.includes(session.player_index) ||
    vote.votes_no.includes(session.player_index)
  ) {
    return Response.json({ error: "Already voted" }, { status: 400 });
  }

  if (body.valid) {
    vote.votes_yes.push(session.player_index);
  } else {
    vote.votes_no.push(session.player_index);
  }

  await gameManager.saveVote(gameId, vote);

  const totalVotes = vote.votes_yes.length + vote.votes_no.length;

  broadcast(gameId, {
    type: "vote_update",
    votes_yes: vote.votes_yes.length,
    votes_no: vote.votes_no.length,
    votes_needed: vote.votes_needed,
  });

  // Check if all votes are in
  if (totalVotes >= vote.votes_needed) {
    const valid = vote.votes_yes.length >= vote.votes_no.length; // tie = valid

    let state = await gameManager.loadGameState(gameId);
    if (!state) {
      return Response.json({ error: "Game not found" }, { status: 404 });
    }

    // Determine who draws cards
    const loserIndex = valid ? vote.initiator : vote.target;
    state = drawTwoCards(state, loserIndex);

    // Vote winner gets the next turn
    const winnerIndex = valid ? vote.target : vote.initiator;
    state = { ...state, current_player: winnerIndex };

    await gameManager.updateGameState(state);
    await gameManager.deleteVote(gameId);

    broadcast(gameId, {
      type: "vote_result",
      valid,
      target: vote.target,
      cards_drawn_by: loserIndex,
    });

    if (state.winner !== -1) {
      const players = await gameManager.getPlayers(gameId);
      const winnerPlayer = players.get(state.winner);
      broadcast(gameId, {
        type: "winner",
        player_index: state.winner,
        display_name:
          winnerPlayer?.display_name || `Player ${state.winner + 1}`,
      });
    }

    await broadcastGameState(state);
  }

  return Response.json({ ok: true });
}

async function getSession(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifySessionToken(auth.slice(7));
}
