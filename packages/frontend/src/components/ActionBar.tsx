import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { startVote, getSessionToken } from "../api/http";

interface Props {
  gameId: string;
}

export default function ActionBar({ gameId }: Props) {
  const { playedCards, activeVote } = useGameStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canChallenge = playedCards.length > 0 && !activeVote;

  const handleChallenge = async () => {
    const sessionToken = getSessionToken(gameId);
    if (!sessionToken) return;

    setLoading(true);
    setError("");
    try {
      await startVote(gameId, sessionToken);
    } catch (err: any) {
      setError(err.message || "Failed to start vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
      <div className="max-w-lg mx-auto">
        {error && (
          <div className="bg-red-900/50 text-red-300 p-2 rounded text-sm mb-2">
            {error}
          </div>
        )}
        <button
          onClick={handleChallenge}
          disabled={!canChallenge || loading}
          className="w-full p-3 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50 transition"
        >
          {loading ? "Starting vote..." : "Challenge (Was the answer valid?)"}
        </button>
      </div>
    </div>
  );
}
