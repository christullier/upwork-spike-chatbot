import { FAQ } from '../data/faq'
import { PHONE, SERVICE_AREA } from '../data/serviceArea'
import { SERVICES, URGENCIES } from '../data/services'
import { calcQuote } from './quote'
import { classify } from './nlu'
import { fmt, type Lead, type QuoteResult } from './types'

export type Step =
  | 'idle' | 'quote.service' | 'quote.sqft' | 'quote.tankless' | 'quote.urgency' | 'quote.result'
  | 'lead.name' | 'lead.email' | 'lead.phone' | 'lead.zip' | 'lead.confirm' | 'done'

export interface FlowData {
  serviceId?: string; sqft?: number; tankless?: boolean; urgencyId?: string; quote?: QuoteResult
  name?: string; email?: string; phone?: string; zip?: string
}
export interface FlowState { step: Step; data: FlowData }
export type BotMsg = { kind: 'text'; text: string } | { kind: 'quote'; quote: QuoteResult }

export interface FlowResult {
  state: FlowState
  replies: BotMsg[]
  chips: string[]
  intent?: string
  unanswered?: string
  quote?: QuoteResult
  lead?: Omit<Lead, 'id' | 'createdAt' | 'status'>
}

export const INITIAL: FlowState = { step: 'idle', data: {} }
export const MAIN_CHIPS = ['Get a quote', 'Book service', 'Ask a question', 'Talk to a human']
export const GREETING = "Hi! I'm Summit Assist, the virtual helper for Summit Home Services. I can price a job, book a visit or answer questions."

const t = (text: string): BotMsg => ({ kind: 'text', text })
const serviceChips = SERVICES.map((s) => s.name)
const urgencyChips = URGENCIES.map((u) => u.name)

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())
export const phoneDigits = (s: string) => {
  const d = s.replace(/\D/g, '')
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d
}
export const formatPhone = (d: string) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`

function findService(text: string) {
  const x = text.toLowerCase()
  const exact = SERVICES.find((s) => s.name.toLowerCase() === x)
  if (exact) return exact
  const rules: [RegExp, string][] = [
    [/tune|maintenance|check.?up/, 'ac-tune'], [/install|new (ac|air)|replace.*(ac|air)/, 'ac-install'],
    [/water heater|tankless/, 'water-heater'], [/furnace|heater|heating/, 'furnace'],
    [/drain|clog|sewer/, 'drain'], [/leak|pipe|plumb/, 'leak'], [/ac|air|cool/, 'ac-repair'],
  ]
  const hit = rules.find(([re]) => re.test(x))
  return hit ? SERVICES.find((s) => s.id === hit[1]) : undefined
}
function findUrgency(text: string) {
  const x = text.toLowerCase()
  if (/emerg|same.?day|asap|now|today/.test(x)) return URGENCIES[2]
  if (/next|tomorrow/.test(x)) return URGENCIES[1]
  if (/standard|week|normal|no rush|flexible/.test(x)) return URGENCIES[0]
  return undefined
}

function showQuote(state: FlowState): FlowResult {
  const d = state.data
  const q = calcQuote(d.serviceId!, d.sqft, d.urgencyId!, d.tankless)
  return {
    state: { step: 'quote.result', data: { ...d, quote: q } },
    replies: [t('Here is your estimate:'), { kind: 'quote', quote: q }, t('Prices are a range because final cost depends on what the technician finds on site.')],
    chips: ['Book this', 'New quote', 'Ask a question'],
    quote: q,
  }
}

function askService(): FlowResult {
  return { state: { step: 'quote.service', data: {} }, replies: [t('Which service do you need?')], chips: serviceChips }
}

function handoff(): FlowResult {
  return {
    state: { step: 'idle', data: {} },
    replies: [t(`No problem. A real person can help. Call us at ${PHONE} (24/7 for emergencies), or leave your details and we will call you back.`)],
    chips: ['Get a quote', 'Book service'], intent: 'human',
  }
}

function askCurrent(state: FlowState, prefix?: string): FlowResult {
  const q: Record<string, [string, string[]]> = {
    'quote.service': ['Which service do you need?', serviceChips],
    'quote.sqft': ['About how many square feet is your home? (for example 2000)', []],
    'quote.tankless': ['Do you want a standard tank or a tankless unit?', ['Standard tank', 'Tankless (+$1,200)']],
    'quote.urgency': ['When do you need it?', urgencyChips],
    'lead.name': ['What is your full name?', []],
    'lead.email': ['What is your email address?', []],
    'lead.phone': ['What is the best phone number?', []],
    'lead.zip': ['What is your ZIP code?', []],
  }
  const [text, chips] = q[state.step] ?? ['How can I help?', MAIN_CHIPS]
  return { state, replies: [t((prefix ? prefix + ' ' : '') + text)], chips }
}

export function step(state: FlowState, input: string, sessionId: string): FlowResult {
  const text = input.trim()
  const lower = text.toLowerCase()
  const d = state.data

  // Global escapes
  if (state.step !== 'idle') {
    if (lower === 'new quote') return startQuote()
    if (/^(cancel|start over|restart|nevermind|never mind|stop)$/.test(lower)) {
      return { state: INITIAL, replies: [t('No problem, starting fresh. How can I help?')], chips: MAIN_CHIPS }
    }
    if (/\b(human|agent|representative|real person)\b/.test(lower)) return handoff()
  }

  switch (state.step) {
    case 'quote.service': {
      const svc = findService(text)
      if (!svc) return askCurrent(state, "Sorry, I didn't catch that service.")
      const next: FlowState = { step: 'quote.urgency', data: { serviceId: svc.id } }
      if (svc.needsSqFt) return askCurrent({ step: 'quote.sqft', data: next.data })
      if (svc.tankless) return askCurrent({ step: 'quote.tankless', data: next.data })
      return askCurrent(next)
    }
    case 'quote.sqft': {
      const n = Number(text.replace(/[,\s]|sq\.?\s?ft\.?|sqft|square feet/gi, ''))
      if (!Number.isFinite(n) || n < 400 || n > 10000) return askCurrent(state, 'Please enter a size between 400 and 10,000 sq ft.')
      return askCurrent({ step: 'quote.urgency', data: { ...d, sqft: Math.round(n) } })
    }
    case 'quote.tankless': {
      const tankless = /tankless/.test(lower)
      if (!tankless && !/tank|standard/.test(lower)) return askCurrent(state, "I didn't catch that.")
      return askCurrent({ step: 'quote.urgency', data: { ...d, tankless } })
    }
    case 'quote.urgency': {
      const u = findUrgency(text)
      if (!u) return askCurrent(state, "I didn't catch that.")
      return showQuote({ step: 'quote.urgency', data: { ...d, urgencyId: u.id } })
    }
    case 'quote.result': {
      if (/book|yes|schedule|sure|ok/.test(lower)) {
        return { state: { step: 'lead.name', data: d }, replies: [t('Great! I just need a few details to lock this in. What is your full name?')], chips: [], intent: 'book' }
      }
      break // fall through to idle behaviour
    }
    case 'lead.name': {
      if (text.length < 2 || !/[a-z]/i.test(text)) return askCurrent(state, 'Please enter your name.')
      return askCurrent({ step: 'lead.email', data: { ...d, name: text.replace(/\s+/g, ' ') } })
    }
    case 'lead.email': {
      if (!isValidEmail(text)) return askCurrent(state, "That email doesn't look right (try name@example.com).")
      return askCurrent({ step: 'lead.phone', data: { ...d, email: text } })
    }
    case 'lead.phone': {
      const p = phoneDigits(text)
      if (p.length !== 10) return askCurrent(state, `I need a 10-digit US phone number (you gave ${p.length} digit${p.length === 1 ? '' : 's'}).`)
      return askCurrent({ step: 'lead.zip', data: { ...d, phone: formatPhone(p) } })
    }
    case 'lead.zip': {
      const z = text.replace(/\D/g, '').slice(0, 5)
      if (!/^\d{5}$/.test(text.trim().slice(0, 5)) || z.length !== 5) return askCurrent(state, 'Please enter a 5-digit ZIP code.')
      if (!SERVICE_AREA[z]) {
        return {
          state, chips: ['Talk to a human'],
          replies: [t(`Sorry, ${z} is outside our service area (Rocklin, Roseville, Loomis, Granite Bay, Folsom, Orangevale, Auburn). Try another ZIP, or call ${PHONE}.`)],
        }
      }
      const nd = { ...d, zip: z }
      return {
        state: { step: 'lead.confirm', data: nd },
        replies: [t(`Please confirm:\n${nd.name}\n${nd.email}\n${nd.phone}\n${z} (${SERVICE_AREA[z]})\n${nd.quote!.serviceName}: ${fmt(nd.quote!.low)}–${fmt(nd.quote!.high)}`)],
        chips: ['Confirm', 'Start over'],
      }
    }
    case 'lead.confirm': {
      if (/confirm|yes|correct|looks good|ok|sure/.test(lower)) {
        const q = d.quote!
        return {
          state: { step: 'done', data: d },
          replies: [t(`You're all set, ${d.name!.split(' ')[0]}! A coordinator will call you within 1 business hour to confirm your appointment. A text confirmation is on its way.`)],
          chips: ['Get a quote', 'Ask a question'],
          lead: {
            name: d.name!, email: d.email!, phone: d.phone!, zip: d.zip!, city: SERVICE_AREA[d.zip!], service: q.serviceName,
            urgency: q.urgencyName, sqft: q.sqft, quoteLow: q.low, quoteHigh: q.high, sessionId,
          },
        }
      }
      return askCurrent({ step: 'lead.confirm', data: d }, 'Please choose Confirm or Start over.')
    }
  }

  // idle / done / quote.result free text
  if (lower === 'ask a question') {
    return {
      state: INITIAL, replies: [t('Sure! Ask me anything, or tap a topic. I can answer questions about hours, service area, financing, warranty and more.')],
      chips: ['Do you offer financing?', 'What are your hours?', 'Are you licensed?', 'My AC is not cooling'],
    }
  }
  const c = classify(text)
  if (c.intent === 'human') return handoff()
  if (c.intent === 'quote' || c.intent === 'book') {
    const r = askService()
    r.replies = [t(c.intent === 'book' ? "Happy to book you in. I'll price it first so there are no surprises. Which service do you need?" : 'Happy to help. Which service do you need?')]
    r.intent = c.intent
    return r
  }
  if (c.intent === 'fallback') {
    return {
      state: { step: 'idle', data: {} },
      replies: [t("I'm not sure about that one yet. I've noted it so our team can add an answer. Want to talk to a person, or try a quote?")],
      chips: ['Talk to a human', 'Get a quote'], intent: 'fallback', unanswered: text,
    }
  }
  const faq = FAQ.find((f) => f.intent === c.intent)!
  const followUp = c.intent === 'water-heater-leak' ? ['Get a quote', 'Talk to a human'] : c.intent === 'ac-tips' ? ['Get a quote', 'Talk to a human'] : ['Get a quote', 'Ask a question']
  return { state: { step: 'idle', data: {} }, replies: [t(faq.answer)], chips: followUp, intent: c.intent }
}

export function startQuote(): FlowResult {
  const r = askService()
  r.replies = [t('Happy to help. Which service do you need?')]
  r.intent = 'quote'
  return r
}
