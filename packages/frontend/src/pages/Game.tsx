import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { connectSSE } from "../api/sse";
import { getSessionToken } from "../api/http";
import PlayerTabs from "../components/PlayerTabs";
import CardList from "../components/CardList";
import ActionBar from "../components/ActionBar";
import VoteModal from "../components/VoteModal";
import WinnerModal from "../components/WinnerModal";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { status, handleEvent, reset } = useGameStore();
  const cleanupRef = useRef<(() => void) | null>(null);

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

  if (!gameId) return null;

  if (status === "waiting") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center space-y-4">
          <h1 className="text-2xl font-bold">Waiting for players...</h1>
          <PlayerTabs />
          <div className="animate-pulse text-gray-400">
            Game starts when all players have joined
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 pb-24 min-h-screen">
      <h1 className="text-xl font-bold text-center mb-4">EinSolchesDing</h1>
      <PlayerTabs />
      <CardList gameId={gameId} />
      <ActionBar gameId={gameId} />
      <VoteModal gameId={gameId} />
      <WinnerModal />
    </div>
  );
}
