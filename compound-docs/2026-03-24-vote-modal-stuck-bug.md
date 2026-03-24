---
tags: [react, zustand, useState, sse, voting, 2-player]
category: bugfix
---

# VoteModal Stuck on Second Challenge (2-Player Games)

**Date:** 2026-03-24

## Summary
VoteModal became permanently stuck after the first challenge in 2-player games. The `voted` useState persisted `true` across vote sessions because the component never unmounts — it returns `null` when inactive but stays in the React tree, preserving state.

## Failed Approaches
- **Assuming conditional `return null` resets state**: A React component that returns `null` does NOT unmount — hooks and state survive. Never do: assume `if (!x) return null` at the top of a component resets `useState`. The component must actually leave the tree (e.g., via a `key` change or conditional rendering in the parent).

## Key Decisions
- **useEffect reset over key prop**: Added `useEffect` watching `[activeVote?.target, activeVote?.initiator]` to reset `voted`. Alternative: use `key={...}` on `<VoteModal>` in parent to force remount. Chose useEffect because it's self-contained (no parent changes needed) and the deps naturally transition through `undefined` when `activeVote` becomes `null` between votes, so same-player re-challenges still trigger the reset.
- **Extracted `getSessionToken`/`setSessionToken` helpers**: Four components had identical `sessionStorage.getItem(\`session_${gameId}\`)` calls. Centralized in `api/http.ts` so the key format and storage mechanism are defined once.

## Gotchas & Learnings
- In a 2-player game, `votes_needed = 1` (only the non-target player votes). If that one voter's UI is broken, the game deadlocks with no recovery path.
- Optional chaining in useEffect deps (`activeVote?.target`) is safe: when `activeVote` is `null`, it evaluates to `undefined`, and React's `Object.is` comparison correctly detects the transition `number → undefined → number`.
- The Zustand store's `vote_update` handler uses `Array(count).fill(0)` — vote tallies are anonymous counts, not player indices. This means "has this player voted?" cannot be derived from store state; local `voted` state is necessary.
- `game_state` SSE event does not include winner info. On reconnect after a game ends, `status` will be `"finished"` but the winner banner won't show. Pre-existing issue, not addressed here.

## Future Work
- Add `winner` field to `GameStateEvent` so reconnecting players see the winner
- Consider adding a vote ID to `VoteState` for more robust vote-session tracking
