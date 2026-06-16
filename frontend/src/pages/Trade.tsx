import { useState } from "react";
import { useStore } from "../store";
import { Page, SectionHead, Field, Toast } from "../components/ui";
import { TYPES } from "../lib/catalog";

export default function Trade() {
  const { collection, busy, error, createOffer, acceptOffer, cancelOffer } = useStore();
  const owned = TYPES.filter((t) => (collection[t] ?? 0) > 0);

  const [give, setGive] = useState(0);
  const [want, setWant] = useState(1);
  const [created, setCreated] = useState<string>();
  const [acceptId, setAcceptId] = useState("");

  const onCreate = async () => {
    const id = await createOffer(give, want);
    if (id) setCreated(id);
  };
  const onCancel = async (id: string) => {
    await cancelOffer(id);
    setCreated(undefined);
  };

  return (
    <Page>
      <SectionHead
        title="Trade"
        sub="A swap runs through an escrow contract: no middleman holds your sticker, the code does. It is why a smart contract earns its place here."
      />

      <div className="rounded-2xl bg-cream p-6 ring-1 ring-edge">
        <h3 className="font-display text-lg font-bold text-ink">Make an offer</h3>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="You give">
            <select value={give} onChange={(e) => setGive(Number(e.target.value))} disabled={owned.length === 0} className="rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-edge focus-visible:outline-2 focus-visible:outline-leaf disabled:opacity-50">
              {owned.length === 0 ? <option>nothing yet</option> : owned.map((t) => <option key={t} value={t}>#{t} ({collection[t]})</option>)}
            </select>
          </Field>
          <span className="pb-2 text-ink-soft">for</span>
          <Field label="You want">
            <select value={want} onChange={(e) => setWant(Number(e.target.value))} className="rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-edge focus-visible:outline-2 focus-visible:outline-leaf">
              {TYPES.map((t) => <option key={t} value={t}>#{t}</option>)}
            </select>
          </Field>
          <button onClick={onCreate} disabled={!!busy || owned.length === 0} className="rounded-lg bg-leaf-deep px-4 py-2 text-sm font-bold text-paper transition hover:bg-leaf disabled:opacity-40">
            Put on the table
          </button>
        </div>

        {created && (
          <p className="mt-4 rounded-lg bg-leaf-tint px-4 py-3 text-sm text-leaf-deep">
            Offer <b>#{created}</b> is on the table. 🔒 Your sticker is held in escrow until someone accepts. Share the number, or{" "}
            <button onClick={() => onCancel(created)} disabled={!!busy} className="font-bold underline">take it back</button>.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-cream p-6 ring-1 ring-edge">
        <h3 className="font-display text-lg font-bold text-ink">Accept an offer</h3>
        <p className="mt-1 text-sm text-ink-soft">Got an offer number from another collector? You need the sticker they want.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="Offer #">
            <input value={acceptId} onChange={(e) => setAcceptId(e.target.value)} inputMode="numeric" placeholder="id" className="w-28 rounded-lg bg-paper px-3 py-2 text-sm ring-1 ring-edge focus-visible:outline-2 focus-visible:outline-leaf" />
          </Field>
          <button onClick={() => acceptOffer(acceptId)} disabled={!!busy || !acceptId} className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-40">
            Accept
          </button>
        </div>
      </div>

      <Toast busy={busy} error={error} />
    </Page>
  );
}
