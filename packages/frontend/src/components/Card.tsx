import type { Card as CardType } from "@esd/shared";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface Props {
  card: CardType;
  onClick: () => void;
}

export default function Card({ card, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 bg-card border border-border rounded-lg text-left transition-all duration-200",
        "hover:border-primary/60 hover:bg-card/80 hover:shadow-md hover:shadow-primary/5",
        "active:scale-[0.99] group"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-primary">{card.keyword}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
