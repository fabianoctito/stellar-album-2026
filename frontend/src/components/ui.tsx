import { motion } from "framer-motion";
import type { ReactNode } from "react";

const PAGE_EASE = [0.22, 1, 0.36, 1] as const;

/** Animated page wrapper; drives the route transition. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <motion.main
      className="mx-auto max-w-4xl px-5 pb-24 pt-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: PAGE_EASE }}
    >
      {children}
    </motion.main>
  );
}

export function SectionHead({ title, right, sub }: { title: string; right?: string; sub?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
        {right && <span className="text-sm text-ink-soft">{right}</span>}
      </div>
      {sub && <p className="mt-1 max-w-prose text-sm text-ink-soft">{sub}</p>}
    </div>
  );
}

export function ProgressMeter({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-kraft">
        <motion.div
          className="h-full origin-left rounded-full bg-leaf"
          initial={false}
          animate={{ scaleX: max ? value / max : 0 }}
          transition={{ duration: 0.5, ease: PAGE_EASE }}
        />
      </div>
      <span className="font-display text-sm font-bold text-ink">{value}/{max}</span>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
      {children}
    </label>
  );
}

export function CounterButton({ title, sub, onClick, disabled }: { title: string; sub: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 flex-col items-start rounded-xl bg-paper px-4 py-3 text-left ring-1 ring-edge transition hover:ring-leaf/50 focus-visible:outline-2 focus-visible:outline-leaf disabled:opacity-45 disabled:hover:ring-edge"
    >
      <span className="font-display font-bold text-ink">{title}</span>
      <span className="text-xs text-ink-soft">{sub}</span>
    </button>
  );
}

export function Toast({ busy, error }: { busy?: string; error?: string }) {
  if (!busy && !error) return null;
  return (
    <div className="mt-4">
      {busy && <p className="text-center text-sm text-leaf-deep" role="status">{busy}…</p>}
      {error && <p className="rounded-xl bg-paper px-4 py-3 text-sm text-ink ring-1 ring-edge" role="alert">{error}</p>}
    </div>
  );
}
