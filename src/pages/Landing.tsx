import ChatWidget, { OPEN_EVENT } from '../components/ChatWidget'
import { SERVICES } from '../data/services'
import { PHONE } from '../data/serviceArea'

const openChat = (quote: boolean) => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { quote } }))

const CARDS = [
  { title: 'Heating & Cooling', desc: 'Tune-ups, repairs and full system installs for every season.', from: 'AC Tune-up from $129', color: 'from-sky-500 to-brand-600', icon: 'flame' },
  { title: 'Plumbing', desc: 'Water heaters, drains and leak repair with upfront pricing.', from: 'Drain cleaning from $149', color: 'from-orange-400 to-ember', icon: 'wrench' },
] as const

function ServiceIcon({ name }: { name: 'flame' | 'wrench' }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'flame' ? (
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      ) : (
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      )}
    </svg>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="white"><path d="M3 26 13 8l6 10 4-6 6 14z" /></svg>
            </div>
            <span className="whitespace-nowrap text-[15px] font-bold tracking-tight sm:text-lg">Summit Home Services</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
            <a
              href={`tel:${PHONE.replace(/[^\d+]/g, '')}`}
              aria-label={`Call ${PHONE}`}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-50 sm:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </a>
            <span className="hidden text-slate-500 sm:inline">Call {PHONE}</span>
            <a href="#/admin" className="flex min-h-11 items-center rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">View Admin Dashboard →</span>
            </a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">Rocklin · Roseville · Granite Bay · Folsom</p>
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
              <div className={`flex h-24 items-center justify-center bg-gradient-to-r ${c.color}`}>
                <ServiceIcon name={c.icon} />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold">{c.title}</h2>
                <p className="mt-1 text-slate-600">{c.desc}</p>
                <p className="mt-3 text-sm font-medium text-brand-700">{c.from}</p>
                <button onClick={() => openChat(true)} className="mt-4 inline-flex items-center text-sm font-semibold text-ember hover:underline max-sm:min-h-11">Get a quote →</button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-14 text-lg font-semibold">Upfront rate table</h3>
        <p className="text-sm text-slate-500">The assistant prices jobs from these published rates.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="rate-table w-full text-left text-sm md:min-w-[420px]">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Notes</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {SERVICES.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 tabular-nums" data-label="Base">${s.base.toLocaleString()}{s.perSqFt ? ` + $${s.perSqFt.toFixed(2)}/sq ft` : ''}</td>
                  <td className="px-4 py-3 text-slate-500" data-label="Notes">{s.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">Next-day ×1.15 · Emergency same-day ×1.5 · Quotes shown as a range (−10% / +15%).</p>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600">
        Demo — local NLP; production version connects to an LLM + your CRM.
      </footer>
      <ChatWidget />
    </div>
  )
}
