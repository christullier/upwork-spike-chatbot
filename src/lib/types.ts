export interface QuoteLine { label: string; amount: number; note?: string }
export interface QuoteResult {
  serviceId: string
  serviceName: string
  urgencyName: string
  sqft?: number
  tankless?: boolean
  base: number
  total: number
  low: number
  high: number
  lineItems: QuoteLine[]
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  zip: string
  city: string
  service: string
  urgency: string
  sqft?: number
  quoteLow: number
  quoteHigh: number
  createdAt: number
  status: 'New' | 'Contacted' | 'Booked'
  sessionId: string
}

export interface LogMessage {
  role: 'user' | 'bot'
  text: string
  ts: number
}

export interface Session {
  id: string
  startedAt: number
  messages: LogMessage[]
  intents: string[]
  answered: number
  missed: number
  handoffs: number
  quoteTotal?: number
  leadId?: string
}

export interface Unanswered { id: string; text: string; ts: number; sessionId: string }

export interface DemoData { leads: Lead[]; sessions: Session[]; unanswered: Unanswered[] }

export const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
