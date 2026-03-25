---
tags: [frontend, ux, zustand, sse, vote-system, turn-indicator]
category: feature
---

# UX Feedback Improvements: Turn Indicator, Vote Result Modal, Auto-Tab Switch

**Date:** 2026-03-24

## Summary
Added three UX improvements: (1) auto-switch to "played" tab after a card is played, (2) dismissible vote result popup showing who draws cards, (3) pulsing "Your turn!" banner. Also restricted challenge initiation to current player only (backend + frontend).

## Key Decisions
- **`useIsMyTurn` selector hook over inline derivation**: Three components computed `currentPlayer === yourIndex` independently, with Game.tsx inconsistently adding a `status === "playing"` guard. Extracted to a single Zustand selector for consistency. (Rejected: adding `isMyTurn` as store state — it's derived, not source-of-truth.)
- **`voteResult` as store state, not ephemeral**: vote_result SSE event was previously discarded (`set({ activeVote: null })`). Now stored so the modal persists until user clicks OK. Used `Omit<VoteResultEvent, "type">` from shared types instead of an inline type.
- **Backend enforcement of challenge restriction**: Added server-side check (`session.player_index !== state.current_player`) in addition to frontend disabling. Never rely on frontend-only guards for game rules.

## Failed Approaches
- **Considered a shared `<ModalWrapper>` component**: Four modals share the same overlay CSS (`fixed inset-0 bg-black/60...`). Decided against extracting — the duplication is ~2 lines of Tailwind classes and each modal has different dismiss behavior (click-away vs button-only). Never do: premature abstraction for CSS-only patterns in a small component set.

## Gotchas & Learnings
- **Zustand selector for derived state**: `useGameStore((s) => s.currentPlayer === s.yourIndex)` only triggers re-renders when the boolean result changes, not when either field changes independently. This is more efficient than destructuring both fields.
- **Auto-tab switch needs a ref, not just useEffect**: Comparing `playedCards.length` to a previous value requires `useRef` to avoid switching on initial mount or when cards decrease (e.g., after a round reset). `useEffect` alone would fire on mount.
- **VoteResultEvent `cards_drawn_by` field**: The loser of a vote isn't always the target — if the vote says "valid", the challenger (initiator) draws cards. The `cards_drawn_by` field from the backend handles this correctly; don't try to derive it client-side.

## Future Work
- i18n: All new UI strings are English-only. The game supports German (`language` field exists in store) but no translation system is in place yet.
