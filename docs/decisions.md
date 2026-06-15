# Decision Log

ADR-style record of the decisions made while designing `stellar-album`, and *why*. Each entry is a decision you'd otherwise have to re-derive.

---

## D1 — Soroban contracts, not classic Stellar assets
**Decision:** Build the logic in Soroban smart contracts.
**Why:** "Open pack → 3 stickers", atomic trade, and an album with state all require contract logic that classic assets can't express. The Coin is the only piece that *could* be classic, and even it is a contract (see D7).

## D2 — Sticker model: semi-fungible per type (Model A), not unique serialized NFTs (Model B)
**Decision:** Each sticker **type** is a token id with a balance per owner (`balance > 1` = duplicate). Not "CEO #0042"-style unique tokens.
**Why:** Model A materializes the *semi-fungible* concept, which is the richest teaching point — fungible within a type, non-fungible across types. Storage stays lean and duplicates (the fuel for trading) emerge naturally.
**Trade-off:** No per-unit provenance ("the 7th CEO ever minted"). Acceptable, because the object that carries uniqueness/state in this design is the **Album**, not the sticker — the sticker is consumable input (it gets burned).

## D3 — Album: soulbound, and "paste" = burn
**Decision:** The Album is a soulbound (non-transferable) NFT, one per person. Pasting a sticker **burns** it and marks the slot.
**Why:** Soulbound makes the album a personal "progress account" nobody can buy complete. Burn-on-paste removes the sticker from circulation, accumulates permanent album state, and naturally deflates sticker supply as people complete albums.
**Consequence:** A pasted sticker can never be traded again — which *strengthens* the trade narrative ("trade while it's loose; pasting is final"). UX must make this finality explicit.

## D4 — Randomness via `env.prng()`, with the exploit taught, not hidden
**Decision:** Use `env.prng()` for pack opening.
**Why / caveat:** `env.prng()` is **grindable** — a user can simulate the open, see the result, and only submit when favorable (free re-roll). It does **not** provide caller-unmanipulable randomness. This is **fine for a testnet demo** and is turned into a course module (demonstrate the re-roll attack live, then discuss mitigations: commit-reveal, future-entropy sources, economic cost). **Would not ship to mainnet with real value.** A loud code comment marks the open function.

## D5 — Trade via Escrow (custody), sticker↔sticker only
**Decision:** Asynchronous escrow: maker deposits a sticker into the contract and lists an offer; a taker accepts later. Sticker↔sticker only — no Coin on either side.
**Why:** Escrow is async (parties needn't be online together) and far simpler UX than a two-signer atomic swap. Custody-while-open is itself the lesson: the contract is the neutral, trustless custodian. Restricting to sticker↔sticker keeps the struct and code minimal.
**Rejected alternative:** Two-signers-in-one-transaction (no custody, but requires both parties online and coordinating the same tx — poor UX, and multi-auth is the part that breaks most).

## D6 — Faucet mints Coin (not a pre-funded treasury)
**Decision:** The Faucet is the Coin's minter.
**Why:** Simpler to operate (no refunding). Supply inflating on-chain is itself didactic.
**Trade-off:** Supply is effectively infinite; a pre-funded treasury would be finite/"more real". Accepted for a demo.

## D7 — Coin is an OpenZeppelin `fungible` contract, not a SAC
**Decision:** Implement the Coin as an OZ `fungible` (Base + Mintable) contract; the Faucet is the configured minter.
**Why:** This decision follows from D6. In a **SAC** (Stellar Asset Contract), `mint` is the **admin's exclusive privilege** (one account) — for a *contract* (the Faucet) to mint, it would have to become the SAC admin via `set_admin`, mixing the classic and Soroban worlds and confusing students. An OZ `fungible` contract lets the Faucet be a minter naturally, entirely within Soroban.
**Note:** If a class ever wants to teach "classic asset + SAC" explicitly, that can be an advanced topic showing `set_admin`.

## D8 — OpenZeppelin has no multi-token; Sticker is hand-rolled
**Finding (verified against OZ docs):** `stellar-tokens` ships `fungible`, `non-fungible` (Base/Consecutive/Enumerable), `RWA`, and `vault`. The `vault` is an **ERC-4626 fungible vault** (deposit fungible → shares) with no `token_id` — it does **not** fit a semi-fungible sticker. There is **no ERC-1155 / multi-token** module.
**Decision:** Hand-roll the Sticker multi-token over `Map<(Address, u32), i128>`. Reuse OZ `non-fungible` for the **Album** and OZ `fungible` for the **Coin**.
**Why it's good:** Building the "1155 from scratch" is the star teaching moment — students see what an abstraction would hide. Only 1 of the 3 tokens is artisanal; the library carries the other 2.

## D9 — Audience and format: developers, 4 classes, hybrid pacing
**Decision:** The audience is **developers** exploring the complete project across **4 classes**. Format: a live conceptual session per class plus a self-paced lab between classes.
**Why it matters:** This flipped an earlier scoping instinct to *cut* the album and the trade. For a dev audience over 4 classes, **completeness is the feature** — each of the 5 elements teaches a distinct point on the fungibility spectrum. The job became *sequencing the curriculum*, not trimming features.
**Success criterion:** by the end, a dev can (a) explain the whole spectrum, pointing to where each piece lives, and (b) reproduce the contracts from scratch. Each class has a "reproduce this" acceptance check.

---

## Open questions (not yet decided)

- **Class 3 density.** Pack + Album + the randomness module is a lot for one class. Keep together (strongest hook) or split the re-roll attack into an optional lab?
- **Delivery format.** Live/recorded with an instructor script, vs. written self-paced material — changes whether "reproduce this" is written as an instructor script or a standalone student checklist.
- **Art & consent.** 20 stickers means artwork for 20 real SDF people. This is a *content* dependency (not code) that can stall the project. Who produces the art? Have all featured colleagues consented? Recommended: decouple art from code with numbered placeholder avatars so the contract classes aren't blocked on final PNGs.
