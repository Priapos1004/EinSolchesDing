import { useState, useEffect, useRef } from "react";
import { useGameStore, useIsMyTurn } from "../store/gameStore";
import Card from "./Card";
import CardInfoModal from "./CardInfoModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hand, Layers } from "lucide-react";
import type { Card as CardType } from "@esd/shared";

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Layers className="h-8 w-8 mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

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

  return (
    <div>
      <Tabs value={view} onValueChange={(v) => setView(v as "hand" | "played")}>
        <TabsList>
          <TabsTrigger value="hand">
            <Hand className="h-4 w-4 shrink-0 mr-1.5" />
            Your Hand ({yourHand.length})
          </TabsTrigger>
          <TabsTrigger value="played">
            <Layers className="h-4 w-4 shrink-0 mr-1.5" />
            Played ({playedCards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hand">
          <div className="space-y-2">
            {yourHand.length === 0 ? (
              <EmptyState text="No cards in hand" />
            ) : (
              yourHand.map((card) => (
                <Card
                  key={card.keyword}
                  card={card}
                  onClick={() => setSelectedCard(card)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="played">
          <div className="space-y-2">
            {playedCards.length === 0 ? (
              <EmptyState text="No cards played yet" />
            ) : (
              playedCards.map((card) => (
                <Card
                  key={card.keyword}
                  card={card}
                  onClick={() => setSelectedCard(card)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

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
