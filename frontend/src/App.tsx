import { useState } from "react";
import { connect } from "./lib/wallet";
import { ensureFunded } from "./lib/friendbot";
import { makeClients } from "./lib/clients";
import { stickerName, tier, TIER_STYLE, TYPE_COUNT } from "./lib/catalog";

type Clients = ReturnType<typeof makeClients>;
const TYPES = Array.from({ length: TYPE_COUNT }, (_, i) => i);

function fmtRemaining(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.max(1, Math.floor(sec))}s`;
}

export default function App() {
  const [address, setAddress] = useState<string>();
  const [clients, setClients] = useState<Clients>();
  const [coin, setCoin] = useState(0);
  const [packs, setPacks] = useState(0);
  const [collection, setCollection] = useState<number[]>([]);
  const [pasted, setPasted] = useState<boolean[]>([]);
  const [hasAlbum, setHasAlbum] = useState(false);
  const [drawn, setDrawn] = useState<number[]>();
  const [claimAt, setClaimAt] = useState(0);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  // Trade form
  const [giveType, setGiveType] = useState<number>(0);
  const [wantType, setWantType] = useState<number>(1);
  const [createdOfferId, setCreatedOfferId] = useState<string>();
  const [acceptId, setAcceptId] = useState("");

  const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;
  const now = Date.now() / 1000;
  const claimReady = claimAt === 0 || now >= claimAt;
  const ownedTypes = TYPES.filter((t) => (collection[t] ?? 0) > 0);

  async function refresh(c: Clients, addr: string): Promise<number[]> {
    const [coinR, packR, lastR, cdR, hasAlbumR] = await Promise.all([
      c.coin.balance({ account: addr }),
      c.pack.balance({ owner: addr }),
      c.faucet.last_claim({ claimer: addr }),
      c.faucet.cooldown(),
      c.album.has_album({ owner: addr }),
    ]);
    setCoin(Number(coinR.result));
    setPacks(Number(packR.result));
    const last = Number(lastR.result);
    setClaimAt(last === 0 ? 0 : last + Number(cdR.result));
    setHasAlbum(Boolean(hasAlbumR.result));

    const [coll, past] = await Promise.all([
      Promise.all(TYPES.map((t) => c.sticker.balance({ owner: addr, sticker_type: t }).then((r) => Number(r.result)))),
      Promise.all(TYPES.map((t) => c.album.is_pasted({ owner: addr, sticker_type: t }).then((r) => Boolean(r.result)))),
    ]);
    setCollection(coll);
    setPasted(past);
    return coll;
  }

  async function run<T>(label: string, fn: () => Promise<T>) {
    setBusy(label);
    setError(undefined);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(undefined);
    }
  }

  const onConnect = () =>
    run("Connecting", async () => {
      const addr = await connect();
      await ensureFunded(addr);
      const c = makeClients(addr);
      setAddress(addr);
      setClients(c);
      await refresh(c, addr);
    });

  const send = (label: string, build: () => Promise<{ signAndSend: () => Promise<unknown> }>) =>
    run(label, async () => {
      const tx = await build();
      await tx.signAndSend();
      await refresh(clients!, address!);
    });

  const onClaim = () => send("Claiming", () => clients!.faucet.claim({ claimer: address! }));
  const onBuy = () => send("Buying pack", () => clients!.store.buy_pack({ buyer: address! }));
  const onOpenAlbum = () => send("Opening album", () => clients!.album.open_album({ owner: address! }));
  const onPaste = (t: number) =>
    send("Pasting", () => clients!.album.paste({ owner: address!, sticker_type: t }));

  const onOpen = () =>
    run("Opening pack", async () => {
      setDrawn(undefined);
      const before = await refresh(clients!, address!);
      const sent = await (await clients!.pack.open({ opener: address! })).signAndSend();
      const resp = sent.getTransactionResponse as unknown as { status?: string };
      if (resp?.status && resp.status !== "SUCCESS") {
        throw new Error(`open reverted on-chain (status=${resp.status})`);
      }
      const after = await refresh(clients!, address!);
      const d: number[] = [];
      for (const t of TYPES) for (let k = 0; k < after[t] - before[t]; k++) d.push(t);
      setDrawn(d);
    });

  const onCreateOffer = () =>
    run("Creating offer", async () => {
      const sent = await (
        await clients!.escrow.create_offer({ maker: address!, give_type: giveType, want_type: wantType })
      ).signAndSend();
      let id = "?";
      try {
        id = String(sent.result);
      } catch {
        /* id parse is best-effort */
      }
      setCreatedOfferId(id);
      await refresh(clients!, address!);
    });

  const onAcceptOffer = () =>
    send("Accepting offer", () => clients!.escrow.accept_offer({ taker: address!, offer_id: BigInt(acceptId) }));
  const onCancelOffer = (id: string) =>
    run("Cancelling offer", async () => {
      await (await clients!.escrow.cancel_offer({ offer_id: BigInt(id) })).signAndSend();
      setCreatedOfferId(undefined);
      await refresh(clients!, address!);
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-slate-800">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur">
        <h1 className="text-xl font-bold">⭐ Stellar Album</h1>
        {address ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-800">{coin} ⭐</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{packs} packs</span>
            <span className="text-slate-500">{short(address)}</span>
          </div>
        ) : (
          <button onClick={onConnect} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Connect wallet
          </button>
        )}
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        {!address && <p className="text-center text-slate-500">Connect a wallet to claim coins, buy a pack, and open it.</p>}

        {address && (
          <section className="grid grid-cols-3 gap-3">
            <Action label="Claim coins" hint={claimReady ? "from the Faucet" : `next in ${fmtRemaining(claimAt - now)}`} onClick={onClaim} disabled={!!busy || !claimReady} />
            <Action label="Buy pack" hint="100 ⭐" onClick={onBuy} disabled={!!busy || coin < 100} />
            <Action label="Open pack" hint={packs > 0 ? "reveal 3 stickers" : "no packs"} onClick={onOpen} disabled={!!busy || packs < 1} />
          </section>
        )}

        {busy && <p className="text-center text-indigo-600">{busy}…</p>}
        {error && <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {drawn && (
          <section>
            <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">You pulled</h2>
            <div className="grid grid-cols-3 gap-4" style={{ perspective: "800px" }}>
              {drawn.map((t, i) => (
                <div key={i} style={{ animation: "pop-in 0.5s ease-out both", animationDelay: `${i * 0.2}s` }}>
                  <Sticker typeId={t} />
                </div>
              ))}
            </div>
          </section>
        )}

        {address && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your collection</h2>
              <span className="text-sm text-slate-500">{ownedTypes.length}/{TYPE_COUNT} types</span>
            </div>
            {ownedTypes.length === 0 ? (
              <p className="text-center text-slate-400">No stickers yet — open a pack!</p>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {ownedTypes.map((t) => (
                  <div key={t} className="flex flex-col gap-1">
                    <Sticker typeId={t} qty={collection[t]} />
                    {pasted[t] ? (
                      <span className="text-center text-xs text-emerald-600">✓ in album</span>
                    ) : hasAlbum ? (
                      <button onClick={() => onPaste(t)} disabled={!!busy} className="rounded bg-emerald-600 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40">
                        Paste
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {address && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Album</h2>
            {!hasAlbum ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Your soulbound album — one per person. Pasting a sticker burns it into a slot, forever.</p>
                <button onClick={onOpenAlbum} disabled={!!busy} className="ml-4 shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
                  Start album
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">{pasted.filter(Boolean).length}/{TYPE_COUNT} slots filled{pasted.filter(Boolean).length === TYPE_COUNT && " — complete! 🎉"}</p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {TYPES.map((t) =>
                    pasted[t] ? (
                      <div key={t} className={`flex aspect-[3/4] items-center justify-center rounded-lg bg-gradient-to-b text-xs font-bold ring-2 ${TIER_STYLE[tier(t)]}`}>#{t}</div>
                    ) : (
                      <div key={t} className="flex aspect-[3/4] items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-300">#{t}</div>
                    ),
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {address && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Trade (sticker ↔ sticker)</h2>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm">
                Give
                <select value={giveType} onChange={(e) => setGiveType(Number(e.target.value))} className="ml-2 rounded border border-slate-300 px-2 py-1">
                  {ownedTypes.map((t) => (
                    <option key={t} value={t}>#{t} ({collection[t]})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Want
                <select value={wantType} onChange={(e) => setWantType(Number(e.target.value))} className="ml-2 rounded border border-slate-300 px-2 py-1">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>#{t}</option>
                  ))}
                </select>
              </label>
              <button onClick={onCreateOffer} disabled={!!busy || ownedTypes.length === 0} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
                Create offer
              </button>
            </div>
            {createdOfferId && (
              <p className="mt-3 text-sm text-emerald-700">
                Offer <b>#{createdOfferId}</b> created — share this id; your sticker is held in escrow until accepted or cancelled.{" "}
                <button onClick={() => onCancelOffer(createdOfferId)} disabled={!!busy} className="font-semibold underline">cancel</button>
              </p>
            )}
            <div className="mt-4 flex items-end gap-3 border-t border-slate-100 pt-4">
              <label className="text-sm">
                Accept offer #
                <input value={acceptId} onChange={(e) => setAcceptId(e.target.value)} inputMode="numeric" className="ml-2 w-24 rounded border border-slate-300 px-2 py-1" placeholder="id" />
              </label>
              <button onClick={onAcceptOffer} disabled={!!busy || !acceptId} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-40">
                Accept
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Action({ label, hint, onClick, disabled }: { label: string; hint: string; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm transition hover:shadow-md disabled:opacity-40 disabled:hover:shadow-sm">
      <span className="font-semibold">{label}</span>
      <span className="text-xs text-slate-500">{hint}</span>
    </button>
  );
}

// Identifiable object with a name + rarity. `qty` shows stacked duplicates.
function Sticker({ typeId, qty }: { typeId: number; qty?: number }) {
  const t = tier(typeId);
  return (
    <div className={`relative flex aspect-[3/4] flex-col items-center justify-center rounded-xl bg-gradient-to-b ring-2 ${TIER_STYLE[t]}`}>
      {qty != null && qty > 1 && (
        <span className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white">×{qty}</span>
      )}
      <div className="text-3xl">🧑‍🚀</div>
      <div className="mt-2 text-sm font-bold">{stickerName(typeId)}</div>
      <div className="text-xs uppercase tracking-wide opacity-80">{t}</div>
    </div>
  );
}
