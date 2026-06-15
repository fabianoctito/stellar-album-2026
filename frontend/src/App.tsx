import { useState } from "react";
import { connect } from "./lib/wallet";
import { ensureFunded } from "./lib/friendbot";
import { makeClients } from "./lib/clients";
import { stickerName, tier, TIER_STYLE } from "./lib/catalog";

type Clients = ReturnType<typeof makeClients>;

export default function App() {
  const [address, setAddress] = useState<string>();
  const [clients, setClients] = useState<Clients>();
  const [coin, setCoin] = useState<number>(0);
  const [packs, setPacks] = useState<number>(0);
  const [drawn, setDrawn] = useState<number[]>();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

  async function refresh(c: Clients, addr: string) {
    const bal = await c.coin.balance({ account: addr });
    setCoin(Number(bal.result));
    const p = await c.pack.balance({ owner: addr });
    setPacks(Number(p.result));
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

  const onClaim = () =>
    run("Claiming", async () => {
      const tx = await clients!.faucet.claim({ claimer: address! });
      await tx.signAndSend();
      await refresh(clients!, address!);
    });

  const onBuy = () =>
    run("Buying pack", async () => {
      const tx = await clients!.store.buy_pack({ buyer: address! });
      await tx.signAndSend();
      await refresh(clients!, address!);
    });

  const onOpen = () =>
    run("Opening pack", async () => {
      setDrawn(undefined);
      const tx = await clients!.pack.open({ opener: address! });
      const { result } = await tx.signAndSend();
      setDrawn((result as number[]).map(Number));
      await refresh(clients!, address!);
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-slate-800">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/70 backdrop-blur">
        <h1 className="text-xl font-bold">⭐ Stellar Album</h1>
        {address ? (
          <div className="flex items-center gap-4 text-sm">
            {/* Fungible: a pure balance, no identity */}
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-800">
              {coin} ⭐
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{packs} packs</span>
            <span className="text-slate-500">{short(address)}</span>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Connect wallet
          </button>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
        {!address && (
          <p className="text-center text-slate-500">
            Connect a wallet to claim coins, buy a pack, and open it.
          </p>
        )}

        {address && (
          <section className="grid grid-cols-3 gap-3">
            <Action label="Claim coins" hint="from the Faucet" onClick={onClaim} disabled={!!busy} />
            <Action
              label="Buy pack"
              hint="100 ⭐"
              onClick={onBuy}
              disabled={!!busy || coin < 100}
            />
            <Action
              label="Open pack"
              hint={packs > 0 ? "reveal 3 stickers" : "no packs"}
              onClick={onOpen}
              disabled={!!busy || packs < 1}
            />
          </section>
        )}

        {busy && <p className="text-center text-indigo-600 animate-pulse">{busy}…</p>}
        {error && (
          <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        )}

        {drawn && (
          <section>
            <h2 className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
              You pulled
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {drawn.map((t, i) => (
                <Sticker key={i} typeId={t} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Action({
  label,
  hint,
  onClick,
  disabled,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm transition hover:shadow-md disabled:opacity-40 disabled:hover:shadow-sm"
    >
      <span className="font-semibold">{label}</span>
      <span className="text-xs text-slate-500">{hint}</span>
    </button>
  );
}

// Non-fungible-ish: an identifiable object with a name + rarity, not a number.
function Sticker({ typeId }: { typeId: number }) {
  const t = tier(typeId);
  return (
    <div
      className={`flex aspect-[3/4] flex-col items-center justify-center rounded-xl bg-gradient-to-b ring-2 ${TIER_STYLE[t]}`}
    >
      <div className="text-3xl">🧑‍🚀</div>
      <div className="mt-2 text-sm font-bold">{stickerName(typeId)}</div>
      <div className="text-xs uppercase tracking-wide opacity-80">{t}</div>
    </div>
  );
}
