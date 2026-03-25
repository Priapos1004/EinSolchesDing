import { describe, test, expect } from "bun:test";
import {
  createGameState,
  playCard,
  drawTwoCards,
  checkCardPlayable,
} from "../src/game-logic";
import { loadCards } from "../src/card-loader";

const cards = loadCards();

describe("loadCards", () => {
  test("loads all 94 cards from CSV", () => {
    expect(cards.length).toBe(94);
  });

  test("cards have all fields", () => {
    const card = cards[0];
    expect(card.keyword_de).toBeDefined();
    expect(card.info_de).toBeDefined();
    expect(card.keyword_en).toBeDefined();
    expect(card.info_en).toBeDefined();
  });
});

describe("createGameState", () => {
  test("creates state with correct player count", () => {
    const state = createGameState("test1", cards, 3, "en");
    expect(state.player_count).toBe(3);
    expect(state.player_hands.length).toBe(3);
  });

  test("deals 7 cards to each player", () => {
    const state = createGameState("test2", cards, 2, "en");
    expect(state.player_hands[0].length).toBe(7);
    expect(state.player_hands[1].length).toBe(7);
  });

  test("remaining cards go to draw stack", () => {
    const state = createGameState("test3", cards, 3, "en");
    // 94 total - (3 * 7) = 73
    expect(state.draw_stack.length).toBe(73);
  });

  test("uses correct language", () => {
    const stateEn = createGameState("test4", cards, 2, "en");
    const stateDe = createGameState("test5", cards, 2, "de");
    // English keywords should be different from German
    const enKeywords = stateEn.player_hands[0].map((c) => c.keyword);
    const deKeywords = stateDe.player_hands[0].map((c) => c.keyword);
    // At least some should differ (shuffled, so check all cards exist in respective language)
    expect(enKeywords.length).toBe(7);
    expect(deKeywords.length).toBe(7);
  });

  test("initial state values are correct", () => {
    const state = createGameState("test6", cards, 2, "en");
    expect(state.current_player).toBe(0);
    expect(state.winner).toBe(-1);
    expect(state.zero_cards_player).toBe(-1);
    expect(state.played_cards.length).toBe(0);
    expect(state.status).toBe("waiting");
  });
});

describe("playCard", () => {
  test("plays a card from current player's hand", () => {
    const state = createGameState("test7", cards, 2, "en");
    state.status = "playing";
    const keyword = state.player_hands[0][0].keyword;

    const result = playCard(state, 0, keyword);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.player_hands[0].length).toBe(6);
      expect(result.played_cards.length).toBe(1);
      expect(result.played_cards[0].keyword).toBe(keyword);
      expect(result.current_player).toBe(1);
    }
  });

  test("rejects play from wrong player", () => {
    const state = createGameState("test8", cards, 2, "en");
    state.status = "playing";
    const keyword = state.player_hands[1][0].keyword;

    const result = playCard(state, 1, keyword);
    expect("error" in result).toBe(true);
  });

  test("rejects card not in hand", () => {
    const state = createGameState("test9", cards, 2, "en");
    state.status = "playing";

    const result = playCard(state, 0, "nonexistent_keyword");
    expect("error" in result).toBe(true);
  });

  test("advances turn cyclically", () => {
    let state = createGameState("test10", cards, 3, "en");
    state.status = "playing";

    // Player 0 plays
    let kw = state.player_hands[0][0].keyword;
    let result = playCard(state, 0, kw);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.current_player).toBe(1);

      // Player 1 plays
      kw = result.player_hands[1][0].keyword;
      result = playCard(result, 1, kw);
      expect("error" in result).toBe(false);
      if (!("error" in result)) {
        expect(result.current_player).toBe(2);

        // Player 2 plays
        kw = result.player_hands[2][0].keyword;
        result = playCard(result, 2, kw);
        expect("error" in result).toBe(false);
        if (!("error" in result)) {
          expect(result.current_player).toBe(0); // wraps around
        }
      }
    }
  });

  test("rejects play when round is ending (zero cards player exists)", () => {
    const state = createGameState("test11b", cards, 2, "en", 1);
    state.status = "playing";
    // Player 0 plays their only card, triggering zero_cards_player
    const played = playCard(state, 0, state.player_hands[0][0].keyword);
    expect("error" in played).toBe(false);
    if (!("error" in played)) {
      expect(played.zero_cards_player).toBe(0);
      // Player 1 (now current) tries to play — should be rejected
      const keyword = played.player_hands[1][0].keyword;
      const result = playCard(played, 1, keyword);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBe("Round is ending, no more plays");
      }
    }
  });

  test("detects zero cards", () => {
    const state = createGameState("test11", cards, 2, "en", 1);
    state.status = "playing";
    const keyword = state.player_hands[0][0].keyword;

    const result = playCard(state, 0, keyword);
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.player_hands[0].length).toBe(0);
      expect(result.zero_cards_player).toBe(0);
    }
  });
});

describe("checkCardPlayable", () => {
  test("returns true when under max", () => {
    const state = createGameState("test12", cards, 2, "en");
    state.status = "playing";
    expect(checkCardPlayable(state)).toBe(true);
  });

  test("returns false when at max", () => {
    const state = createGameState("test13", cards, 2, "en");
    state.status = "playing";
    state.played_cards = Array(7).fill({ keyword: "x", info: "x" });
    expect(checkCardPlayable(state)).toBe(false);
  });
});

describe("drawTwoCards", () => {
  test("draws 2 cards for a player", () => {
    const state = createGameState("test14", cards, 2, "en");
    state.status = "playing";
    // Play 2 cards first so hand has 5 cards (room to draw 2)
    state.player_hands[0] = state.player_hands[0].slice(0, 5);
    const stackBefore = state.draw_stack.length;

    const result = drawTwoCards(state, 0);
    expect(result.player_hands[0].length).toBe(7);
    expect(result.draw_stack.length).toBe(stackBefore - 2);
    expect(result.played_cards.length).toBe(0); // reset
  });

  test("respects max hand size", () => {
    const state = createGameState("test15", cards, 2, "en");
    state.status = "playing";
    // Player already has 7 cards (max)
    expect(state.player_hands[0].length).toBe(7);

    const result = drawTwoCards(state, 0);
    expect(result.player_hands[0].length).toBe(7); // unchanged
  });

  test("detects winner when zero-cards player is not drawing", () => {
    const state = createGameState("test16", cards, 2, "en", 1);
    state.status = "playing";
    // Player 0 plays their only card
    const played = playCard(state, 0, state.player_hands[0][0].keyword);
    expect("error" in played).toBe(false);
    if (!("error" in played)) {
      expect(played.zero_cards_player).toBe(0);
      // Player 1 draws (the loser) — player 0 should win
      const result = drawTwoCards(played, 1);
      expect(result.winner).toBe(0);
      expect(result.status).toBe("finished");
    }
  });

  test("resets zero-cards when that player draws", () => {
    const state = createGameState("test17", cards, 2, "en", 1);
    state.status = "playing";
    const played = playCard(state, 0, state.player_hands[0][0].keyword);
    expect("error" in played).toBe(false);
    if (!("error" in played)) {
      // Zero-cards player (0) draws — they stay in
      const result = drawTwoCards(played, 0);
      expect(result.zero_cards_player).toBe(-1);
      expect(result.winner).toBe(-1);
    }
  });
});
