import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getGameInfo, joinGame } from "../api/http";

export default function JoinGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [gameInfo, setGameInfo] = useState<{
    player_count: number;
    language: string;
    joined_count: number;
    players: { index: number; name: string }[];
  } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!gameId || !inviteToken) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }
    getGameInfo(gameId, inviteToken)
      .then((info) => {
        setGameInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load game");
        setLoading(false);
      });
  }, [gameId, inviteToken]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !displayName.trim()) return;
    setJoining(true);
    setError("");
    try {
      const result = await joinGame(gameId, inviteToken, displayName.trim());
      localStorage.setItem(`session_${gameId}`, result.session_token);
      localStorage.setItem(`playerIndex_${gameId}`, String(result.player_index));
      navigate(`/game/${gameId}`);
    } catch (err: any) {
      setError(err.message || "Failed to join");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">EinSolchesDing</h1>
        <p className="text-gray-400 text-center text-sm">Join Game</p>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {gameInfo && (
          <>
            <div className="bg-gray-700 p-4 rounded space-y-2 text-sm">
              <p>
                Language:{" "}
                <span className="text-amber-400">
                  {gameInfo.language === "de" ? "Deutsch" : "English"}
                </span>
              </p>
              <p>
                Players:{" "}
                <span className="text-amber-400">
                  {gameInfo.joined_count} / {gameInfo.player_count}
                </span>
              </p>
              {gameInfo.players.length > 0 && (
                <p>
                  Joined:{" "}
                  <span className="text-gray-300">
                    {gameInfo.players.map((p) => p.name).join(", ")}
                  </span>
                </p>
              )}
            </div>

            {gameInfo.joined_count < gameInfo.player_count ? (
              <form onSubmit={handleJoin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
                  required
                  maxLength={20}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={joining || !displayName.trim()}
                  className="w-full p-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50 transition"
                >
                  {joining ? "Joining..." : "Join Game"}
                </button>
              </form>
            ) : (
              <p className="text-center text-yellow-400">Game is full</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
