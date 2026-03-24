import { useState, useEffect } from "react";
import { useGameStore, usePlayerName } from "../store/gameStore";
import { castVote, getSessionToken } from "../api/http";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Loader2, Scale, Layers, ChevronDown, ChevronUp, Users } from "lucide-react";

interface Props {
  gameId: string;
}

export default function VoteModal({ gameId }: Props) {
  const { activeVote, yourIndex, playedCards } = useGameStore();
  const initiatorName = usePlayerName(activeVote?.initiator);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);

  // Reset voted state when a new vote starts
  useEffect(() => {
    if (activeVote) {
      setVoted(false);
      setShowCards(false);
    }
  }, [activeVote?.target, activeVote?.initiator]);

  if (!activeVote) return null;

  const isTarget = yourIndex === activeVote.target;
  const totalVotes = activeVote.votes_yes.length + activeVote.votes_no.length;

  const handleVote = async (valid: boolean) => {
    const sessionToken = getSessionToken(gameId);
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
    <Dialog open>
      <DialogContent hideClose className="text-center">
        <DialogHeader className="items-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mb-2">
            <Scale className="h-6 w-6 shrink-0 text-primary" />
          </div>
          <DialogTitle className="text-lg">
            Was {activeVote.target_name}'s answer valid?
          </DialogTitle>
          <DialogDescription>
            {isTarget
              ? `${initiatorName} is challenging you`
              : voted
                ? "Your vote has been cast"
                : "Cast your vote"}
          </DialogDescription>
        </DialogHeader>

        {/* Vote progress */}
        <div className="flex justify-center py-2">
          <Badge variant="secondary" className="text-sm px-3 py-1 gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {totalVotes} / {activeVote.votes_needed} voted
          </Badge>
        </div>

        {/* Played cards viewer */}
        {playedCards.length > 0 && (
          <div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowCards(!showCards)}
            >
              <Layers className="h-4 w-4 shrink-0" />
              {showCards ? "Hide Cards" : `View Played Cards (${playedCards.length})`}
              {showCards ? (
                <ChevronUp className="h-4 w-4 shrink-0 ml-auto" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 ml-auto" />
              )}
            </Button>
            {showCards && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-2 text-left">
                {playedCards.map((card) => (
                  <div
                    key={card.keyword}
                    className="bg-secondary/50 border border-border rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-primary">{card.keyword}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.info}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isTarget || voted ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span className="text-sm">
              {isTarget ? "Waiting for votes..." : "Waiting for others..."}
            </span>
          </div>
        ) : (
          <DialogFooter className="flex-row">
            <Button
              onClick={() => handleVote(true)}
              disabled={loading}
              variant="success"
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4 shrink-0" />
              Yes, valid
            </Button>
            <Button
              onClick={() => handleVote(false)}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4 shrink-0" />
              No, invalid
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
