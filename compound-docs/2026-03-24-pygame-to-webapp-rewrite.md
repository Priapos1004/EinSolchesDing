---
tags: [bun, react, redis, sse, docker, game-logic-port, monorepo]
category: architecture
---

# Pygame to Bun/React Web App Rewrite

**Date:** 2026-03-24

## Summary
Rewrote a local Pygame card game into a multiplayer web app using Bun.serve(), React, Redis, and SSE. Deployed as 3-container Docker Compose stack. Game logic ported from Python class to pure TypeScript functions.

## Failed Approaches
- **Bun workspace install without all package.json files**: Docker build failed because `bun install` requires every workspace listed in root `package.json` to exist. Never do: copy only the packages you need — always copy all workspace `package.json` files even in partial Dockerfiles.
- **Tailwind v4 without `@tailwindcss/postcss`**: Vite build failed. Tailwind v4 moved to `@import "tailwindcss"` in CSS + `@tailwindcss/postcss` plugin. Never do: assume `tailwindcss` alone is sufficient in devDependencies for v4.
- **Test assuming drawTwoCards ignores max hand size**: Game logic respects `max_cards=7` ceiling. A player with 7 cards draws 0. Tests must account for hand size constraints.

## Key Decisions
- **SSE over WebSockets**: Turn-based game only needs server push + REST POST for actions. SSE is simpler to debug, proxy (nginx), and reconnect (EventSource auto-reconnects). Rejected: WebSockets (unnecessary bidirectional complexity).
- **Redis over PostgreSQL**: Game state is ephemeral (24h TTL). No user accounts, no persistent data. Bun has a built-in Redis client. Rejected: SQLite/Postgres (overkill for throwaway game sessions).
- **Admins via .env, not DB**: No registration flow needed. `.env` defines credentials, JWT on login. Rejected: user table + bcrypt (unnecessary for 1-2 admins).
- **Pure functions for game logic**: `game-logic.ts` has zero side effects — takes state, returns new state. `game-manager.ts` handles Redis I/O separately. This made unit testing trivial (18 tests, no mocks).
- **Per-player tailored SSE**: Each player's `game_state` event contains only their hand. Opponent card counts visible, keywords hidden. Privacy enforced server-side.

## Gotchas & Learnings
- Bun.serve() has a 10-second idle timeout that kills SSE connections. Must call `server.timeout(req, 0)` for SSE endpoints.
- nginx needs `proxy_buffering off` + `proxy_cache off` + empty `Connection` header for SSE to stream through. Without this, events are buffered until the connection closes.
- Bun's built-in `redis` client reads `REDIS_URL` from env automatically — no config needed beyond setting the env var in Docker Compose.
- CSV parsing: the original Python code used pandas for a 94-row CSV. Stdlib string splitting is sufficient and removes a heavy dependency.
- Vote mechanic with 2 players is effectively identical to the original single-player "loser" decision — only 1 non-target voter, their vote decides immediately.

## Future Work
- Player reconnection: SSE auto-reconnects but the `connected` flag in Redis isn't updated on disconnect (no cleanup handler yet)
- No admin game listing/deletion UI — only create + share link
- No rate limiting on API endpoints
