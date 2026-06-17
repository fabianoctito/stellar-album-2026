import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Sticker } from "./Sticker";
import { Confetti } from "./Confetti";
import { PackArt } from "./PackArt";
import { useFocusTrap, CloseButton } from "./Dialog";
import { buttonClass } from "./ui";
import { tier, TIER_RANK, type Tier } from "../lib/catalog";
import type { RevealCard, RevealState } from "../store";

const EASE = [0.22, 1, 0.36, 1] as const;

// A soft backdrop wash keyed to the best card pulled so far — gold once a
// legendary lands, a cooler blue for a rare, nothing for commons.
const VIGNETTE: Record<Tier, string> = {
  Common: "radial-gradient(circle at 50% 42%, oklch(0.7 0.05 150 / 0.15), transparent 62%)",
  Rare: "radial-gradient(circle at 50% 42%, oklch(0.52 0.13 240 / 0.22), transparent 62%)",
  Legendary: "radial-gradient(circle at 50% 42%, oklch(0.72 0.13 85 / 0.3), transparent 62%)",
};

// Per-card pacing (ms). The last card of each pack lingers for a drumroll.
const FLIP_MS = 450;
const DRUMROLL_MS = 950;

/** Reorder a pack so its highest-tier card flips last (stable otherwise). */
function climaxOrder(cards: RevealCard[]): RevealCard[] {
  return cards
    .map((c, i) => ({ c, i }))
    .sort((a, b) => TIER_RANK[tier(a.c.type)] - TIER_RANK[tier(b.c.type)] || a.i - b.i)
    .map((x) => x.c);
}

interface SeqItem {
  card: RevealCard;
  isPackLast: boolean;
}

/** Card sizing scales down as the batch grows so big opens stay on-screen. */
function cardWidth(total: number): string {
  if (total <= 3) return "w-28 sm:w-40";
  if (total <= 9) return "w-20 sm:w-28";
  return "w-16 sm:w-24";
}

export function PackReveal({
  reveal,
  count,
  onDismiss,
  onOpenNext,
  onGoCollection,
}: {
  reveal?: RevealState;
  count: number;
  onDismiss: () => void;
  onOpenNext?: () => void;
  onGoCollection: () => void;
}) {
  const reduce = !!useReducedMotion();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Reorder each pack for drama, then lay packs out as rows while keeping a flat
  // sequence (with per-pack-last flags) to drive the one-card-at-a-time timing.
  const { rows, seq, rowStart } = useMemo(() => {
    if (!reveal) return { rows: [] as RevealCard[][], seq: [] as SeqItem[], rowStart: [] as number[] };
    const rows = reveal.packs.map(climaxOrder);
    const seq: SeqItem[] = rows.flatMap((pack) =>
      pack.map((card, ci) => ({ card, isPackLast: ci === pack.length - 1 })),
    );
    // Flat index where each row begins, so a card's reveal order is rowStart[pi] + ci.
    let acc = 0;
    const rowStart = rows.map((pack) => {
      const start = acc;
      acc += pack.length;
      return start;
    });
    return { rows, seq, rowStart };
  }, [reveal]);

  const total = seq.length;
  const [revealed, setRevealed] = useState(0); // count of cards flipped face-up
  const [burst, setBurst] = useState(0); // bumped per legendary to refire confetti
  // Until the on-chain result lands we sit on a "ripping…" loading beat, so the
  // anticipation covers the actual transaction wait instead of a buried toast.
  const loading = !reveal;
  const done = !loading && revealed >= total;

  // Reset the sequence whenever a fresh result arrives (e.g. "Open next").
  useEffect(() => {
    setRevealed(0);
  }, [reveal]);

  // Trap focus + restore on close; Escape skips (mid-reveal) or dismisses (done).
  useFocusTrap(panelRef, () => (loading ? undefined : done ? onDismiss() : setRevealed(total)));

  // Auto-advance one card at a time, pausing longer on each pack's climax card.
  // Reduced-motion users get the whole haul at once — no flips, no drumroll.
  useEffect(() => {
    if (loading || revealed >= total) return;
    if (reduce) {
      setRevealed(total);
      return;
    }
    const delay = seq[revealed].isPackLast ? DRUMROLL_MS : FLIP_MS;
    const id = setTimeout(() => setRevealed((n) => n + 1), delay);
    return () => clearTimeout(id);
  }, [loading, revealed, total, seq, reduce]);

  // Fire confetti whenever a legendary card lands (skipped under reduced motion).
  useEffect(() => {
    if (loading || revealed === 0 || reduce) return;
    if (tier(seq[revealed - 1].card.type) === "Legendary") setBurst((b) => b + 1);
  }, [loading, revealed, seq, reduce]);

  const skip = () => setRevealed(total);
  const packCount = loading ? count : rows.length;

  // Best tier among cards revealed so far, for the backdrop wash (so the gold
  // only appears once a legendary has actually flipped — no spoilers).
  const bestTier = useMemo<Tier | null>(() => {
    let best: Tier | null = null;
    for (let i = 0; i < revealed && i < seq.length; i++) {
      const t = tier(seq[i].card.type);
      if (!best || TIER_RANK[t] > TIER_RANK[best]) best = t;
    }
    return best;
  }, [revealed, seq]);

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto bg-ink/70 px-6 py-10 focus:outline-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={loading ? undefined : done ? onDismiss : skip}
      >
        <h2 id={titleId} className="sr-only">Pack reveal</h2>
        {/* Close ✕ — always available once the result is in (never mid-tx). */}
        {!loading && <CloseButton onClick={onDismiss} className="absolute right-4 top-4 z-20 text-paper/80 hover:bg-paper/15" />}
        {/* Tier-tinted backdrop wash, behind the cards. */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          animate={{ opacity: bestTier ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: bestTier ? VIGNETTE[bestTier] : "none" }}
        />
        {burst > 0 && <Confetti key={burst} variant="legendary" onDone={() => setBurst(0)} />}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="intro"
              className="relative z-10 flex flex-col items-center gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.12 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                animate={reduce ? undefined : { scale: [1, 1.05, 0.97, 1.03, 1], rotate: [0, -3, 3, -2, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              >
                <PackArt className="h-28 w-20 rounded-2xl shadow-xl ring-1 ring-paper/20" labelClass="text-base" />
              </motion.div>
              <p className="font-display text-lg font-bold text-paper/90">
                {packCount > 1 ? `Ripping ${packCount} packs…` : "Ripping the pack…"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              className="relative z-10 flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-2xl font-extrabold text-paper">
                {done ? "Here's what you pulled" : "You ripped open a pack"}
              </p>

              <div className="flex flex-col items-center gap-3">
                {rows.map((pack, pi) => (
                  <div key={pi} className="flex gap-2 sm:gap-4" style={{ perspective: "1000px" }}>
                    {pack.map((card, ci) => {
                      const i = rowStart[pi] + ci;
                      return <RevealedCard key={i} card={card} flipped={i < revealed} next={i === revealed} total={total} reduce={reduce} />;
                    })}
                  </div>
                ))}
              </div>

              {done ? (
                <div className="flex flex-col items-center gap-3">
                  <Summary cards={seq.map((s) => s.card)} />
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {onOpenNext ? (
                      <button onClick={onOpenNext} className="rounded-full bg-paper px-6 py-2.5 font-display font-bold text-ink shadow-md transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper">
                        Open next
                      </button>
                    ) : (
                      <button onClick={onDismiss} className={buttonClass("soft")}>
                        Close
                      </button>
                    )}
                    <button onClick={onGoCollection} className={buttonClass(onOpenNext ? "soft" : "primary")}>
                      Go to collection
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={skip} className={buttonClass("soft", "sm")}>
                  Skip ▸▸
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

/** A single card: a 3D flip from a branded face-down back to the sticker, with
 *  a per-tier glow and a NEW badge once it lands. Legendaries get the full
 *  spotlight — a gold telegraph on the back while they wait, then a pop + flash
 *  as they land. */
function RevealedCard({ card, flipped, next, total, reduce }: { card: RevealCard; flipped: boolean; next: boolean; total: number; reduce: boolean }) {
  const t = tier(card.type);
  const isLegendary = t === "Legendary";
  const glow =
    t === "Legendary"
      ? "0 0 34px -2px oklch(0.72 0.13 85 / 0.9)"
      : t === "Rare"
        ? "0 0 22px -6px oklch(0.52 0.13 240 / 0.7)"
        : "none";

  // Reduced motion: no flip, no flash, no telegraph, no pop — just show the
  // result (or the pack back) statically.
  if (reduce) {
    return (
      <div className={`relative aspect-[3/4] ${cardWidth(total)}`}>
        {flipped ? (
          <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: glow }}>
            <Sticker typeId={card.type} big />
            {card.isNew && (
              <span className="absolute left-1.5 top-1.5 z-20 rounded-full bg-leaf px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-paper shadow">New</span>
            )}
          </div>
        ) : (
          <PackArt className="absolute inset-0 h-full w-full rounded-2xl ring-1 ring-paper/15" labelClass="text-sm opacity-60" />
        )}
      </div>
    );
  }

  // Telegraph: the climax legendary pulses gold on its back while it's the next
  // card waiting to flip.
  const telegraphing = isLegendary && next && !flipped;

  return (
    <motion.div
      className={`relative rounded-2xl ${cardWidth(total)}`}
      animate={
        telegraphing
          ? { boxShadow: ["0 0 0 0 oklch(0.72 0.13 85 / 0)", "0 0 26px 4px oklch(0.78 0.14 88 / 0.8)", "0 0 0 0 oklch(0.72 0.13 85 / 0)"] }
          : { boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      transition={telegraphing ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    >
      {/* Spotlight pop: legendaries swell as they flip and settle slightly larger. */}
      <motion.div
        className="relative aspect-[3/4]"
        animate={isLegendary && flipped ? { scale: [1, 1.18, 1.05] } : { scale: 1 }}
        transition={isLegendary && flipped ? { duration: 0.6, ease: EASE, times: [0, 0.55, 1] } : { duration: 0.3 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 180 }}
          animate={{ rotateY: flipped ? 0 : 180 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {/* Front: the revealed sticker, wrapped in its per-tier glow. */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ backfaceVisibility: "hidden" }}
            animate={flipped ? { boxShadow: glow } : { boxShadow: "none" }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Sticker typeId={card.type} big />
            {/* Legendary reveal flash. */}
            {isLegendary && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-paper"
                initial={{ opacity: 0 }}
                animate={flipped ? { opacity: [0, 0.85, 0] } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.18, times: [0, 0.3, 1] }}
              />
            )}
            {flipped && card.isNew && (
              <span className="absolute left-1.5 top-1.5 z-20 rounded-full bg-leaf px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-paper shadow">
                New
              </span>
            )}
          </motion.div>
          {/* Back: the branded pack, shown until the flip completes. */}
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <PackArt className="h-full w-full rounded-2xl ring-1 ring-paper/15" labelClass="text-sm opacity-60" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** A one-line tally of the haul (per-tier counts + how many are new). */
function Summary({ cards }: { cards: RevealCard[] }) {
  const t = cards.reduce(
    (a, c) => {
      a[tier(c.type)]++;
      if (c.isNew) a.New++;
      return a;
    },
    { Common: 0, Rare: 0, Legendary: 0, New: 0 },
  );
  const parts = [
    t.Legendary > 0 && `${t.Legendary} Legendary`,
    t.Rare > 0 && `${t.Rare} Rare`,
    t.Common > 0 && `${t.Common} Common`,
    t.New > 0 && `${t.New} new`,
  ].filter(Boolean);
  return <p className="text-center text-sm font-semibold text-paper/80">{parts.join(" · ")}</p>;
}
