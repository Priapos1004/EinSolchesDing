---
tags: [frontend, backend, ux, confetti, voting, rejoin, session-storage, canvas-confetti]
category: feature
---

# Playtest Feedback Round 2: Rejoin Fix, Vote Privacy, Loser Confetti

**Date:** 2026-03-24

## Summary
Five improvements from user testing: (1) sessionStorage to localStorage for reliable rejoin, (2) stronger pulse-border turn indicator, (3) random starting player, (4) hide live vote split to prevent influence, (5) loser confetti with emoji shapes.

## Key Decisions
- **localStorage over sessionStorage for game sessions**: sessionStorage was originally chosen for multi-tab debugging (separate sessions per tab). Switched because tab crash/close made rejoin impossible — "game is full" error with no way to recover. Rejoin reliability outweighs debugging convenience. (Rejected: keeping sessionStorage with a cookie fallback — overcomplicated for ephemeral game state.)
- **Hide live vote tally during voting**: VoteModal previously showed thumbs-up/down counts in real-time. This influenced voters. Changed to show only "X / Y voted" during voting; the yes/no split is revealed only in VoteResultModal after all votes are in. Required adding `votes_yes`/`votes_no` counts to `VoteResultEvent` (shared types + backend broadcast + store + modal).
- **`shapeFromText` at module top-level**: canvas-confetti's `shapeFromText` creates an offscreen canvas. Called at import time since this is a Vite SPA (no SSR risk) and avoids recreating shapes per burst. If SSR is ever added, this will need lazy initialization.

## Failed Approaches
- **Initial confetti implementation duplicated the entire RAF loop**: `fireLoserConfetti` was a copy-paste of `fireConfetti` with different options. Caught in code review and extracted to `fireConfettiLoop(options)` — a shared helper that both functions wrap. Never do: copy-paste animation loops when only the payload differs.
- **`shapeFromText` as named ESM import**: `import { shapeFromText } from "canvas-confetti"` compiles locally but fails in Vite/Rollup production build — `shapeFromText` is not a named export from the ESM bundle. Must use `confetti.shapeFromText` (same for `confetti.Options` type). Never do: assume TypeScript type definitions match the actual ESM exports of a library.
- **Vote "0/0 voted" on modal open**: `votes_needed` was only sent in `vote_update` events, not `vote_started`. The store initialized it to `0`, so the modal showed "0 / 0 voted" until the first vote came in. Fix: include `votes_needed` in `vote_started` event (backend + shared types + store).

## Gotchas & Learnings
- **Backend rejoin only matches by `display_name`**: The rejoin path (`routes/game.ts` lines 62-69) finds returning players by exact name match when the game is full. This means two players with the same name would collide. localStorage makes this path less critical (token persists), but the name-matching fallback is fragile.
- **`canvas-confetti` emoji shapes**: Use `confetti.shapeFromText({ text: '...', scalar: N })` and pass `scalar` to both the shape constructor AND the `confetti()` call. Missing the scalar on either side produces incorrectly sized particles. For bigger/slower emojis: increase `scalar` (4), lower `gravity` (0.6), increase `ticks` (300), reduce `particleCount` (1).
- **Random starting player is one line**: `state.current_player = Math.floor(Math.random() * state.player_count)` at game start. Turn order still advances sequentially from the random start — no need to shuffle player indices.
- **CSS animation tuning is iterative**: Pulse-border went through three iterations (original 15%/40% → 25%/55% → 20%/40%). Best to start with a moderate increase and adjust from user feedback rather than going big immediately.

## Future Work
- Rejoin could use a persistent player ID (e.g., stored alongside session token in localStorage) instead of relying on display_name matching as fallback.
- i18n: "X / Y voted" string in VoteModal is English-only. See prior doc on missing translations.
