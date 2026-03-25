import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getGameInfo, joinGame, setSessionToken, setInviteToken } from "../api/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, Loader2, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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

    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchInfo = () => {
      getGameInfo(gameId, inviteToken)
        .then((info) => {
          setGameInfo((prev) => {
            if (prev && prev.joined_count === info.joined_count) return prev;
            return info;
          });
          setLoading((v) => v ? false : v);
          if (info.joined_count >= info.player_count && interval) {
            clearInterval(interval);
            interval = null;
          }
        })
        .catch((err) => {
          setError(err.message || "Failed to load game");
          setLoading((v) => v ? false : v);
        });
    };

    fetchInfo();
    interval = setInterval(fetchInfo, 3000);
    return () => { if (interval) clearInterval(interval); };
  }, [gameId, inviteToken]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !displayName.trim()) return;
    setJoining(true);
    setError("");
    try {
      const result = await joinGame(gameId, inviteToken, displayName.trim());
      setSessionToken(gameId, result.session_token);
      setInviteToken(gameId, inviteToken);
      navigate(`/game/${gameId}`);
    } catch (err: any) {
      setError(err.message || "Failed to join");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-card border border-border p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-[calc(100vw-2rem)] sm:max-w-sm space-y-5 animate-fade-in-up">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">EinSolchesDing</h1>
          <p className="text-muted-foreground text-sm">Join Game</p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/30 p-3 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

        {gameInfo && (
          <>
            <div className="bg-secondary/50 border border-border p-4 rounded-lg space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Language:</span>
                <Badge variant="default" className="ml-auto">
                  {gameInfo.language === "de" ? "Deutsch" : "English"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Players:</span>
                <Badge variant="secondary" className="ml-auto">
                  {gameInfo.joined_count} / {gameInfo.player_count}
                </Badge>
              </div>
              {gameInfo.players.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {gameInfo.players.map((p) => (
                    <Badge key={p.index} variant="outline" className="text-xs">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {gameInfo.joined_count < gameInfo.player_count ? (
              <form onSubmit={handleJoin} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={20}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={joining || !displayName.trim()}
                  variant="success"
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4" />
                  {joining ? "Joining..." : "Join Game"}
                </Button>
              </form>
            ) : (
              <div className="text-center">
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  Game is full
                </Badge>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
