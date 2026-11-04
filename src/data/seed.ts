import type { DemoData, Lead, LogMessage, Session, Unanswered } from '../lib/types'

const MIN = 60_000
const H = 60 * MIN

type Turn = ['u' | 'b', string]

function session(id: string, ago: number, turns: Turn[], intents: string[], extra: Partial<Session> = {}, now = Date.now()): Session {
  const start = now - ago
  const messages: LogMessage[] = turns.map(([r, text], i) => ({ role: r === 'u' ? 'user' : 'bot', text, ts: start + i * 25_000 }))
  return { id, startedAt: start, messages, intents, answered: 0, missed: 0, handoffs: 0, ...extra }
}

export function buildSeed(now = Date.now()): DemoData {
  const sessions: Session[] = [
    session('s1', 26 * H, [
      ['u', 'Get a quote'], ['b', 'Happy to help! Which service do you need?'], ['u', 'New AC Install'],
      ['b', 'About how many square feet is your home?'], ['u', '2000'], ['b', 'When do you need it?'], ['u', 'Standard'],
      ['b', 'Estimate: $5,670–$7,245 for New AC Install (2,000 sq ft).'], ['u', 'Book this'],
      ['b', 'Great! What is your full name?'], ['u', 'Dana Whitfield'], ['b', 'Thanks Dana. Booked! A coordinator will call within 1 business hour.'],
    ], ['quote', 'lead'], { quoteTotal: 6300, leadId: 'l1' }, now),
    session('s2', 22 * H, [
      ['u', 'what are your hours'], ['b', 'We are open Mon–Fri 7am–6pm and Sat 8am–2pm. Emergency calls are answered 24/7.'],
    ], ['hours'], { answered: 1 }, now),
    session('s3', 19 * H, [
      ['u', 'my water heater is leaking!'], ['b', 'Turn off the power (or gas) and the cold-water valve on top of the heater. This is an emergency. I can book a technician now.'],
      ['u', 'yes quote please'], ['b', 'Estimate: $3,510–$4,485 for Water Heater Replace, tankless (Emergency same-day).'], ['u', 'Book this'], ['b', 'Booked! Marcus will be in touch shortly.'],
    ], ['water-heater-leak', 'quote', 'lead'], { answered: 1, quoteTotal: 3900, leadId: 'l2' }, now),
    session('s4', 15 * H, [
      ['u', 'do you install solar panels?'], ['b', "I'm not sure about that one. I have noted it for the team. Want to talk to a human?"], ['u', 'no thanks'],
    ], ['fallback'], { missed: 1 }, now),
    session('s5', 11 * H, [
      ['u', 'do you offer financing?'], ['b', 'Yes. We offer 0% APR for 12 months on installs over $3,000 (with approved credit).'],
      ['u', 'ok get me a quote'], ['b', 'Estimate: $5,670–$7,245 for New AC Install (2,000 sq ft).'], ['u', 'Book this'], ['b', 'Booked! A coordinator will call you.'],
    ], ['financing', 'quote', 'lead'], { answered: 1, quoteTotal: 6300, leadId: 'l3' }, now),
    session('s6', 8 * H, [
      ['u', 'ac not cooling'], ['b', 'Try these first: set thermostat to Cool, replace a dirty filter, check the breaker...'], ['u', 'did all that'],
      ['b', "I'm not sure about that one. Want to talk to a human?"], ['u', 'yes human'], ['b', 'Connecting you. Call (916) 555-0142 any time.'],
    ], ['ac-tips', 'fallback', 'human'], { answered: 1, missed: 1, handoffs: 1 }, now),
    session('s7', 6 * H, [
      ['u', 'Get a quote'], ['b', 'Which service do you need?'], ['u', 'Drain Cleaning'], ['b', 'When do you need it?'], ['u', 'Next-day'],
      ['b', 'Estimate: $154–$197 for Drain Cleaning (Next-day).'], ['u', 'Book this'], ['b', 'Booked! We will call to confirm your window.'],
    ], ['quote', 'lead'], { quoteTotal: 171, leadId: 'l4' }, now),
    session('s8', 4 * H, [
      ['u', 'are you licensed and insured?'], ['b', 'Yes. We are California-licensed (CSLB #1054321), bonded and fully insured.'],
      ['u', 'what areas do you serve'], ['b', 'We serve Rocklin, Roseville, Loomis, Granite Bay, Folsom, Orangevale and Auburn.'],
    ], ['license', 'service-area'], { answered: 2 }, now),
    session('s9', 150 * MIN, [
      ['u', 'can you fix my pool pump'], ['b', "I'm not sure about that one. Want to talk to a human?"], ['u', 'what about a hot tub heater'],
      ['b', "Sorry, I still don't have an answer for that. Call (916) 555-0142."],
    ], ['fallback', 'fallback'], { missed: 2 }, now),
    session('s10', 70 * MIN, [
      ['u', 'Get a quote'], ['b', 'Which service?'], ['u', 'Furnace Repair'], ['b', 'When do you need it?'], ['u', 'Emergency same-day'],
      ['b', 'Estimate: $242–$309 for Furnace Repair (Emergency same-day).'], ['u', 'Book this'], ['b', 'Booked! A technician is being dispatched.'],
      ['u', 'do you take apple pay'], ['b', 'We accept all major credit cards, debit, ACH, checks and Apple Pay.'],
    ], ['quote', 'lead', 'payment'], { answered: 1, quoteTotal: 269, leadId: 'l5' }, now),
  ]

  const lead = (id: string, name: string, email: string, phone: string, zip: string, city: string, service: string, urgency: string, lo: number, hi: number, ago: number, status: Lead['status'], sessionId: string, sqft?: number): Lead => ({
    id, name, email, phone, zip, city, service, urgency, sqft, quoteLow: lo, quoteHigh: hi, createdAt: now - ago, status, sessionId,
  })
  const leads: Lead[] = [
    lead('l1', 'Dana Whitfield', 'dana.whitfield@example.com', '(916) 555-0188', '95661', 'Roseville', 'New AC Install', 'Standard', 5670, 7245, 26 * H, 'Booked', 's1', 2000),
    lead('l2', 'Marcus Oyelaran', 'marcus.o@example.com', '(916) 555-0173', '95677', 'Rocklin', 'Water Heater Replace', 'Emergency same-day', 3510, 4485, 19 * H, 'Contacted', 's3'),
    lead('l3', 'Priya Natarajan', 'priya.n@example.com', '(916) 555-0121', '95765', 'Rocklin', 'New AC Install', 'Standard', 5670, 7245, 11 * H, 'New', 's5', 2000),
    lead('l4', 'Tom Kessler', 'tkessler@example.com', '(530) 555-0166', '95603', 'Auburn', 'Drain Cleaning', 'Next-day', 154, 197, 6 * H, 'Contacted', 's7'),
    lead('l5', 'Elena Marchetti', 'elena.m@example.com', '(916) 555-0109', '95746', 'Granite Bay', 'Furnace Repair', 'Emergency same-day', 242, 309, 70 * MIN, 'New', 's10'),
    lead('l6', 'Jordan Pike', 'jpike@example.com', '(916) 555-0152', '95630', 'Folsom', 'AC Tune-up', 'Standard', 116, 148, 40 * MIN, 'New', 's10'),
  ]
  const unanswered: Unanswered[] = [
    { id: 'u1', text: 'do you install solar panels?', ts: now - 15 * H, sessionId: 's4' },
    { id: 'u2', text: 'can you fix my pool pump', ts: now - 150 * MIN, sessionId: 's9' },
    { id: 'u3', text: 'what about a hot tub heater', ts: now - 145 * MIN, sessionId: 's9' },
  ]
  return { leads, sessions, unanswered }
}
