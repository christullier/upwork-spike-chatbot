import { describe, expect, it } from 'vitest'
import { INITIAL, step, type FlowState } from './flow'

function run(inputs: string[]) {
  let st: FlowState = INITIAL
  let last = step(st, inputs[0], 's')
  st = last.state
  for (const i of inputs.slice(1)) { last = step(st, i, 's'); st = last.state }
  return last
}
const text = (r: ReturnType<typeof run>) => r.replies.map((m) => (m.kind === 'text' ? m.text : '')).join(' ')

describe('flow', () => {
  it('AC install quote', () => {
    const r = run(['Get a quote', 'New AC Install', '2,000 sq ft', 'Standard'])
    expect(r.quote?.total).toBe(6300)
    expect(r.quote?.low).toBe(5670)
    expect(r.quote?.high).toBe(7245)
  })
  it('emergency + tankless', () => {
    const r = run(['Get a quote', 'Water Heater Replace', 'Tankless (+$1,200)', 'Emergency same-day'])
    expect(r.quote?.total).toBe(3900)
  })
  it('validates lead fields and completes', () => {
    const base = ['Get a quote', 'Drain Cleaning', 'Standard', 'Book this', 'Sam Lee']
    expect(text(run([...base, 'nope']))).toMatch(/email/)
    expect(text(run([...base, 'sam@example.com', '555123456']))).toMatch(/10-digit/)
    expect(text(run([...base, 'sam@example.com', '9165551234']))).toMatch(/ZIP code\? \(for example 95677/)
    expect(text(run([...base, 'sam@example.com', '9165551234', '90210']))).toMatch(/outside our area \(Rocklin 95677/)
    const done = run([...base, 'sam@example.com', '(916) 555-1234', '95677', 'Confirm'])
    expect(done.lead?.city).toBe('Rocklin')
  })
  it('fallback logs unanswered, human hands off', () => {
    expect(step(INITIAL, 'do you install solar', 's').unanswered).toBe('do you install solar')
    expect(text(step(INITIAL, 'Talk to a human', 's'))).toMatch(/555-0142/)
  })
})
