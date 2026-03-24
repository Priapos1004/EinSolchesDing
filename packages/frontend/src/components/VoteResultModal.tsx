import { useGameStore } from "../store/gameStore";

export default function VoteResultModal() {
  const { voteResult, clearVoteResult, yourIndex, players } = useGameStore();

  if (!voteResult) return null;

  const isTarget = yourIndex === voteResult.target;
  const drewCards = yourIndex === voteResult.cards_drawn_by;
  const getPlayerName = (index: number) =>
    players.find((p) => p.index === index)?.name ?? "?";

  const { icon, title, color, message } = voteResult.valid
    ? {
        icon: "\u2714",
        title: "Answer was valid!",
        color: "text-green-400",
        message: isTarget
          ? "Your answer was accepted. The challenger draws 2 cards."
          : drewCards
            ? "The answer was valid. You draw 2 cards."
            : `${getPlayerName(voteResult.target)}'s answer was valid. ${getPlayerName(voteResult.cards_drawn_by)} draws 2 cards.`,
      }
    : {
        icon: "\u2718",
        title: "Answer was invalid!",
        color: "text-red-400",
        message: isTarget
          ? "Your answer was rejected. You draw 2 cards."
          : drewCards
            ? "The answer was invalid. You draw 2 cards."
            : `${getPlayerName(voteResult.target)}'s answer was invalid. ${getPlayerName(voteResult.cards_drawn_by)} draws 2 cards.`,
      };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-sm w-full space-y-4 text-center">
        <div className="text-4xl">{icon}</div>
        <h2 className={`text-lg font-bold ${color}`}>{title}</h2>
        <p className="text-gray-300">{message}</p>

        <button
          onClick={clearVoteResult}
          className="w-full p-3 bg-amber-600 hover:bg-amber-700 rounded font-semibold transition"
        >
          OK
        </button>
      </div>
    </div>
  );
}
