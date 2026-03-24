import { redis } from "bun";
import type { Card, Language, VoteState, GameStatus } from "@esd/shared";
import type { GameState } from "./game-logic";

const TTL = 86400; // 24 hours

function key(gameId: string, ...parts: string[]): string {
  return `esd:${gameId}:${parts.join(":")}`;
}

// Players stored in memory alongside Redis for simplicity
interface PlayerData {
  display_name: string;
  connected: boolean;
}

export class GameManager {
  // Save full game state to Redis
  async saveGameState(state: GameState, inviteToken: string): Promise<void> {
    const metaKey = key(state.game_id, "meta");
    await redis.hset(metaKey, {
      player_count: String(state.player_count),
      language: state.language,
      status: state.status,
      current_player: String(state.current_player),
      max_cards: String(state.max_cards),
      zero_cards_player: String(state.zero_cards_player),
      winner: String(state.winner),
      invite_token: inviteToken,
    });
    await redis.expire(metaKey, TTL);

    // Save each player's hand
    for (let i = 0; i < state.player_count; i++) {
      const handKey = key(state.game_id, "hand", String(i));
      await redis.del(handKey);
      if (state.player_hands[i].length > 0) {
        const handObj: Record<string, string> = {};
        for (const card of state.player_hands[i]) {
          handObj[card.keyword] = card.info;
        }
        await redis.hset(handKey, handObj);
      }
      await redis.expire(handKey, TTL);
    }

    // Save played cards
    const playedKey = key(state.game_id, "played");
    await redis.del(playedKey);
    if (state.played_cards.length > 0) {
      const playedObj: Record<string, string> = {};
      for (const card of state.played_cards) {
        playedObj[card.keyword] = card.info;
      }
      await redis.hset(playedKey, playedObj);
    }
    await redis.expire(playedKey, TTL);

    // Save draw stack
    const stackKey = key(state.game_id, "draw_stack");
    await redis.del(stackKey);
    for (const card of state.draw_stack) {
      await redis.rpush(stackKey, JSON.stringify(card));
    }
    await redis.expire(stackKey, TTL);
  }

  // Load full game state from Redis
  async loadGameState(gameId: string): Promise<GameState | null> {
    const metaKey = key(gameId, "meta");
    const meta = await redis.hgetall(metaKey);
    if (!meta || !meta.player_count) return null;

    const playerCount = parseInt(meta.player_count);
    const player_hands: Card[][] = [];

    for (let i = 0; i < playerCount; i++) {
      const handKey = key(gameId, "hand", String(i));
      const handData = await redis.hgetall(handKey);
      const hand: Card[] = [];
      if (handData) {
        for (const [keyword, info] of Object.entries(handData)) {
          hand.push({ keyword, info });
        }
      }
      player_hands.push(hand);
    }

    const playedKey = key(gameId, "played");
    const playedData = await redis.hgetall(playedKey);
    const played_cards: Card[] = [];
    if (playedData) {
      for (const [keyword, info] of Object.entries(playedData)) {
        played_cards.push({ keyword, info });
      }
    }

    const stackKey = key(gameId, "draw_stack");
    const stackLen = await redis.llen(stackKey);
    const draw_stack: Card[] = [];
    for (let i = 0; i < stackLen; i++) {
      const raw = await redis.lindex(stackKey, i);
      if (raw) draw_stack.push(JSON.parse(raw));
    }

    return {
      game_id: gameId,
      player_count: playerCount,
      language: meta.language as Language,
      status: meta.status as GameStatus,
      current_player: parseInt(meta.current_player),
      max_cards: parseInt(meta.max_cards),
      zero_cards_player: parseInt(meta.zero_cards_player),
      winner: parseInt(meta.winner),
      player_hands,
      played_cards,
      draw_stack,
    };
  }

  // Update game state in Redis (full overwrite)
  async updateGameState(state: GameState): Promise<void> {
    const metaKey = key(state.game_id, "meta");
    const existingMeta = await redis.hgetall(metaKey);
    const inviteToken = existingMeta?.invite_token || "";
    await this.saveGameState(state, inviteToken);
  }

  // Player management
  async addPlayer(
    gameId: string,
    playerIndex: number,
    displayName: string
  ): Promise<void> {
    const playersKey = key(gameId, "players");
    await redis.hset(playersKey, {
      [String(playerIndex)]: JSON.stringify({
        display_name: displayName,
        connected: false,
      }),
    });
    await redis.expire(playersKey, TTL);
  }

  async getPlayers(
    gameId: string
  ): Promise<Map<number, PlayerData>> {
    const playersKey = key(gameId, "players");
    const data = await redis.hgetall(playersKey);
    const players = new Map<number, PlayerData>();
    if (data) {
      for (const [idx, json] of Object.entries(data)) {
        players.set(parseInt(idx), JSON.parse(json));
      }
    }
    return players;
  }

  async getPlayerCount(gameId: string): Promise<number> {
    const playersKey = key(gameId, "players");
    return await redis.hlen(playersKey);
  }

  async setPlayerConnected(
    gameId: string,
    playerIndex: number,
    connected: boolean
  ): Promise<void> {
    const playersKey = key(gameId, "players");
    const raw = await redis.hget(playersKey, String(playerIndex));
    if (raw) {
      const data = JSON.parse(raw);
      data.connected = connected;
      await redis.hset(playersKey, {
        [String(playerIndex)]: JSON.stringify(data),
      });
    }
  }

  // Invite token validation
  async getInviteToken(gameId: string): Promise<string | null> {
    return await redis.hget(key(gameId, "meta"), "invite_token");
  }

  // Vote management
  async saveVote(gameId: string, vote: VoteState): Promise<void> {
    const voteKey = key(gameId, "vote");
    await redis.hset(voteKey, {
      initiator: String(vote.initiator),
      target: String(vote.target),
      target_name: vote.target_name,
      votes_yes: JSON.stringify(vote.votes_yes),
      votes_no: JSON.stringify(vote.votes_no),
      votes_needed: String(vote.votes_needed),
    });
    await redis.expire(voteKey, TTL);
  }

  async getVote(gameId: string): Promise<VoteState | null> {
    const voteKey = key(gameId, "vote");
    const data = await redis.hgetall(voteKey);
    if (!data || !data.initiator) return null;
    return {
      initiator: parseInt(data.initiator),
      target: parseInt(data.target),
      target_name: data.target_name,
      votes_yes: JSON.parse(data.votes_yes),
      votes_no: JSON.parse(data.votes_no),
      votes_needed: parseInt(data.votes_needed),
    };
  }

  async deleteVote(gameId: string): Promise<void> {
    await redis.del(key(gameId, "vote"));
  }

  // Delete entire game
  async deleteGame(gameId: string): Promise<void> {
    const metaKey = key(gameId, "meta");
    const meta = await redis.hgetall(metaKey);
    if (!meta) return;

    const playerCount = parseInt(meta.player_count || "0");
    const keys = [
      metaKey,
      key(gameId, "players"),
      key(gameId, "played"),
      key(gameId, "draw_stack"),
      key(gameId, "vote"),
    ];
    for (let i = 0; i < playerCount; i++) {
      keys.push(key(gameId, "hand", String(i)));
    }
    for (const k of keys) {
      await redis.del(k);
    }
  }
}

export const gameManager = new GameManager();
