import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api/http";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Plus, Minus, Gamepad2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CreateGame() {
  const [playerCount, setPlayerCount] = useState(2);
  const [language, setLanguage] = useState<"de" | "en">("de");
  const [inviteUrl, setInviteUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
      const url = `${window.location.origin}/join/${result.game_id}?token=${result.invite_token}`;
      setInviteUrl(url);
      toast.success("Game created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="bg-card border border-border p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-[calc(100vw-2rem)] sm:max-w-md space-y-6 animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create Game</h1>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive border border-destructive/30 p-3 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

        {!inviteUrl ? (
          <div className="space-y-6">
            {/* Player count */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium text-center block">Players</label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                  disabled={playerCount <= 2}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-3xl font-bold w-10 text-center tabular-nums">
                  {playerCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayerCount(Math.min(5, playerCount + 1))}
                  disabled={playerCount >= 5}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium text-center block">Language</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setLanguage("de")}
                  variant={language === "de" ? "default" : "secondary"}
                  className="flex-1"
                >
                  Deutsch
                </Button>
                <Button
                  onClick={() => setLanguage("en")}
                  variant={language === "en" ? "default" : "secondary"}
                  className="flex-1"
                >
                  English
                </Button>
              </div>
            </div>

            <Button
              onClick={handleCreate}
              disabled={loading}
              variant="success"
              className="w-full"
              size="lg"
            >
              <Gamepad2 className="h-5 w-5" />
              {loading ? "Creating..." : "Create Game"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-center">
              <Badge variant="success" className="text-sm px-3 py-1">
                Game created!
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Share this link with {playerCount} players:
            </p>
            <div className="bg-secondary/50 border border-border p-3 rounded-lg text-sm break-all select-all font-mono">
              {inviteUrl}
            </div>
            <div className="flex gap-2">
              <Button onClick={copyLink} className="flex-1">
                {copied ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                onClick={() => window.open(inviteUrl, "_blank")}
                variant="secondary"
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Open Link
              </Button>
            </div>
            <Button
              onClick={() => {
                setInviteUrl("");
                setCopied(false);
              }}
              variant="secondary"
              className="w-full"
            >
              Create Another Game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
