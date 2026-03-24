import confetti from "canvas-confetti";

const SIDES = [
  { angle: 60, origin: { x: 0 } },
  { angle: 120, origin: { x: 1 } },
] as const;

function fireConfettiLoop(options: Omit<confetti.Options, "angle" | "origin" | "spread">): () => void {
  const duration = 3000;
  const end = Date.now() + duration;
  let rafId: number;
  let cancelled = false;

  const frame = () => {
    if (cancelled) return;

    for (const side of SIDES) {
      confetti({
        spread: 55,
        ...options,
        angle: side.angle,
        origin: side.origin,
      });
    }

    if (Date.now() < end) {
      rafId = requestAnimationFrame(frame);
    }
  };

  rafId = requestAnimationFrame(frame);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
}

const WINNER_COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#ffffff"];

export function fireConfetti(): () => void {
  return fireConfettiLoop({ particleCount: 3, colors: WINNER_COLORS });
}

const LOSER_SCALAR = 2;
const LOSER_SHAPES = [
  confetti.shapeFromText({ text: "💩", scalar: LOSER_SCALAR }),
  confetti.shapeFromText({ text: "🐟", scalar: LOSER_SCALAR }),
];

export function fireLoserConfetti(): () => void {
  return fireConfettiLoop({ particleCount: 2, shapes: LOSER_SHAPES, scalar: LOSER_SCALAR });
}
