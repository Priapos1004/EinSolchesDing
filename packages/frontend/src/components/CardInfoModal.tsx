import { useState } from "react";
import type { Card } from "@esd/shared";
import { playCardAction, getSessionToken } from "../api/http";

interface Props {
  card: Card;
  canPlay: boolean;
  gameId: string;
  onClose: () => void;
}

export default function CardInfoModal({
  card,
  canPlay,
  gameId,
  onClose,
}: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    const sessionToken = getSessionToken(gameId);
    if (!sessionToken) return;

    setLoading(true);
    setError("");
    try {
      await playCardAction(gameId, sessionToken, card.keyword);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to play card");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl p-6 max-w-sm w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-amber-400">{card.keyword}</h2>
        <p className="text-gray-300">{card.info}</p>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          {canPlay && (
            <button
              onClick={handlePlay}
              disabled={loading}
              className="flex-1 p-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Playing..." : "Play Card"}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
