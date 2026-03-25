import { config } from "./config";
import { handleAdminLogin, handleCreateGame } from "./routes/admin";
import {
  handleGameInfo,
  handleJoinGame,
  handlePlayCard,
  handleVoteStart,
  handleVoteCast,
} from "./routes/game";
import { handleSSE } from "./routes/events";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = Bun.serve({
  port: config.port,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      let response: Response;

      // Route matching
      if (method === "POST" && path === "/api/admin/login") {
        response = await handleAdminLogin(req);
      } else if (method === "POST" && path === "/api/admin/games") {
        response = await handleCreateGame(req);
      } else {
        // Extract game ID from path: /api/games/:id/...
        const gameMatch = path.match(/^\/api\/games\/([^/]+)\/(.+)$/);
        if (gameMatch) {
          const gameId = gameMatch[1];
          const action = gameMatch[2];

          if (method === "GET" && action === "info") {
            response = await handleGameInfo(req, gameId);
          } else if (method === "POST" && action === "join") {
            response = await handleJoinGame(req, gameId);
          } else if (method === "GET" && action === "events") {
            response = await handleSSE(req, gameId, server);
            // SSE responses handle their own headers
            return response;
          } else if (method === "POST" && action === "play") {
            response = await handlePlayCard(req, gameId);
          } else if (method === "POST" && action === "vote/start") {
            response = await handleVoteStart(req, gameId);
          } else if (method === "POST" && action === "vote/cast") {
            response = await handleVoteCast(req, gameId);
          } else {
            response = Response.json(
              { error: "Not found" },
              { status: 404 }
            );
          }
        } else {
          response = Response.json(
            { error: "Not found" },
            { status: 404 }
          );
        }
      }

      // Add CORS headers to all responses
      const newHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        newHeaders.set(key, value);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (err) {
      console.error("Request error:", err);
      return Response.json(
        { error: "Internal server error" },
        { status: 500, headers: CORS_HEADERS }
      );
    }
  },
});

console.log(`EinSolchesDing backend running on port ${config.port}`);
