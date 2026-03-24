import { useState } from "react";
import type { Card } from "@esd/shared";
import { playCardAction, getSessionToken } from "../api/http";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    const sessionToken = getSessionToken(gameId);
    if (!sessionToken) return;

    setLoading(true);
    try {
      await playCardAction(gameId, sessionToken, card.keyword);
      toast.success(`Played "${card.keyword}"`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to play card");
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">{card.keyword}</DialogTitle>
          <DialogDescription className="text-foreground/70 text-base pt-2">
            {card.info}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 pt-2">
          {canPlay && (
            <Button
              onClick={handlePlay}
              disabled={loading}
              variant="success"
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {loading ? "Playing..." : "Play Card"}
            </Button>
          )}
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
