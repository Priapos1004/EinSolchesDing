import { useState, useEffect, useRef } from "react";
import { useGameStore, useIsMyTurn } from "../store/gameStore";
import Card from "./Card";
import CardInfoModal from "./CardInfoModal";
import type { Card as CardType } from "@esd/shared";

interface Props {
  gameId: string;
}

export default function CardList({ gameId }: Props) {
  const { yourHand, playedCards } = useGameStore();
  const isMyTurn = useIsMyTurn();
  const [view, setView] = useState<"hand" | "played">("hand");
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const prevPlayedCount = useRef(playedCards.length);

  // Auto-switch to "played" tab when a new card is played
  useEffect(() => {
    if (playedCards.length > prevPlayedCount.current) {
      setView("played");
    }
    prevPlayedCount.current = playedCards.length;
  }, [playedCards.length]);

  const cards = view === "hand" ? yourHand : playedCards;

  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setView("hand")}
          className={`flex-1 py-2 rounded font-medium text-sm transition ${
            view === "hand"
              ? "bg-amber-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Your Hand ({yourHand.length})
        </button>
        <button
          onClick={() => setView("played")}
          className={`flex-1 py-2 rounded font-medium text-sm transition ${
            view === "played"
              ? "bg-amber-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          Played ({playedCards.length})
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {cards.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">
            {view === "hand" ? "No cards in hand" : "No cards played yet"}
          </p>
        ) : (
          cards.map((card) => (
            <Card
              key={card.keyword}
              card={card}
              onClick={() => setSelectedCard(card)}
            />
          ))
        )}
      </div>

      {/* Card info modal */}
      {selectedCard && (
        <CardInfoModal
          card={selectedCard}
          canPlay={view === "hand" && isMyTurn}
          gameId={gameId}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
