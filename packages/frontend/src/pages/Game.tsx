import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore, useIsMyTurn, usePrevPlayerName } from "../store/gameStore";
import { connectSSE } from "../api/sse";
import { getSessionToken, getInviteToken } from "../api/http";
import PlayerTabs from "../components/PlayerTabs";
import CardList from "../components/CardList";
import ActionBar from "../components/ActionBar";
import VoteModal from "../components/VoteModal";
import VoteResultModal from "../components/VoteResultModal";
import WinnerModal from "../components/WinnerModal";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

function WarningBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 text-destructive py-2.5 px-4 rounded-lg mb-3 text-sm font-medium animate-fade-in">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { status, zeroCardsPlayer, yourIndex, playedCards, maxCards, activeVote } = useGameStore();
  const isMyTurn = useIsMyTurn();
  const prevPlayerName = usePrevPlayerName();
  const maxCardsReached = playedCards.length >= maxCards && !activeVote && !zeroCardsPlayer;
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!gameId) return;

    const sessionToken = getSessionToken(gameId);
    if (!sessionToken) {
      const inviteToken = getInviteToken(gameId);
      const query = inviteToken ? `?token=${inviteToken}` : "";
      navigate(`/join/${gameId}${query}`);
      return;
    }

    const { handleEvent, reset } = useGameStore.getState();
    cleanupRef.current = connectSSE(gameId, sessionToken, handleEvent);

    return () => {
      cleanupRef.current?.();
      reset();
    };
  }, [gameId]);

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
    <div
      className={cn(
        "max-w-lg mx-auto p-4 pb-24 min-h-dvh animate-fade-in rounded-lg",
        isMyTurn && !zeroCardsPlayer && "animate-pulse-border"
      )}
    >
      <h1 className="text-xl font-bold text-center mb-4 tracking-tight">EinSolchesDing</h1>

      {zeroCardsPlayer && zeroCardsPlayer.player_index !== yourIndex && (
        <WarningBanner>
          {isMyTurn
            ? `You must challenge ${zeroCardsPlayer.display_name} as they have no more cards`
            : `${zeroCardsPlayer.display_name} has no more cards`}
        </WarningBanner>
      )}

      {maxCardsReached && (
        <WarningBanner>
          {isMyTurn
            ? `You must challenge ${prevPlayerName} as ${maxCards} cards have been played`
            : `Maximum cards played (${maxCards}). Waiting for challenge...`}
        </WarningBanner>
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
