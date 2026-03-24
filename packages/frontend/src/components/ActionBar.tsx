import { useState } from "react";
import { useGameStore, useIsMyTurn } from "../store/gameStore";
import { startVote, getSessionToken } from "../api/http";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  gameId: string;
}

export default function ActionBar({ gameId }: Props) {
  const { playedCards, activeVote, players, currentPlayer } = useGameStore();
  const isMyTurn = useIsMyTurn();
  const [loading, setLoading] = useState(false);

  const canChallenge = playedCards.length > 0 && !activeVote && isMyTurn;

  const prevPlayerIndex = (currentPlayer - 1 + players.length) % players.length;
  const prevPlayerName = players.find((p) => p.index === prevPlayerIndex)?.name ?? "?";

  const handleChallenge = async () => {
    const sessionToken = getSessionToken(gameId);
    if (!sessionToken) return;

    setLoading(true);
    try {
      await startVote(gameId, sessionToken);
    } catch (err: any) {
      toast.error(err.message || "Failed to start vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-slide-up">
      <div className="max-w-lg mx-auto">
        <Button
          onClick={handleChallenge}
          disabled={!canChallenge || loading}
          variant="destructive"
          size="lg"
          className="w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ShieldAlert className="h-4 w-4 shrink-0" />
          )}
          {loading ? "Starting vote..." : `Challenge ${prevPlayerName}`}
        </Button>
      </div>
    </div>
  );
}
