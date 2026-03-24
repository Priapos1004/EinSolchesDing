// Card data
export interface Card {
  keyword: string;
  info: string;
}

export interface CardBilingual {
  keyword_de: string;
  info_de: string;
  keyword_en: string;
  info_en: string;
}

// Game configuration
export type Language = "de" | "en";
export type GameStatus = "waiting" | "playing" | "finished";

// Player info
export interface PlayerInfo {
  index: number;
  name: string;
  card_count: number;
  connected: boolean;
}

// Vote state
export interface VoteState {
  initiator: number;
  target: number;
  target_name: string;
  votes_yes: number[];
  votes_no: number[];
  votes_needed: number;
}

// Game state sent to each player (tailored)
export interface GameStateEvent {
  type: "game_state";
  game_id: string;
  status: GameStatus;
  language: Language;
  current_player: number;
  your_index: number;
  players: PlayerInfo[];
  your_hand: Card[];
  played_cards: Card[];
  active_vote: VoteState | null;
  winner: { player_index: number; display_name: string } | null;
  zero_cards_player: { player_index: number; display_name: string } | null;
}

// SSE events server → client
export interface PlayerJoinedEvent {
  type: "player_joined";
  player_index: number;
  display_name: string;
}

export interface VoteStartedEvent {
  type: "vote_started";
  initiator: number;
  target: number;
  target_name: string;
}

export interface VoteUpdateEvent {
  type: "vote_update";
  votes_yes: number;
  votes_no: number;
  votes_needed: number;
}

export interface VoteResultEvent {
  type: "vote_result";
  valid: boolean;
  target: number;
  cards_drawn_by: number;
}

export interface WinnerEvent {
  type: "winner";
  player_index: number;
  display_name: string;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type SSEEvent =
  | GameStateEvent
  | PlayerJoinedEvent
  | VoteStartedEvent
  | VoteUpdateEvent
  | VoteResultEvent
  | WinnerEvent
  | ErrorEvent;

// REST request/response types
export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
}

export interface CreateGameRequest {
  player_count: number;
  language: Language;
}

export interface CreateGameResponse {
  game_id: string;
  invite_token: string;
  invite_url: string;
}

export interface GameInfoResponse {
  game_id: string;
  player_count: number;
  language: Language;
  joined_count: number;
  players: { index: number; name: string }[];
}

export interface JoinGameRequest {
  token: string;
  display_name: string;
}

export interface JoinGameResponse {
  player_id: string;
  player_index: number;
  session_token: string;
}

export interface PlayCardRequest {
  keyword: string;
}

export interface CastVoteRequest {
  valid: boolean;
}
