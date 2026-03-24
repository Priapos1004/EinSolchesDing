import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { castVote } from "../api/http";

interface Props {
  gameId: string;
}

export default function VoteModal({ gameId }: Props) {
  const { activeVote, yourIndex } = useGameStore();
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!activeVote) return null;

  const isTarget = yourIndex === activeVote.target;
  const yesCount = activeVote.votes_yes.length;
  const noCount = activeVote.votes_no.length;

  const handleVote = async (valid: boolean) => {
    const sessionToken = localStorage.getItem(`session_${gameId}`);
    if (!sessionToken) return;

    setLoading(true);
    try {
      await castVote(gameId, sessionToken, valid);
      setVoted(true);
    } catch {
      // Vote may have been resolved already
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full space-y-4 text-center">
        <h2 className="text-lg font-bold">
          Was {activeVote.target_name}'s answer valid?
        </h2>

        {/* Vote tally */}
        <div className="flex justify-center gap-6 text-sm">
          <span className="text-green-400">Yes: {yesCount}</span>
          <span className="text-red-400">No: {noCount}</span>
        </div>

        {isTarget ? (
          <p className="text-gray-400">
            You are being challenged. Waiting for votes...
          </p>
        ) : voted ? (
          <p className="text-gray-400">Vote cast. Waiting for others...</p>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={loading}
              className="flex-1 p-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50 transition"
            >
              Yes, valid
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={loading}
              className="flex-1 p-3 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50 transition"
            >
              No, invalid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
