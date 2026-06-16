import { useState, type ReactNode } from "react";
import { connect } from "./lib/wallet";
import { ensureFunded } from "./lib/friendbot";
import { makeClients } from "./lib/clients";
import { stickerName, tier, TIER_FACE, TIER_GLYPH, TIER_LABEL, TYPE_COUNT } from "./lib/catalog";

type Clients = ReturnType<typeof makeClients>;
const TYPES = Array.from({ length: TYPE_COUNT }, (_, i) => i);

function fmtRemaining(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.max(1, Math.floor(sec))}s`;
}

async function readCollection(c: Clients, owner: string): Promise<number[]> {
  return Promise.all(
    TYPES.map((t) => c.sticker.balance({ owner, sticker_type: t }).then((r) => Number(r.result))),
  );
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
  const [showReveal, setShowReveal] = useState(false);
  const [claimAt, setClaimAt] = useState(0);
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  const [giveType, setGiveType] = useState(0);
  const [wantType, setWantType] = useState(1);
  const [createdOfferId, setCreatedOfferId] = useState<string>();
  const [acceptId, setAcceptId] = useState("");

  const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;
  const now = Date.now() / 1000;
  const claimReady = claimAt === 0 || now >= claimAt;
  const ownedTypes = TYPES.filter((t) => (collection[t] ?? 0) > 0);
  const filled = pasted.filter(Boolean).length;

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
    setClaimAt(Number(lastR.result) === 0 ? 0 : Number(lastR.result) + Number(cdR.result));
    setHasAlbum(Boolean(hasAlbumR.result));
    const [coll, past] = await Promise.all([
      readCollection(c, addr),
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
      await (await build()).signAndSend();
      await refresh(clients!, address!);
    });

  const onClaim = () => send("Claiming coins", () => clients!.faucet.claim({ claimer: address! }));
  const onBuy = () => send("Buying a pack", () => clients!.store.buy_pack({ buyer: address! }));
  const onOpenAlbum = () => send("Binding album", () => clients!.album.open_album({ owner: address! }));
  const onPaste = (t: number) => send("Pasting", () => clients!.album.paste({ owner: address!, sticker_type: t }));

  const onOpen = () =>
    run("Ripping the pack", async () => {
      setShowReveal(false);
      const before = await refresh(clients!, address!);
      const sent = await (await clients!.pack.open({ opener: address! })).signAndSend();
      const resp = sent.getTransactionResponse as unknown as { status?: string };
      if (resp?.status && resp.status !== "SUCCESS") throw new Error(`pack open reverted on-chain (status=${resp.status})`);
      const after = await refresh(clients!, address!);
      const d: number[] = [];
      for (const t of TYPES) for (let k = 0; k < after[t] - before[t]; k++) d.push(t);
      if (d.length === 0) throw new Error("pack opened but no new stickers were detected");
      setDrawn(d);
      setShowReveal(true);
    });

  const onCreateOffer = () =>
    run("Putting it on the table", async () => {
      const sent = await (await clients!.escrow.create_offer({ maker: address!, give_type: giveType, want_type: wantType })).signAndSend();
      let id = "?";
      try {
        id = String(sent.result);
      } catch {
        /* best-effort id */
      }
      setCreatedOfferId(id);
      await refresh(clients!, address!);
    });

  const onAcceptOffer = () =>
    send("Accepting offer", () => clients!.escrow.accept_offer({ taker: address!, offer_id: BigInt(acceptId) }));
  const onCancelOffer = (id: string) =>
    run("Taking it back", async () => {
      await (await clients!.escrow.cancel_offer({ offer_id: BigInt(id) })).signAndSend();
      setCreatedOfferId(undefined);
      await refresh(clients!, address!);
    });

  return (
    <div className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-20 border-b border-edge bg-kraft">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-extrabold tracking-tight text-ink">Stellar Album</span>
            <span className="text-leaf">✦</span>
          </div>
          {address && (
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-leaf-tint px-3 py-1 font-display font-bold text-leaf-deep">{coin} ⭐</span>
              <span className="rounded-full bg-paper px-3 py-1 text-ink-soft ring-1 ring-edge">{packs} {packs === 1 ? "pack" : "packs"}</span>
              <span className="hidden rounded-full bg-paper px-3 py-1 font-mono text-xs text-ink-soft ring-1 ring-edge sm:inline">{short(address)}</span>
            </div>
          )}
        </div>
      </header>

      {!address ? (
        <section className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mx-auto mb-10 grid h-44 w-36 place-items-center rounded-3xl bg-leaf-deep legendary-foil shadow-xl" style={{ transform: "rotate(-6deg)" }}>
            <span className="font-display text-2xl font-extrabold tracking-wide text-paper">PACK</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">Collect the people who build Stellar.</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">Claim coins, rip open packs of SDF stickers, press your favourites into a soulbound album, and swap your doubles. Live on Stellar testnet.</p>
          <button onClick={onConnect} disabled={!!busy} className="mt-8 rounded-full bg-leaf-deep px-7 py-3.5 font-display text-lg font-bold text-paper shadow-md transition hover:bg-leaf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf disabled:opacity-50">
            {busy ? `${busy}…` : "Connect wallet to start"}
          </button>
          <p className="mt-3 text-xs text-ink-soft">Freighter on Testnet. We fund your account for you, no XLM needed.</p>
          {error && <p className="mx-auto mt-5 max-w-md rounded-xl bg-paper px-4 py-3 text-sm text-ink ring-1 ring-edge">{error}</p>}
        </section>
      ) : (
        <main className="mx-auto max-w-4xl px-5 pb-24">
          {/* Counter: claim + buy are secondary; ripping a pack is the hero. */}
          <section className="pt-8">
            <div className="flex flex-col gap-3 rounded-2xl bg-kraft p-3 ring-1 ring-edge sm:flex-row">
              <div className="flex flex-1 gap-2">
                <CounterButton title="Claim coins" sub={claimReady ? "free from the faucet" : `ready in ${fmtRemaining(claimAt - now)}`} onClick={onClaim} disabled={!!busy || !claimReady} />
                <CounterButton title="Buy a pack" sub="100 ⭐" onClick={onBuy} disabled={!!busy || coin < 100} />
              </div>
              <button onClick={onOpen} disabled={!!busy || packs < 1} className="rounded-xl bg-leaf-deep px-6 py-4 font-display text-lg font-bold text-paper shadow-md transition hover:bg-leaf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf disabled:opacity-40 disabled:shadow-none sm:min-w-[38%]">
                {packs > 0 ? `Rip a pack · ${packs}` : "No packs to open"}
              </button>
            </div>
            {busy && <p className="mt-3 text-center text-sm text-leaf-deep" role="status">{busy}…</p>}
            {error && <p className="mt-3 rounded-xl bg-paper px-4 py-3 text-sm text-ink ring-1 ring-edge" role="alert">{error}</p>}
          </section>

          {/* Album */}
          <section className="pt-12">
            <SectionHead title="Album" right={hasAlbum ? `${filled} of ${TYPE_COUNT}` : "soulbound, one per collector"} />
            {!hasAlbum ? (
              <div className="flex flex-col items-center gap-5 rounded-2xl bg-cream p-6 ring-1 ring-edge sm:flex-row">
                <div className="grid h-28 w-24 shrink-0 place-items-center rounded-xl bg-kraft ring-1 ring-edge" style={{ transform: "rotate(-3deg)" }}>
                  <span className="font-display text-sm font-bold text-ink-soft">EMPTY</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-lg font-bold text-ink">Bind your album</h3>
                  <p className="mt-1 max-w-sm text-sm text-ink-soft">One per collector, yours forever. Pasting a sticker presses it in permanently, so it leaves your drawer for good.</p>
                  <button onClick={onOpenAlbum} disabled={!!busy} className="mt-3 rounded-full bg-leaf-deep px-5 py-2 text-sm font-bold text-paper transition hover:bg-leaf disabled:opacity-40">Start my album</button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-cream p-5 ring-1 ring-edge">
                <ProgressMeter value={filled} max={TYPE_COUNT} />
                <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {TYPES.map((t) =>
                    pasted[t] ? (
                      <div key={t} className={`flex aspect-[3/4] items-center justify-center rounded-lg font-display text-sm font-bold text-ink ${TIER_FACE[tier(t)]}`}>#{t}</div>
                    ) : (
                      <div key={t} className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-edge text-xs text-ink-soft/50">#{t}</div>
                    ),
                  )}
                </div>
                {filled === TYPE_COUNT && <p className="mt-4 text-center font-display font-bold text-leaf-deep">Album complete. You collected the whole crew.</p>}
              </div>
            )}
          </section>

          {/* Loose stickers / drawer */}
          <section className="pt-12">
            <SectionHead title="Your stickers" right={`${ownedTypes.length} of ${TYPE_COUNT} types`} />
            {ownedTypes.length === 0 ? (
              <p className="rounded-2xl bg-cream px-5 py-10 text-center text-ink-soft ring-1 ring-edge">Your drawer is empty. Rip open a pack to start collecting.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {ownedTypes.map((t) => (
                  <div key={t} className="flex flex-col gap-1.5">
                    <Sticker typeId={t} qty={collection[t]} />
                    {pasted[t] ? (
                      <span className="text-center text-xs font-semibold text-leaf-deep">✓ in album</span>
                    ) : hasAlbum ? (
                      <button onClick={() => onPaste(t)} disabled={!!busy} className="rounded-lg bg-leaf-tint py-1 text-xs font-bold text-leaf-deep transition hover:bg-leaf hover:text-paper disabled:opacity-40">Paste in</button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trade */}
          <section className="pt-12">
            <SectionHead title="Trade" right="sticker for sticker, no middleman" />
            <div className="rounded-2xl bg-cream p-5 ring-1 ring-edge">
              <div className="flex flex-wrap items-end gap-3">
                <Field label="You give">
                  <select value={giveType} onChange={(e) => setGiveType(Number(e.target.value))} className="rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-edge focus-visible:outline-2 focus-visible:outline-leaf">
                    {ownedTypes.length === 0 ? <option>nothing yet</option> : ownedTypes.map((t) => <option key={t} value={t}>#{t} ({collection[t]})</option>)}
                  </select>
                </Field>
                <span className="pb-2 text-ink-soft">for</span>
                <Field label="You want">
                  <select value={wantType} onChange={(e) => setWantType(Number(e.target.value))} className="rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-edge focus-visible:outline-2 focus-visible:outline-leaf">
                    {TYPES.map((t) => <option key={t} value={t}>#{t}</option>)}
                  </select>
                </Field>
                <button onClick={onCreateOffer} disabled={!!busy || ownedTypes.length === 0} className="rounded-lg bg-leaf-deep px-4 py-2 text-sm font-bold text-paper transition hover:bg-leaf disabled:opacity-40">Put on the table</button>
              </div>
              {createdOfferId && (
                <p className="mt-4 rounded-lg bg-leaf-tint px-4 py-3 text-sm text-leaf-deep">
                  Offer <b>#{createdOfferId}</b> is on the table. 🔒 Your sticker is held in escrow until someone accepts. Share the number, or{" "}
                  <button onClick={() => onCancelOffer(createdOfferId)} disabled={!!busy} className="font-bold underline">take it back</button>.
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-edge pt-4">
                <Field label="Accept offer #">
                  <input value={acceptId} onChange={(e) => setAcceptId(e.target.value)} inputMode="numeric" placeholder="id" className="w-28 rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-edge focus-visible:outline-2 focus-visible:outline-leaf" />
                </Field>
                <button onClick={onAcceptOffer} disabled={!!busy || !acceptId} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-40">Accept</button>
              </div>
            </div>
          </section>
        </main>
      )}

      {showReveal && drawn && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-ink/60 px-6" style={{ animation: "scrim-in 0.25s ease-out both" }} onClick={() => setShowReveal(false)}>
          <p className="font-display text-2xl font-extrabold text-paper">You ripped open a pack</p>
          <div className="flex gap-3 sm:gap-5" style={{ perspective: "1000px" }} onClick={(e) => e.stopPropagation()}>
            {drawn.map((t, i) => (
              <div key={i} className="w-24 sm:w-36" style={{ animation: "pop-in 0.55s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${0.12 + i * 0.22}s` }}>
                <Sticker typeId={t} big />
              </div>
            ))}
          </div>
          <button onClick={() => setShowReveal(false)} className="rounded-full bg-paper px-6 py-2.5 font-display font-bold text-ink shadow-md transition hover:bg-cream">Add to collection</button>
        </div>
      )}
    </div>
  );
}

function CounterButton({ title, sub, onClick, disabled }: { title: string; sub: string; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-1 flex-col items-start rounded-xl bg-paper px-4 py-3 text-left ring-1 ring-edge transition hover:ring-leaf/50 focus-visible:outline-2 focus-visible:outline-leaf disabled:opacity-45 disabled:hover:ring-edge">
      <span className="font-display font-bold text-ink">{title}</span>
      <span className="text-xs text-ink-soft">{sub}</span>
    </button>
  );
}

function SectionHead({ title, right }: { title: string; right?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {right && <span className="text-sm text-ink-soft">{right}</span>}
    </div>
  );
}

function ProgressMeter({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-kraft">
        <div className="h-full origin-left rounded-full bg-leaf transition-transform duration-500" style={{ transform: `scaleX(${max ? value / max : 0})` }} />
      </div>
      <span className="font-display text-sm font-bold text-ink">{value}/{max}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
      {children}
    </label>
  );
}

// The collectible itself: an identifiable object with a name + rarity.
// `qty` shows stacked duplicates; legendary carries a holographic sheen.
function Sticker({ typeId, qty, big }: { typeId: number; qty?: number; big?: boolean }) {
  const t = tier(typeId);
  return (
    <div className={`relative flex aspect-[3/4] flex-col items-center justify-center rounded-2xl px-2 ${TIER_FACE[t]}`}>
      {qty != null && qty > 1 && (
        <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold text-paper">×{qty}</span>
      )}
      <div className={`relative z-10 ${big ? "text-5xl" : "text-3xl"}`} aria-hidden>🧑‍🚀</div>
      <div className={`relative z-10 mt-1 font-display font-bold text-ink ${big ? "text-base" : "text-xs"}`}>{stickerName(typeId)}</div>
      <div className={`relative z-10 mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${TIER_LABEL[t]}`}>
        <span aria-hidden>{TIER_GLYPH[t]}</span>
        {t}
      </div>
    </div>
  );
}
