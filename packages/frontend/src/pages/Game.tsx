import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore, useIsMyTurn } from "../store/gameStore";
import { connectSSE } from "../api/sse";
import { getSessionToken } from "../api/http";
import PlayerTabs from "../components/PlayerTabs";
import CardList from "../components/CardList";
import ActionBar from "../components/ActionBar";
import VoteModal from "../components/VoteModal";
import VoteResultModal from "../components/VoteResultModal";
import WinnerModal from "../components/WinnerModal";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { status, handleEvent, reset, zeroCardsPlayer, yourIndex } = useGameStore();
  const isMyTurn = useIsMyTurn();
  const cleanupRef = useRef<(() => void) | null>(null);
  const prevTurnRef = useRef(false);

  useEffect(() => {
    if (!gameId) return;

    const sessionToken = getSessionToken(gameId);
    if (!sessionToken) {
      navigate(`/join/${gameId}`);
      return;
    }

    cleanupRef.current = connectSSE(gameId, sessionToken, handleEvent);

    return () => {
      cleanupRef.current?.();
      reset();
    };
  }, [gameId]);

  // Toast notification when it becomes your turn
  useEffect(() => {
    if (isMyTurn && !prevTurnRef.current) {
      toast("Your turn!", {
        icon: <Zap className="h-4 w-4 text-primary" />,
        duration: 3000,
      });
    }
    prevTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  if (!gameId) return null;

  if (status === "waiting") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card border border-border p-8 rounded-xl shadow-2xl text-center space-y-5 max-w-sm w-full animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight">Waiting for players...</h1>
          <PlayerTabs />
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Game starts when all players have joined</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24 min-h-screen animate-fade-in">
      <h1 className="text-xl font-bold text-center mb-4 tracking-tight">EinSolchesDing</h1>

      {zeroCardsPlayer && zeroCardsPlayer.player_index !== yourIndex && (
        <div className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 text-destructive py-2.5 px-4 rounded-lg mb-3 text-sm font-medium animate-fade-in">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {zeroCardsPlayer.display_name} has no cards left. You have to challenge!
        </div>
      )}

      {isMyTurn && !zeroCardsPlayer && (
        <div className="flex items-center justify-center gap-2 bg-primary/15 border border-primary/30 text-primary py-2.5 px-4 rounded-lg mb-3 animate-fade-in">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-semibold">Your turn!</span>
        </div>
      )}

      <PlayerTabs />
      <CardList gameId={gameId} />
      <ActionBar gameId={gameId} />
      <VoteModal gameId={gameId} />
      <VoteResultModal />
      <WinnerModal />
    </div>
  );
}
