import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";

export default function WinnerModal() {
  const { winner, yourIndex } = useGameStore();
  const navigate = useNavigate();

  if (!winner) return null;

  const isYou = winner.player_index === yourIndex;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">{isYou ? "🎉" : "👏"}</div>
        <h2 className="text-2xl font-bold">
          {isYou ? "You win!" : `${winner.display_name} wins!`}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="w-full p-3 bg-amber-600 hover:bg-amber-700 rounded font-semibold transition"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
