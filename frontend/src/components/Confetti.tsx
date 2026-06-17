import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

const COLORS = [
  "oklch(0.72 0.13 85)", // gold
  "oklch(0.58 0.15 150)", // leaf
  "oklch(0.52 0.13 240)", // rare blue
  "oklch(0.8 0.13 30)", // warm
];
// A richer, gold-forward palette for legendary pulls.
const GOLD = [
  "oklch(0.82 0.15 90)", // bright gold
  "oklch(0.72 0.13 85)", // gold
  "oklch(0.88 0.1 95)", // pale gold
  "oklch(0.8 0.13 30)", // warm
];

/** One-shot celebratory burst. Mounts on a key change, calls onDone to unmount.
 *  The "legendary" variant throws more, gold-forward pieces. */
export function Confetti({ onDone, variant = "default" }: { onDone: () => void; variant?: "default" | "legendary" }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const id = setTimeout(onDone, reduce ? 0 : 1300);
    return () => clearTimeout(id);
  }, [onDone, reduce]);

  // Motion-sensitive users get no flying confetti.
  if (reduce) return null;

  const legendary = variant === "legendary";
  const palette = legendary ? GOLD : COLORS;
  const pieces = Array.from({ length: legendary ? 52 : 32 }, (_, i) => i);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" aria-hidden>
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2;
        const dist = (legendary ? 170 : 130) + (i % 6) * 36;
        return (
          <motion.span
            key={i}
            className="absolute h-3 w-2 rounded-[2px]"
            style={{ backgroundColor: palette[i % palette.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 80, opacity: 0, rotate: 220 + i * 18, scale: 0.6 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}
