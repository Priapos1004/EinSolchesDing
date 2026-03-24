import { useGameStore } from "../store/gameStore";

export default function PlayerTabs() {
  const { players, currentPlayer, yourIndex } = useGameStore();

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {players.map((p) => (
        <div
          key={p.index}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
            p.index === currentPlayer
              ? "bg-amber-600 text-white"
              : "bg-gray-700 text-gray-300"
          } ${p.index === yourIndex ? "ring-2 ring-amber-400" : ""}`}
        >
          <span>{p.name}</span>
          <span className="ml-2 text-xs opacity-70">({p.card_count})</span>
          {!p.connected && (
            <span className="ml-1 text-xs text-red-400">offline</span>
          )}
        </div>
      ))}
    </div>
  );
}
