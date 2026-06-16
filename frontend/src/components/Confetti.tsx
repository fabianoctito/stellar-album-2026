import { motion } from "framer-motion";
import { useEffect } from "react";

const COLORS = [
  "oklch(0.72 0.13 85)", // gold
  "oklch(0.58 0.15 150)", // leaf
  "oklch(0.52 0.13 240)", // rare blue
  "oklch(0.8 0.13 30)", // warm
];
const PIECES = Array.from({ length: 32 }, (_, i) => i);

/** One-shot celebratory burst. Mounts on a key change, calls onDone to unmount. */
export function Confetti({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 1300);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" aria-hidden>
      {PIECES.map((i) => {
        const angle = (i / PIECES.length) * Math.PI * 2;
        const dist = 130 + (i % 6) * 36;
        return (
          <motion.span
            key={i}
            className="absolute h-3 w-2 rounded-[2px]"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + 80, opacity: 0, rotate: 220 + i * 18, scale: 0.6 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        );
      })}
    </div>
  );
}
