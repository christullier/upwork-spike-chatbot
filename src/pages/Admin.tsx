import { useMemo, useState } from 'react'
import { crmPayload, resetDemo, setLeadStatus, useData } from '../lib/store'
import { FAQ } from '../data/faq'
import { fmt, type Lead } from '../lib/types'

const LABELS: Record<string, string> = {
  quote: 'Quote request', lead: 'Lead captured', book: 'Booking request', fallback: 'Unanswered (fallback)', human: 'Human handoff',
  ...Object.fromEntries(FAQ.map((f) => [f.intent, f.label])),
}
const ago = (ts: number) => {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.round(m / 60)}h ago`
  return `${Math.round(m / 1440)}d ago`
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) } catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
  }
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl" data-testid={`kpi-${label}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  )
}

export default function Admin() {
  const { leads, sessions, unanswered } = useData()
  const [openSession, setOpenSession] = useState<string | null>(null)
  const [json, setJson] = useState<Lead | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const stats = useMemo(() => {
    const quotes = sessions.filter((s) => s.quoteTotal != null)
    const avg = quotes.length ? quotes.reduce((a, s) => a + (s.quoteTotal ?? 0), 0) / quotes.length : 0
    const answered = sessions.reduce((a, s) => a + s.answered, 0)
    const missed = sessions.reduce((a, s) => a + s.missed + s.handoffs, 0)
    const containment = answered + missed ? Math.round((answered / (answered + missed)) * 100) : 100
    const counts: Record<string, number> = {}
    sessions.forEach((s) => s.intents.forEach((i) => { counts[i] = (counts[i] ?? 0) + 1 }))
    const intents = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return { quotes: quotes.length, avg, containment, intents }
  }, [sessions])

  const max = Math.max(1, ...stats.intents.map(([, n]) => n))
  const session = sessions.find((s) => s.id === openSession)

  const doCopy = async (l: Lead) => { await copy(JSON.stringify(crmPayload(l), null, 2)); setCopied(l.id); setJson(l); setTimeout(() => setCopied(null), 1500) }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="text-xl font-bold">Summit Assist · Admin</h1>
            <p className="text-sm text-slate-500">What the chatbot captured and what it could not answer</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (confirm('Reset all demo data to the original sample set?')) resetDemo() }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Reset demo data</button>
            <a href="#/" className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800">← Back to site &amp; chat</a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Kpi label="Conversations" value={sessions.length} />
          <Kpi label="Leads captured" value={leads.length} />
          <Kpi label="Quotes given" value={stats.quotes} />
          <Kpi label="Avg quote value" value={fmt(stats.avg)} />
          <Kpi label="Containment rate" value={`${stats.containment}%`} hint="Answered without handoff" />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-4 py-3 font-semibold">Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>{['Name', 'Contact', 'ZIP', 'Service', 'Quote', 'When', 'Status', 'CRM'].map((h) => <th key={h} className="px-4 py-2.5">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100" data-testid="leads">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-slate-600"><div>{l.email}</div><div className="text-xs text-slate-400">{l.phone}</div></td>
                    <td className="px-4 py-3">{l.zip}<div className="text-xs text-slate-400">{l.city}</div></td>
                    <td className="px-4 py-3">{l.service}<div className="text-xs text-slate-400">{l.urgency}</div></td>
                    <td className="px-4 py-3 tabular-nums">{fmt(l.quoteLow)}–{fmt(l.quoteHigh)}</td>
                    <td className="px-4 py-3 text-slate-500">{ago(l.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select value={l.status} onChange={(e) => setLeadStatus(l.id, e.target.value as Lead['status'])} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs">
                        {['New', 'Contacted', 'Booked'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3"><button onClick={() => doCopy(l)} className="whitespace-nowrap rounded-md border border-brand-600 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">{copied === l.id ? 'Copied ✓' : 'Copy CRM JSON'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {json && (
          <section className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-100 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Integration preview · POST to CRM webhook (HubSpot / Zapier style)</h2>
              <button onClick={() => setJson(null)} className="text-xs text-slate-400 hover:text-white">Close</button>
            </div>
            <pre className="overflow-x-auto text-xs leading-relaxed text-emerald-200">{JSON.stringify(crmPayload(json), null, 2)}</pre>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Intent breakdown</h2>
            <div className="space-y-2.5" data-testid="intents">
              {stats.intents.map(([k, n]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-slate-600">{LABELS[k] ?? k}</span><span className="font-medium tabular-nums">{n}</span></div>
                  <div className="h-2.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${k === 'fallback' ? 'bg-ember' : 'bg-brand-600'}`} style={{ width: `${(n / max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Unanswered questions <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-ember">{unanswered.length}</span></h2>
            <p className="mb-3 text-xs text-slate-500">Messages the bot scored below the confidence threshold. Add answers to improve it.</p>
            <ul className="divide-y divide-slate-100" data-testid="unanswered">
              {unanswered.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <button className="text-left hover:underline" onClick={() => setOpenSession(u.sessionId)}>“{u.text}”</button>
                  <span className="shrink-0 text-xs text-slate-400">{ago(u.ts)}</span>
                </li>
              ))}
              {unanswered.length === 0 && <li className="py-2 text-sm text-slate-400">Nothing yet. The bot answered everything.</li>}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-4 py-3 font-semibold">Conversation log</h2>
          <div className="grid md:grid-cols-[320px_1fr]">
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto border-slate-100 md:border-r">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button onClick={() => setOpenSession(s.id)} className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${s.id === openSession ? 'bg-brand-50' : ''}`}>
                    <div className="flex justify-between text-xs text-slate-400"><span>{ago(s.startedAt)}</span><span>{s.messages.length} msgs{s.leadId ? ' · lead' : ''}</span></div>
                    <div className="truncate">{s.messages.find((m) => m.role === 'user')?.text ?? '(no messages)'}</div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="max-h-96 min-h-48 space-y-2 overflow-y-auto bg-slate-50 p-4">
              {!session && <p className="text-sm text-slate-400">Select a conversation to read the transcript.</p>}
              {session?.messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`max-w-[80%] whitespace-pre-line rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-brand-700 text-white' : 'bg-white ring-1 ring-slate-200'}`}>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="pb-8 pt-2 text-center text-xs text-slate-500">Demo — local NLP; production version connects to an LLM + your CRM.</footer>
    </div>
  )
}
