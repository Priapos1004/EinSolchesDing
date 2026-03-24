import { useState, useEffect } from "react";
import { useGameStore, usePlayerName } from "../store/gameStore";
import { castVote, getSessionToken } from "../api/http";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Loader2, Scale } from "lucide-react";

interface Props {
  gameId: string;
}

export default function VoteModal({ gameId }: Props) {
  const { activeVote, yourIndex } = useGameStore();
  const initiatorName = usePlayerName(activeVote?.initiator);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset voted state when a new vote starts
  useEffect(() => {
    if (activeVote) {
      setVoted(false);
    }
  }, [activeVote?.target, activeVote?.initiator]);

  if (!activeVote) return null;

  const isTarget = yourIndex === activeVote.target;
  const yesCount = activeVote.votes_yes.length;
  const noCount = activeVote.votes_no.length;

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
            <Scale className="h-6 w-6 text-primary" />
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

        {/* Vote tally */}
        <div className="flex justify-center gap-4 py-2">
          <Badge variant="success" className="text-sm px-3 py-1 gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5" />
            {yesCount}
          </Badge>
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5" />
            {noCount}
          </Badge>
        </div>

        {isTarget || voted ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isTarget ? "Waiting for votes..." : "Waiting for others..."}
            </span>
          </div>
        ) : (
          <div className="flex gap-3 pt-1">
            <Button
              onClick={() => handleVote(true)}
              disabled={loading}
              variant="success"
              className="flex-1"
            >
              <ThumbsUp className="h-4 w-4" />
              Yes, valid
            </Button>
            <Button
              onClick={() => handleVote(false)}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <ThumbsDown className="h-4 w-4" />
              No, invalid
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
