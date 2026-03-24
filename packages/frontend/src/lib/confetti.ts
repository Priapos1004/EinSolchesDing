import confetti from "canvas-confetti";

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#ffffff"];
const SIDES = [
  { angle: 60, origin: { x: 0 } },
  { angle: 120, origin: { x: 1 } },
] as const;

export function fireConfetti(): () => void {
  const duration = 3000;
  const end = Date.now() + duration;
  let rafId: number;
  let cancelled = false;

  const frame = () => {
    if (cancelled) return;

    for (const side of SIDES) {
      confetti({
        particleCount: 3,
        angle: side.angle,
        spread: 55,
        origin: side.origin,
        colors: COLORS,
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
