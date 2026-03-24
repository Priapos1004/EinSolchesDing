import type { GameStateEvent, SSEEvent } from "@esd/shared";
import type { GameState } from "./game-logic";
import { gameManager } from "./game-manager";

interface SSEConnection {
  controller: ReadableStreamDefaultController;
  playerIndex: number;
}

// In-memory: gameId → Map<playerIndex, SSEConnection>
const connections = new Map<string, Map<number, SSEConnection>>();

export function createSSEStream(
  gameId: string,
  playerIndex: number
): ReadableStream {
  return new ReadableStream({
    start(controller) {
      // Register connection
      if (!connections.has(gameId)) {
        connections.set(gameId, new Map());
      }
      const gameConns = connections.get(gameId)!;

      // Close existing connection for this player (reconnect)
      if (gameConns.has(playerIndex)) {
        try {
          gameConns.get(playerIndex)!.controller.close();
        } catch {}
      }

      gameConns.set(playerIndex, { controller, playerIndex });
    },
    cancel() {
      removeConnection(gameId, playerIndex);
    },
  });
}

export function removeConnection(gameId: string, playerIndex: number): void {
  const gameConns = connections.get(gameId);
  if (gameConns) {
    gameConns.delete(playerIndex);
    if (gameConns.size === 0) {
      connections.delete(gameId);
    }
  }
}

function sendSSE(
  controller: ReadableStreamDefaultController,
  event: SSEEvent
): void {
  try {
    const data = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  } catch {
    // Connection closed
  }
}

// Send event to a specific player
export function sendToPlayer(
  gameId: string,
  playerIndex: number,
  event: SSEEvent
): void {
  const gameConns = connections.get(gameId);
  if (!gameConns) return;
  const conn = gameConns.get(playerIndex);
  if (conn) {
    sendSSE(conn.controller, event);
  }
}

// Broadcast event to all players in a game
export function broadcast(gameId: string, event: SSEEvent): void {
  const gameConns = connections.get(gameId);
  if (!gameConns) return;
  for (const conn of gameConns.values()) {
    sendSSE(conn.controller, event);
  }
}

// Broadcast tailored game state to each player
export async function broadcastGameState(
  gameState: GameState
): Promise<void> {
  const gameConns = connections.get(gameState.game_id);
  if (!gameConns) return;

  const players = await gameManager.getPlayers(gameState.game_id);
  const vote = await gameManager.getVote(gameState.game_id);

  for (const [playerIndex, conn] of gameConns) {
    const event: GameStateEvent = {
      type: "game_state",
      game_id: gameState.game_id,
      status: gameState.status,
      language: gameState.language,
      current_player: gameState.current_player,
      your_index: playerIndex,
      players: Array.from(players.entries()).map(([idx, p]) => ({
        index: idx,
        name: p.display_name,
        card_count: gameState.player_hands[idx]?.length ?? 0,
        connected: p.connected,
      })),
      your_hand: gameState.player_hands[playerIndex] ?? [],
      played_cards: gameState.played_cards,
      active_vote: vote,
    };
    sendSSE(conn.controller, event);
  }
}

export function getConnectedPlayers(gameId: string): number[] {
  const gameConns = connections.get(gameId);
  if (!gameConns) return [];
  return Array.from(gameConns.keys());
}
