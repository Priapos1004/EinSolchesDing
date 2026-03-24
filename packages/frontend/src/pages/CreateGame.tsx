import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api/http";

export default function CreateGame() {
  const [playerCount, setPlayerCount] = useState(2);
  const [language, setLanguage] = useState<"de" | "en">("de");
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");
  if (!token) {
    navigate("/admin/login");
    return null;
  }

  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await createGame(token, playerCount, language);
      // Build a proper invite URL using the current browser origin
      const url = `${window.location.origin}/join/${result.game_id}?token=${result.invite_token}`;
      setInviteUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Create Game</h1>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {!inviteUrl ? (
          <>
            {/* Player count */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Players</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                  className="w-10 h-10 bg-gray-700 rounded text-xl hover:bg-gray-600 transition"
                  disabled={playerCount <= 2}
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">
                  {playerCount}
                </span>
                <button
                  onClick={() => setPlayerCount(Math.min(5, playerCount + 1))}
                  className="w-10 h-10 bg-gray-700 rounded text-xl hover:bg-gray-600 transition"
                  disabled={playerCount >= 5}
                >
                  +
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">Language</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage("de")}
                  className={`flex-1 p-3 rounded font-semibold transition ${
                    language === "de"
                      ? "bg-amber-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Deutsch
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 p-3 rounded font-semibold transition ${
                    language === "en"
                      ? "bg-amber-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full p-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Creating..." : "Create Game"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-green-400 text-center">Game created!</p>
            <p className="text-gray-400 text-sm text-center">
              Share this link with {playerCount} players:
            </p>
            <div className="bg-gray-700 p-3 rounded text-sm break-all select-all">
              {inviteUrl}
            </div>
            <button
              onClick={copyLink}
              className="w-full p-3 bg-amber-600 hover:bg-amber-700 rounded font-semibold transition"
            >
              Copy Link
            </button>
            <button
              onClick={() => setInviteUrl("")}
              className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition"
            >
              Create Another Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
