import { verifySessionToken } from "../auth";
import { gameManager } from "../game-manager";
import { createSSEStream, removeConnection, broadcastGameState } from "../sse";

export async function handleSSE(
  req: Request,
  gameId: string,
  server: any
): Promise<Response> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || session.game_id !== gameId) {
    return Response.json({ error: "Invalid session" }, { status: 401 });
  }

  const state = await gameManager.loadGameState(gameId);
  if (!state) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }

  // Mark player as connected
  await gameManager.setPlayerConnected(gameId, session.player_index, true);

  const stream = createSSEStream(gameId, session.player_index);

  const response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });

  // Disable idle timeout for SSE
  if (server && typeof server.timeout === "function") {
    server.timeout(req, 0);
  }

  // Send initial game state after a small delay to ensure stream is ready
  setTimeout(async () => {
    const currentState = await gameManager.loadGameState(gameId);
    if (currentState) {
      await broadcastGameState(currentState);
    }
  }, 100);

  return response;
}
