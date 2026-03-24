import { create } from "zustand";
import type {
  GameStateEvent,
  VoteState,
  PlayerInfo,
  Card,
  SSEEvent,
} from "@esd/shared";

interface GameStore {
  // Connection state
  connected: boolean;
  setConnected: (v: boolean) => void;

  // Game state from server
  gameId: string | null;
  status: string;
  language: string;
  currentPlayer: number;
  yourIndex: number;
  players: PlayerInfo[];
  yourHand: Card[];
  playedCards: Card[];
  activeVote: VoteState | null;
  winner: { player_index: number; display_name: string } | null;

  // Handle SSE events
  handleEvent: (event: SSEEvent) => void;

  // Reset
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  gameId: null,
  status: "waiting",
  language: "en",
  currentPlayer: 0,
  yourIndex: -1,
  players: [],
  yourHand: [],
  playedCards: [],
  activeVote: null,
  winner: null,

  handleEvent: (event) => {
    switch (event.type) {
      case "game_state":
        set({
          gameId: event.game_id,
          status: event.status,
          language: event.language,
          currentPlayer: event.current_player,
          yourIndex: event.your_index,
          players: event.players,
          yourHand: event.your_hand,
          playedCards: event.played_cards,
          activeVote: event.active_vote,
          connected: true,
        });
        break;

      case "player_joined":
        set((state) => ({
          players: [
            ...state.players.filter((p) => p.index !== event.player_index),
            {
              index: event.player_index,
              name: event.display_name,
              card_count: 0,
              connected: true,
            },
          ].sort((a, b) => a.index - b.index),
        }));
        break;

      case "vote_started":
        set({
          activeVote: {
            initiator: event.initiator,
            target: event.target,
            target_name: event.target_name,
            votes_yes: [],
            votes_no: [],
            votes_needed: 0,
          },
        });
        break;

      case "vote_update":
        set((state) => ({
          activeVote: state.activeVote
            ? {
                ...state.activeVote,
                votes_yes: Array(event.votes_yes).fill(0),
                votes_no: Array(event.votes_no).fill(0),
                votes_needed: event.votes_needed,
              }
            : null,
        }));
        break;

      case "vote_result":
        set({ activeVote: null });
        break;

      case "winner":
        set({
          winner: {
            player_index: event.player_index,
            display_name: event.display_name,
          },
        });
        break;
    }
  },

  reset: () =>
    set({
      connected: false,
      gameId: null,
      status: "waiting",
      language: "en",
      currentPlayer: 0,
      yourIndex: -1,
      players: [],
      yourHand: [],
      playedCards: [],
      activeVote: null,
      winner: null,
    }),
}));
