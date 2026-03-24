import { useGameStore, usePlayerName } from "../store/gameStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VoteResultModal() {
  const { voteResult, clearVoteResult, yourIndex } = useGameStore();
  const targetName = usePlayerName(voteResult?.target);
  const drawnByName = usePlayerName(voteResult?.cards_drawn_by);

  if (!voteResult) return null;

  const isTarget = yourIndex === voteResult.target;
  const drewCards = yourIndex === voteResult.cards_drawn_by;

  const { Icon, iconColor, title, message } = voteResult.valid
    ? {
        Icon: CheckCircle2,
        iconColor: "text-success",
        title: "Answer was valid!",
        message: isTarget
          ? `Your answer was accepted. ${drawnByName} draws 2 cards.`
          : drewCards
            ? `${targetName}'s answer was valid. You draw 2 cards.`
            : `${targetName}'s answer was valid. ${drawnByName} draws 2 cards.`,
      }
    : {
        Icon: XCircle,
        iconColor: "text-destructive",
        title: "Answer was invalid!",
        message: isTarget
          ? "Your answer was rejected. You draw 2 cards."
          : drewCards
            ? `${targetName}'s answer was invalid. You draw 2 cards.`
            : `${targetName}'s answer was invalid. ${drawnByName} draws 2 cards.`,
      };

  return (
    <Dialog open>
      <DialogContent hideClose className="text-center">
        <DialogHeader className="items-center">
          <div className="animate-scale-in">
            <Icon className={`h-12 w-12 ${iconColor}`} />
          </div>
          <DialogTitle className={`text-lg ${iconColor}`}>{title}</DialogTitle>
          <DialogDescription className="text-foreground/70 text-sm">
            {message}
          </DialogDescription>
        </DialogHeader>

        {/* Vote tally */}
        <div className="flex justify-center gap-4 py-2">
          <Badge variant="success" className="text-sm px-3 py-1 gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
            {voteResult.votes_yes}
          </Badge>
          <Badge variant="destructive" className="text-sm px-3 py-1 gap-1.5">
            <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
            {voteResult.votes_no}
          </Badge>
        </div>

        <DialogFooter>
          <Button onClick={clearVoteResult} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
