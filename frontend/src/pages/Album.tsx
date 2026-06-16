import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store";
import { Page, SectionHead, ProgressMeter, Toast } from "../components/ui";
import { Sticker } from "../components/Sticker";
import { TIER_FACE, tier, TYPE_COUNT, TYPES } from "../lib/catalog";

const SETTLE = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

export default function Album() {
  const { hasAlbum, openAlbum, pasted, collection, paste, busy, error } = useStore();
  const filled = pasted.filter(Boolean).length;
  const tray = TYPES.filter((t) => (collection[t] ?? 0) > 0 && !pasted[t]);

  if (!hasAlbum) {
    return (
      <Page>
        <SectionHead title="Album" sub="One per collector, yours forever." />
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-cream p-8 text-center ring-1 ring-edge sm:flex-row sm:text-left">
          <div className="grid h-28 w-24 shrink-0 place-items-center rounded-xl bg-kraft ring-1 ring-edge" style={{ transform: "rotate(-3deg)" }}>
            <span className="font-display text-sm font-bold text-ink-soft">EMPTY</span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-ink">Bind your album</h3>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">
              It is soulbound: it cannot be sold or transferred. Sticking a sticker presses it in permanently and burns it
              from your drawer, so a finished album is something only you could have made.
            </p>
            <button onClick={openAlbum} disabled={!!busy} className="mt-4 rounded-full bg-leaf-deep px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-leaf disabled:opacity-40">
              Start my album
            </button>
          </div>
        </div>
        <Toast busy={busy} error={error} />
      </Page>
    );
  }

  return (
    <Page>
      <SectionHead title="Album" right={`${filled} of ${TYPE_COUNT}`} />

      <div className="rounded-2xl bg-cream p-5 ring-1 ring-edge">
        <ProgressMeter value={filled} max={TYPE_COUNT} />
        <div className="mt-5 grid grid-cols-5 gap-2.5 sm:grid-cols-10">
          {TYPES.map((t) =>
            pasted[t] ? (
              <motion.div
                key={`filled-${t}`}
                initial={{ scale: 1.25, rotate: -6, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={SETTLE}
                className={`flex aspect-[3/4] items-center justify-center rounded-lg font-display text-sm font-bold text-ink shadow-sm ${TIER_FACE[tier(t)]}`}
              >
                #{t}
              </motion.div>
            ) : (
              <div key={`empty-${t}`} className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-edge text-xs text-ink-soft/40">
                #{t}
              </div>
            ),
          )}
        </div>
        {filled === TYPE_COUNT && <p className="mt-5 text-center font-display font-bold text-leaf-deep">Album complete. You collected the whole crew.</p>}
      </div>

      <div className="mt-10">
        <SectionHead
          title="Ready to stick"
          right={`${tray.length} loose`}
          sub="Tap a sticker to press it in. This burns the sticker and fills its slot, for good."
        />
        {tray.length === 0 ? (
          <p className="rounded-2xl bg-cream px-5 py-8 text-center text-ink-soft ring-1 ring-edge">
            Nothing loose to stick. Open more packs to find the slots you are missing.
          </p>
        ) : (
          <motion.div layout className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <AnimatePresence>
              {tray.map((t) => (
                <motion.button
                  key={t}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, y: -34, scale: 0.55, rotate: -8 }}
                  transition={SETTLE}
                  whileHover={{ y: -4 }}
                  onClick={() => paste(t)}
                  disabled={!!busy}
                  className="flex flex-col gap-1.5 rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf disabled:opacity-50"
                >
                  <Sticker typeId={t} qty={collection[t]} />
                  <span className="rounded-lg bg-leaf-tint py-1 text-center text-xs font-bold text-leaf-deep">Stick it in</span>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Toast busy={busy} error={error} />
    </Page>
  );
}
