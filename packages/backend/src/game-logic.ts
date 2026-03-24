import type { Card, CardBilingual, Language } from "@esd/shared";

export interface GameState {
  game_id: string;
  player_count: number;
  language: Language;
  status: "waiting" | "playing" | "finished";
  current_player: number;
  max_cards: number;
  zero_cards_player: number; // -1 if none
  winner: number; // -1 if none
  player_hands: Card[][]; // one array of cards per player
  played_cards: Card[];
  draw_stack: Card[];
}

export function createGameState(
  gameId: string,
  allCards: CardBilingual[],
  playerCount: number,
  language: Language,
  startCards: number = 7
): GameState {
  // Shuffle cards
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);

  // Select language
  const cards: Card[] = shuffled.map((c) => ({
    keyword: language === "de" ? c.keyword_de : c.keyword_en,
    info: language === "de" ? c.info_de : c.info_en,
  }));

  // Deal hands
  const player_hands: Card[][] = [];
  for (let i = 0; i < playerCount; i++) {
    player_hands.push(cards.slice(i * startCards, (i + 1) * startCards));
  }

  // Remaining cards are the draw stack
  const draw_stack = cards.slice(playerCount * startCards);

  return {
    game_id: gameId,
    player_count: playerCount,
    language,
    status: "waiting",
    current_player: 0,
    max_cards: 7,
    zero_cards_player: -1,
    winner: -1,
    player_hands,
    played_cards: [],
    draw_stack,
  };
}

export function checkCardPlayable(state: GameState): boolean {
  return state.played_cards.length + 1 <= state.max_cards;
}

export function playCard(
  state: GameState,
  playerIndex: number,
  keyword: string
): GameState | { error: string } {
  if (state.status !== "playing") {
    return { error: "Game is not in progress" };
  }
  if (playerIndex !== state.current_player) {
    return { error: "Not your turn" };
  }
  if (!checkCardPlayable(state)) {
    return { error: "Maximum cards played this round" };
  }
  if (state.zero_cards_player !== -1) {
    return { error: "Round is ending, no more plays" };
  }

  const hand = state.player_hands[playerIndex];
  const cardIdx = hand.findIndex((c) => c.keyword === keyword);
  if (cardIdx === -1) {
    return { error: "Card not in your hand" };
  }

  const card = hand[cardIdx];
  const newHand = [...hand.slice(0, cardIdx), ...hand.slice(cardIdx + 1)];
  const newHands = [...state.player_hands];
  newHands[playerIndex] = newHand;

  const newState: GameState = {
    ...state,
    player_hands: newHands,
    played_cards: [...state.played_cards, card],
    current_player: (state.current_player + 1) % state.player_count,
    zero_cards_player: newHand.length === 0 ? playerIndex : state.zero_cards_player,
  };

  return newState;
}

export function drawTwoCards(
  state: GameState,
  playerIndex: number
): GameState {
  const hand = [...state.player_hands[playerIndex]];
  const drawStack = [...state.draw_stack];
  const maxCards = state.max_cards;

  // Draw up to 2 cards respecting max hand size
  const canDraw = Math.min(2, maxCards - hand.length, drawStack.length);
  for (let i = 0; i < canDraw; i++) {
    hand.push(drawStack.shift()!);
  }

  const newHands = [...state.player_hands];
  newHands[playerIndex] = hand;

  let winner = state.winner;
  let zeroCardsPlayer = state.zero_cards_player;

  // Win detection
  if (zeroCardsPlayer !== -1) {
    if (playerIndex !== zeroCardsPlayer) {
      // Someone else is drawing → zero-cards player wins
      winner = zeroCardsPlayer;
    } else {
      // Zero-cards player is drawing → they stay in
      zeroCardsPlayer = -1;
    }
  }

  return {
    ...state,
    player_hands: newHands,
    draw_stack: drawStack,
    played_cards: [], // Reset played cards after draw
    winner,
    zero_cards_player: zeroCardsPlayer,
    status: winner !== -1 ? "finished" : state.status,
  };
}
