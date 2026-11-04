import { fmt, type QuoteResult } from '../lib/types'

export default function QuoteCard({ quote, onBook, canBook }: { quote: QuoteResult; onBook: () => void; canBook: boolean }) {
  return (
    <div className="pop w-full overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="bg-brand-700 px-4 py-3 text-white">
        <div className="text-xs uppercase tracking-wide text-brand-100">{quote.serviceName} · {quote.urgencyName}</div>
        <div className="text-2xl font-semibold">{fmt(quote.low)} – {fmt(quote.high)}</div>
      </div>
      <ul className="divide-y divide-slate-100 px-4 text-sm">
        {quote.lineItems.map((l, i) => (
          <li key={i} className="flex justify-between gap-3 py-2">
            <span className="text-slate-600">{l.label}</span>
            <span className="font-medium tabular-nums">{l.note ?? fmt(l.amount)}</span>
          </li>
        ))}
        <li className="flex justify-between py-2 font-semibold">
          <span>Estimated total</span><span className="tabular-nums">{fmt(quote.total)}</span>
        </li>
      </ul>
      <div className="px-4 pb-4">
        <button onClick={onBook} disabled={!canBook} className="w-full rounded-xl bg-ember px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40">
          Book this
        </button>
      </div>
    </div>
  )
}
