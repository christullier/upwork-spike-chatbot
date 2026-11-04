import { useSyncExternalStore } from 'react'
import { buildSeed } from '../data/seed'
import type { DemoData, Lead, LogMessage, Session } from './types'

const KEY = 'summit-assist-demo-v1'
let data: DemoData
const listeners = new Set<() => void>()

function load(): DemoData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DemoData
  } catch { /* ignore */ }
  const seed = buildSeed()
  persist(seed)
  return seed
}
function persist(d: DemoData) {
  try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* ignore */ }
}
function commit(next: DemoData) {
  data = next
  persist(next)
  listeners.forEach((l) => l())
}
data = load()

export const useData = () =>
  useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb) }, () => data)

const uid = (p: string) => p + Math.random().toString(36).slice(2, 9)

export function startSession(): string {
  const s: Session = { id: uid('s'), startedAt: Date.now(), messages: [], intents: [], answered: 0, missed: 0, handoffs: 0 }
  commit({ ...data, sessions: [s, ...data.sessions] })
  return s.id
}
function patchSession(id: string, fn: (s: Session) => Session) {
  commit({ ...data, sessions: data.sessions.map((s) => (s.id === id ? fn(s) : s)) })
}
export function logMessage(id: string, m: Omit<LogMessage, 'ts'>) {
  patchSession(id, (s) => ({ ...s, messages: [...s.messages, { ...m, ts: Date.now() }] }))
}
export function logIntent(id: string, intent: string) {
  patchSession(id, (s) => ({
    ...s,
    intents: [...s.intents, intent],
    answered: s.answered + (intent !== 'fallback' && intent !== 'human' && intent !== 'quote' && intent !== 'book' ? 1 : 0),
    missed: s.missed + (intent === 'fallback' ? 1 : 0),
    handoffs: s.handoffs + (intent === 'human' ? 1 : 0),
  }))
}
export function logUnanswered(sessionId: string, text: string) {
  commit({ ...data, unanswered: [{ id: uid('u'), text, ts: Date.now(), sessionId }, ...data.unanswered] })
}
export function logQuote(sessionId: string, total: number) {
  patchSession(sessionId, (s) => ({ ...s, quoteTotal: total }))
}
export function addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
  const l: Lead = { ...lead, id: uid('l'), createdAt: Date.now(), status: 'New' }
  commit({
    ...data,
    leads: [l, ...data.leads],
    sessions: data.sessions.map((s) => (s.id === lead.sessionId ? { ...s, leadId: l.id, intents: [...s.intents, 'lead'] } : s)),
  })
  return l
}
export function setLeadStatus(id: string, status: Lead['status']) {
  commit({ ...data, leads: data.leads.map((l) => (l.id === id ? { ...l, status } : l)) })
}
export function resetDemo() { commit(buildSeed()) }

export function crmPayload(l: Lead) {
  return {
    source: 'summit-assist-chatbot',
    event: 'lead.created',
    created_at: new Date(l.createdAt).toISOString(),
    contact: { full_name: l.name, email: l.email, phone: l.phone, zip: l.zip, city: l.city },
    service_request: { service: l.service, urgency: l.urgency, home_sq_ft: l.sqft ?? null },
    quote: { currency: 'USD', low: l.quoteLow, high: l.quoteHigh },
    status: l.status,
    conversation_id: l.sessionId,
  }
}
