import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

export default function WinnerModal() {
  const { winner, yourIndex } = useGameStore();
  const navigate = useNavigate();

  if (!winner) return null;

  const isYou = winner.player_index === yourIndex;

  return (
    <Dialog open>
      <DialogContent hideClose className="text-center">
        <DialogHeader className="items-center">
          <div className="animate-scale-in">
            <Trophy className={`h-14 w-14 ${isYou ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <DialogTitle className="text-2xl">
            {isYou ? "You win!" : `${winner.display_name} wins!`}
          </DialogTitle>
          <DialogDescription>
            {isYou
              ? "Congratulations! You played all your cards!"
              : `${winner.display_name} played all their cards first.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => navigate("/")} className="w-full">
            <Home className="h-4 w-4" />
            Back to Menu
          </Button>
        </DialogFooter>
        {isYou && <ConfettiEffect />}
      </DialogContent>
    </Dialog>
  );
}

function ConfettiEffect() {
  useEffect(() => {
    const cancel = fireConfetti();
    return cancel;
  }, []);
  return null;
}
