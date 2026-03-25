---
tags: [security, reliability, performance, maintainability, quality-review]
category: review
---

# PR Quality Review: new-version branch

**Date:** 2026-03-25

## Summary
ISO 25010 quality review of the full pygame-to-webapp rewrite. Fixed vote endpoint auth gaps and unused imports. Documented structural issues (Redis data model, N+1 queries) as future work.

## Fixes Applied
- Vote cast endpoint: added missing `game_id` session check (cross-game vote injection)
- Vote start endpoint: added `game_id` check + `status === "playing"` guard
- Removed unused `getConnectedPlayers` import in events.ts

## Known Issues (Future Work)

### Redis Data Model
- Player hands and played cards stored as Redis hashes lose ordering and would silently drop duplicate keywords. Should migrate to Redis lists (like draw_stack already uses).
- Sequential Redis calls in save/load create N+1 patterns (~24 round-trips for 6-player save). Should use `Promise.all` for parallelism.

### Security (acceptable for ephemeral game)
- Rejoin by display name allows impersonation if invite token is known. Acceptable tradeoff for rejoin UX.
- SSE token in URL query string (EventSource API limitation). Mitigate with short-lived SSE tickets if needed.
- Wildcard CORS — should restrict to frontend domain in production.
- Admin password comparison uses `===` (timing attack surface). Low risk for single admin account.

### Reliability
- Race condition on concurrent joins (same playerIndex). Low probability for small games.
- `saveGameState` is non-atomic — partial Redis failure leaves inconsistent state. Use MULTI/EXEC.
- SSE reconnect broadcasts to all players, not just the reconnecting one.

## Key Decision
- localStorage over sessionStorage for game sessions — rejoin reliability after tab close is more important than tab isolation.
