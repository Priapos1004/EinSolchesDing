import type { Card as CardType } from "@esd/shared";

interface Props {
  card: CardType;
  onClick: () => void;
}

export default function Card({ card, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-amber-600 rounded-lg text-left transition"
    >
      <span className="font-semibold text-amber-400">{card.keyword}</span>
    </button>
  );
}
