import { useGameStore } from "../store/gameStore";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WifiOff } from "lucide-react";

export default function PlayerTabs() {
  const { players, currentPlayer, yourIndex } = useGameStore();

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {players.map((p) => {
        const isCurrentPlayer = p.index === currentPlayer;
        const isYou = p.index === yourIndex;

        return (
          <div
            key={p.index}
            className={cn(
              "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
              isCurrentPlayer
                ? "bg-primary text-primary-foreground shadow-md animate-glow"
                : "bg-secondary text-secondary-foreground",
              isYou && "ring-2 ring-ring"
            )}
          >
            <div className="flex items-center gap-1.5">
              <span>{p.name}</span>
              <Badge
                variant={isCurrentPlayer ? "secondary" : "outline"}
                className="text-[10px] px-1.5 py-0 h-4 ml-0.5"
              >
                {p.card_count}
              </Badge>
              {!p.connected && (
                <WifiOff className="h-3 w-3 text-destructive ml-0.5" />
              )}
            </div>
            {isYou && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-ring border-2 border-background" />
            )}
          </div>
        );
      })}
    </div>
  );
}
