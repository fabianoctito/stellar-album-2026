# The Fungibility Spectrum

This is the conceptual spine of the entire project. Every contract is placed deliberately on a line that runs from **purely fungible** to **purely non-fungible** — and one piece (the trade) exists to justify why a smart contract is needed at all.

## The line

```
FUNGIBLE  ◄──────────────────────────────────────────────────►  NON-FUNGIBLE

  Coin            Pack            Sticker            Album
  (pure)       (collapses        (semi-            (pure,
               on opening)        fungible)        soulbound)
   │               │                 │                 │
   │               │                 │                 │
 balance      interchangeable   type has copies    one per person,
 only         while sealed,     (duplicates),      unique state,
              unique after      types differ       intransferable
              opening

                        Escrow  ───►  the trustless swap that
                                       connects the pieces
```

## Each position, explained

### Coin — fungible (pure)
A coin's state is just **a number per address**. One unit is indistinguishable from any other; they are divisible and interchangeable. There is no identity. This is the cleanest possible example of fungibility.

→ Implemented as an OpenZeppelin `fungible` token. See [architecture](architecture.md#coin).

### Pack — fungible *until opened*
This is the most beautiful hook of the course. A **sealed** pack is fungible: every sealed pack of the same series is interchangeable, and you don't know what's inside. The moment you open it, fungibility **collapses** — it is burned and becomes 3 specific (semi-fungible) stickers. The same asset crosses the spectrum in a single transaction.

→ Implemented as an NFT whose `open` burns it and mints 3 stickers via `env.prng()`. See [architecture](architecture.md#pack).

### Sticker — semi-fungible
A sticker lives in the *middle* of the spectrum. The "CEO" sticker is a **type**; your two copies of the CEO are fungible *with each other* (that's what a duplicate is), but the CEO type is distinct from the CTO type. This is the multi-token (ERC-1155-style) model: fungible **within** a type, non-fungible **across** types.

→ Implemented as a hand-rolled multi-token: `Map<(Address, u32), i128>` — owner × type_id → quantity. See [architecture](architecture.md#sticker).

### Album — non-fungible (pure)
The album is the opposite extreme. There is exactly **one per person**, it is **soulbound** (cannot be transferred), and it carries **unique state**: which of the 20 slots you have filled. Your album's history is yours alone. Pasting a sticker **burns** it and marks the slot — irreversible.

→ Implemented as a soulbound NFT (OpenZeppelin `non-fungible` with transfer blocked). See [architecture](architecture.md#album).

### Escrow — why a smart contract exists at all
The trade isn't a point on the spectrum; it's the **answer to "why not just use a database?"** Two collectors swap stickers with no trusted intermediary: the contract takes custody of the maker's sticker, and the swap is **atomic** — it either happens completely or not at all. This is the trustlessness argument made tangible.

→ Implemented as a sticker↔sticker escrow. See [architecture](architecture.md#escrow).

## How the spectrum maps to the course

Each class anchors on one region of the spectrum, in order of conceptual difficulty:

1. **Class 1 — Coin + Faucet:** fungible (pure).
2. **Class 2 — Sticker:** semi-fungible (the conceptual leap).
3. **Class 3 — Pack + Album:** the *collapse* (fungible → unique) and non-fungible (pure, soulbound).
4. **Class 4 — Store + Escrow:** the economy and the trustless trade.

See the [curriculum](curriculum/).

## Teaching device

A one-page **spectrum diagram** (the line above, rendered visually with each contract plotted on it) is referenced at the start of every class, so the student always knows *where on the line* the day's contract lives. This is the mental poster of the course.
