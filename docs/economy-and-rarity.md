# Economy & Rarity

All numbers here are **starting values, tuned for a 4-class demo**. They are designed to make rarity *visible* without making album completion *impossible*. Everything is adjustable.

## Sticker catalog

- **20 sticker types** total (one per featured SDF professional).
- **3 rarity tiers:**

| Tier | Count | Tier weight (sums to 100) | Per-type probability |
|---|---|---|---|
| Common | 12 | 70 | 70 / 12 ≈ **5.83%** |
| Rare | 6 | 25 | 25 / 6 ≈ **4.17%** |
| Legendary | 2 | 5 | 5 / 2 = **2.5%** |

Each of the 3 draws in a pack is independent (repetition within a pack is allowed).

## Currency & store

| Item | Value |
|---|---|
| Pack price | **100 Coin** |
| Faucet payout per claim | **100 Coin** (exactly one pack) |
| Faucet cooldown (classroom mode) | **~60s** |
| Faucet cooldown (campaign / self-paced mode) | **3h** |
| Onboarding seed per student | **1000 Coin** (= 10 packs) |

The seed exists so the **first class never stalls** waiting on the faucet. The faucet is then a *complement* — the path for someone who wants to keep collecting between classes.

## How long to complete the album?

The bottleneck is the **2 legendaries at 2.5% each**.

- Probability a single draw yields a *specific* legendary: `0.025`.
- A pack has 3 independent draws → probability a pack contains that legendary:
  `1 − (0.975)³ ≈ 7.3%`.
- Expected packs to obtain **one** specific legendary: `1 / 0.073 ≈ 14 packs`.
- Expected packs to obtain **both** legendaries (2-item coupon collector): `≈ 14 × 1.5 ≈ 21 packs`.

Commons and rares arrive long before that, so **completion time is dominated by the legendaries: ~20–22 packs on average.**

### In faucet time
At one pack every 3h (campaign mode), ~21 packs ≈ **~63 hours ≈ ~2.6 days** of sequential claims. That's too slow if a student relies on the faucet alone during a class — hence the 1000-Coin seed and the short classroom cooldown.

## Supply model

Because the Faucet **mints** Coin and the Store **mints** Packs on demand, supply is **effectively infinite over time**. This dissolves any "the legendary is so rare the album is uncompletable" worry: given enough time, every album is completable. Rarity becomes a *pacing* knob (how many packs / how long on average), not a hard scarcity limit.

Duplicates (`balance > 1` of a type) are the **fuel for trading**: you give your spare CEO, you get the CTO you're missing.

## Tuning levers

If pacing feels wrong during the course, adjust in this order:
1. **Onboarding seed** (more/fewer starter packs) — fastest lever for class-day experience.
2. **Faucet cooldown** (campaign mode) — controls between-class pacing.
3. **Legendary tier weight** — controls how punishing completion is.
4. **Pack price** — rarely needs touching since the faucet matches it 1:1.
