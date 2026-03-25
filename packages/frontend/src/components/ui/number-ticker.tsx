import { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
}

export function NumberTicker({
  value,
  duration,
  className,
}: NumberTickerProps) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  // ~400ms per step, so small counts (2-5) feel unhurried
  const effectiveDuration = duration ?? Math.max(800, value * 400);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (startTime.current === null) startTime.current = timestamp;
      const progress = Math.min(
        (timestamp - startTime.current) / effectiveDuration,
        1,
      );
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [value, effectiveDuration]);

  return <span className={className}>{display}</span>;
}
