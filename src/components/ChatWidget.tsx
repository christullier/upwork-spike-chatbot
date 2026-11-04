import { useCallback, useEffect, useRef, useState } from 'react'
import { addLead, logIntent, logMessage, logQuote, logUnanswered, startSession } from '../lib/store'
import { GREETING, INITIAL, MAIN_CHIPS, startQuote, step, type BotMsg, type FlowResult, type FlowState } from '../lib/flow'
import { fmt } from '../lib/types'
import QuoteCard from './QuoteCard'

interface UiMsg { id: number; role: 'user' | 'bot'; msg: BotMsg }
export const OPEN_EVENT = 'summit:open-chat'
let nextId = 1

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<UiMsg[]>([])
  const [chips, setChips] = useState<string[]>([])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const flow = useRef<FlowState>(INITIAL)
  const sessionId = useRef<string | null>(null)
  const busy = useRef(false)
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const greeted = useRef(false)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing, chips])

  const sid = () => (sessionId.current ??= startSession())

  const deliver = useCallback(async (r: FlowResult, session: string) => {
    flow.current = r.state
    busy.current = true
    setChips([])
    for (const m of r.replies) {
      setTyping(true)
      await new Promise((res) => setTimeout(res, 400 + Math.random() * 300))
      setTyping(false)
      setMsgs((p) => [...p, { id: nextId++, role: 'bot', msg: m }])
      logMessage(session, { role: 'bot', text: m.kind === 'text' ? m.text : `Estimate: ${fmt(m.quote.low)}–${fmt(m.quote.high)} for ${m.quote.serviceName} (${m.quote.urgencyName}).` })
    }
    if (r.intent) logIntent(session, r.intent)
    if (r.unanswered) logUnanswered(session, r.unanswered)
    if (r.quote) logQuote(session, r.quote.total)
    if (r.lead) {
      addLead(r.lead)
      sessionId.current = null // next interaction starts a new conversation
    }
    setChips(r.chips)
    busy.current = false
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0)
  }, [])

  const send = useCallback((text: string) => {
    const t = text.trim()
    if (!t || busy.current) return
    const session = sid()
    setMsgs((p) => [...p, { id: nextId++, role: 'user', msg: { kind: 'text', text: t } }])
    logMessage(session, { role: 'user', text: t })
    setInput('')
    void deliver(step(flow.current, t, session), session)
  }, [deliver])

  const greet = useCallback(() => {
    if (greeted.current) return
    greeted.current = true
    setMsgs([{ id: nextId++, role: 'bot', msg: { kind: 'text', text: GREETING } }])
    setChips(MAIN_CHIPS)
  }, [])

  useEffect(() => {
    const on = (e: Event) => {
      const wantQuote = (e as CustomEvent).detail?.quote
      setOpen(true)
      if (wantQuote) {
        const session = sid()
        if (!greeted.current) { greeted.current = true; setMsgs([{ id: nextId++, role: 'bot', msg: { kind: 'text', text: GREETING } }]) }
        if (flow.current.step === 'idle' || flow.current.step === 'done') {
          setMsgs((p) => [...p, { id: nextId++, role: 'user', msg: { kind: 'text', text: 'Get a quote' } }])
          logMessage(session, { role: 'user', text: 'Get a quote' })
          void deliver(startQuote(), session)
        }
      } else greet()
    }
    window.addEventListener(OPEN_EVENT, on)
    return () => window.removeEventListener(OPEN_EVENT, on)
  }, [deliver, greet])

  const toggle = () => { setOpen((o) => !o); greet() }
  const lastBotQuoteId = [...msgs].reverse().find((m) => m.msg.kind === 'quote')?.id

  return (
    <>
      {!open && (
        <button onClick={toggle} aria-label="Open chat" className="fixed bottom-5 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-white shadow-xl transition hover:scale-105 hover:bg-brand-800">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
          <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-ember" />
        </button>
      )}
      {open && (
        <div className="pop fixed inset-0 z-50 flex h-[100dvh] flex-col bg-white sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-2.5rem)] sm:w-[400px] sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-slate-200" role="dialog" aria-label="Summit Assist chat">
          <header className="flex items-center gap-3 bg-brand-700 px-4 py-3 text-white sm:rounded-t-2xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 font-bold">S</div>
            <div className="flex-1">
              <div className="text-sm font-semibold leading-tight">Summit Assist</div>
              <div className="flex items-center gap-1.5 text-xs text-brand-100"><span className="h-2 w-2 rounded-full bg-emerald-300" />Online · replies instantly</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 hover:bg-white/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </header>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {msgs.map((m) => m.msg.kind === 'quote' ? (
              <div key={m.id} className="max-w-[92%]">
                <QuoteCard quote={m.msg.quote} canBook={m.id === lastBotQuoteId && flow.current.step === 'quote.result' && !typing} onBook={() => send('Book this')} />
              </div>
            ) : (
              <div key={m.id} className={`pop flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'}`}>
                  {m.msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start" aria-label="Assistant is typing">
                <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                  {[0, 1, 2].map((i) => <span key={i} className="dot h-1.5 w-1.5 rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
          </div>

          {chips.length > 0 && !typing && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50 px-4 pb-2 pt-2">
              {chips.map((c) => (
                <button key={c} onClick={() => send(c)} className="rounded-full border border-brand-600 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50">
                  {c}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 sm:rounded-b-2xl">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message…" aria-label="Message"
              className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-base outline-none focus:border-brand-600 focus:bg-white sm:text-sm" />
            <button type="submit" disabled={!input.trim()} className="rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-40">Send</button>
          </form>
        </div>
      )}
    </>
  )
}
