// Mirrors contracts/common: 20 types, tiers 0–11 common / 12–17 rare / 18–19 legendary.
export const TYPE_COUNT = 20;

export type Tier = "Common" | "Rare" | "Legendary";

export function tier(typeId: number): Tier {
  if (typeId <= 11) return "Common";
  if (typeId <= 17) return "Rare";
  return "Legendary";
}

export const TIER_STYLE: Record<Tier, string> = {
  Common: "from-slate-100 to-slate-200 ring-slate-300 text-slate-700",
  Rare: "from-sky-100 to-sky-300 ring-sky-400 text-sky-900",
  Legendary: "from-amber-100 to-amber-300 ring-amber-400 text-amber-900",
};

// Placeholder identities until real SDF art/metadata (decision D15).
export function stickerName(typeId: number): string {
  return `SDF #${typeId}`;
}
