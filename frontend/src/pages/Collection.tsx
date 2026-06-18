import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useStore } from "../store";
import { Page, SectionHead } from "../components/ui";
import { Sticker } from "../components/Sticker";
import { TYPES } from "../lib/catalog";

export default function Collection() {
  const { collection, pasted } = useStore();
  const owned = TYPES.filter((t) => (collection[t] ?? 0) > 0);

  return (
    <Page>
      <SectionHead
        title="Your stickers"
        right={`${owned.length} of ${TYPES.length} types`}
        sub="Duplicates of one person stack here. They are interchangeable with each other, which is exactly what makes a sticker semi-fungible."
      />

      {owned.length === 0 ? (
        <div className="rounded-2xl bg-cream px-6 py-12 text-center ring-1 ring-edge">
          <p className="text-ink-soft">Your drawer is empty.</p>
          <Link to="/" className="mt-3 inline-block rounded-full bg-leaf-deep px-5 py-2 text-sm font-bold text-paper transition hover:bg-leaf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf">
            Go rip a pack
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {owned.map((t) => (
            <motion.div
              key={t}
              layout
              className="flex flex-col gap-1.5"
              whileHover={{ y: -4 }}
              transition={{ type: "tween", duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sticker typeId={t} qty={collection[t]} />
              {pasted[t] && <span className="text-center text-xs font-semibold text-leaf-deep">✓ also in album</span>}
            </motion.div>
          ))}
        </div>
      )}

      {owned.length > 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          Ready to commit one for good?{" "}
          <Link to="/album" className="font-semibold text-leaf-deep underline">
            Stick it into your album.
          </Link>
        </p>
      )}
    </Page>
  );
}
