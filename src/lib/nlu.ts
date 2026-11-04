import Fuse from 'fuse.js'
import { FAQ } from '../data/faq'

export const THRESHOLD = 0.45

const index = new Fuse(
  FAQ.flatMap((f) => f.examples.map((text) => ({ intent: f.intent, text }))),
  { keys: ['text'], includeScore: true, ignoreLocation: true, threshold: 0.6, minMatchCharLength: 3 },
)

export interface Classification { intent: string; score: number }

const QUOTE_RE = /\b(quote|quotes|price|prices|pricing estimate|cost|estimate|how much)\b/i
const BOOK_RE = /\b(book|schedule|appointment|technician|sign me up)\b/i
const HUMAN_RE = /\b(human|agent|person|representative|rep|someone|operator|call me)\b/i

export function classify(text: string): Classification {
  const t = text.trim()
  if (HUMAN_RE.test(t)) return { intent: 'human', score: 1 }
  if (/\b(reschedule|cancel|change|move)\b/i.test(t) && /appointment|booking|visit/i.test(t)) return { intent: 'reschedule', score: 0.95 }
  if (/\b(do you|can you|are you)\b.*\b(charge|fee|fees)\b|hidden fee/i.test(t)) return { intent: 'pricing', score: 0.9 }
  if (QUOTE_RE.test(t) && !/\b(charge|fee|fees|hidden)\b/i.test(t)) return { intent: 'quote', score: 0.95 }
  if (BOOK_RE.test(t) && !/\b(reschedule|cancel|change|move)\b/i.test(t)) return { intent: 'book', score: 0.9 }
  const hit = index.search(t)[0]
  if (!hit) return { intent: 'fallback', score: 0 }
  const score = 1 - (hit.score ?? 1)
  return score >= THRESHOLD ? { intent: hit.item.intent, score } : { intent: 'fallback', score }
}
