import ChatWidget, { OPEN_EVENT } from '../components/ChatWidget'
import { SERVICES } from '../data/services'
import { PHONE } from '../data/serviceArea'

const openChat = (quote: boolean) => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { quote } }))

const CARDS = [
  { title: 'Heating & Cooling', desc: 'Tune-ups, repairs and full system installs for every season.', from: 'AC Tune-up from $129', color: 'from-sky-500 to-brand-600' },
  { title: 'Plumbing', desc: 'Water heaters, drains and leak repair with upfront pricing.', from: 'Drain cleaning from $149', color: 'from-orange-400 to-ember' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="white"><path d="M3 26 13 8l6 10 4-6 6 14z" /></svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Summit Home Services</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-500 sm:inline">Call {PHONE}</span>
            <a href="#/admin" className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">View Admin Dashboard →</a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-100">Rocklin · Roseville · Granite Bay · Folsom</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Heating, Cooling &amp; Plumbing in Placer County</h1>
          <p className="mt-4 max-w-xl text-lg text-brand-100">Licensed, insured and on time. Get an instant price from our virtual assistant, then book in under two minutes, any hour of the day.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => openChat(true)} className="rounded-xl bg-ember px-6 py-3 font-semibold shadow-lg transition hover:brightness-110">Get a Quote</button>
            <button onClick={() => openChat(false)} className="rounded-xl border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10">Ask a question</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map((c) => (
            <div key={c.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className={`h-24 bg-gradient-to-r ${c.color}`} />
              <div className="p-6">
                <h2 className="text-xl font-semibold">{c.title}</h2>
                <p className="mt-1 text-slate-600">{c.desc}</p>
                <p className="mt-3 text-sm font-medium text-brand-700">{c.from}</p>
                <button onClick={() => openChat(true)} className="mt-4 text-sm font-semibold text-ember hover:underline">Get a quote →</button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-14 text-lg font-semibold">Upfront rate table</h3>
        <p className="text-sm text-slate-500">The assistant prices jobs from these published rates.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Notes</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {SERVICES.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 tabular-nums">${s.base.toLocaleString()}{s.perSqFt ? ` + $${s.perSqFt.toFixed(2)}/sq ft` : ''}</td>
                  <td className="px-4 py-3 text-slate-500">{s.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">Next-day ×1.15 · Emergency same-day ×1.5 · Quotes shown as a range (−10% / +15%).</p>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        Demo — local NLP; production version connects to an LLM + your CRM.
      </footer>
      <ChatWidget />
    </div>
  )
}
