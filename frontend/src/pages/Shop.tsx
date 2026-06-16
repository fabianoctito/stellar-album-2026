import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store";
import { Page, CounterButton, Toast } from "../components/ui";
import { Sticker } from "../components/Sticker";

function fmtRemaining(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.max(1, Math.floor(sec))}s`;
}

export default function Shop() {
  const { coin, packs, claimAt, busy, error, claim, buy, open, reveal, dismissReveal } = useStore();
  const now = Date.now() / 1000;
  const claimReady = claimAt === 0 || now >= claimAt;

  return (
    <Page>
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">The counter</h1>
      <p className="mt-1 max-w-prose text-sm text-ink-soft">
        Your coins are fungible: any one is worth any other. A sealed pack is fungible too, until you rip it open and it
        becomes three specific stickers.
      </p>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-kraft p-3 ring-1 ring-edge sm:flex-row">
        <div className="flex flex-1 gap-2">
          <CounterButton title="Claim coins" sub={claimReady ? "free from the faucet" : `ready in ${fmtRemaining(claimAt - now)}`} onClick={claim} disabled={!!busy || !claimReady} />
          <CounterButton title="Buy a pack" sub="100 ⭐" onClick={buy} disabled={!!busy || coin < 100} />
        </div>
        <button
          onClick={open}
          disabled={!!busy || packs < 1}
          className="rounded-xl bg-leaf-deep px-6 py-4 font-display text-lg font-bold text-paper shadow-md transition hover:bg-leaf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf disabled:opacity-40 disabled:shadow-none sm:min-w-[38%]"
        >
          {packs > 0 ? `Rip a pack · ${packs}` : "No packs to open"}
        </button>
      </div>

      <Toast busy={busy} error={error} />

      <AnimatePresence>
        {reveal && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-ink/60 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={dismissReveal}
          >
            <p className="font-display text-2xl font-extrabold text-paper">You ripped open a pack</p>
            <div className="flex gap-3 sm:gap-5" style={{ perspective: "1000px" }} onClick={(e) => e.stopPropagation()}>
              {reveal.map((t, i) => (
                <motion.div
                  key={i}
                  className="w-24 sm:w-36"
                  initial={{ opacity: 0, rotateY: 80, scale: 0.85 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.12 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Sticker typeId={t} big />
                </motion.div>
              ))}
            </div>
            <button onClick={dismissReveal} className="rounded-full bg-paper px-6 py-2.5 font-display font-bold text-ink shadow-md transition hover:bg-cream">
              Add to collection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}
