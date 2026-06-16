import { stickerName, tier, TIER_FACE, TIER_GLYPH, TIER_LABEL } from "../lib/catalog";

// The collectible itself: an identifiable object with a name + rarity.
// `qty` shows stacked duplicates; legendary carries a holographic sheen.
export function Sticker({ typeId, qty, big }: { typeId: number; qty?: number; big?: boolean }) {
  const t = tier(typeId);
  return (
    <div className={`relative flex aspect-[3/4] flex-col items-center justify-center rounded-2xl px-2 ${TIER_FACE[t]}`}>
      {qty != null && qty > 1 && (
        <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold text-paper">×{qty}</span>
      )}
      <div className={`relative z-10 ${big ? "text-5xl" : "text-3xl"}`} aria-hidden>
        🧑‍🚀
      </div>
      <div className={`relative z-10 mt-1 font-display font-bold text-ink ${big ? "text-base" : "text-xs"}`}>{stickerName(typeId)}</div>
      <div className={`relative z-10 mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${TIER_LABEL[t]}`}>
        <span aria-hidden>{TIER_GLYPH[t]}</span>
        {t}
      </div>
    </div>
  );
}
