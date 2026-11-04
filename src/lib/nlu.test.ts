import { describe, expect, it } from 'vitest'
import { classify } from './nlu'

const cases: [string, string][] = [
  ['what are your hours', 'hours'],
  ['do you do financing?', 'financing'],
  ['my ac isnt cooling', 'ac-tips'],
  ['do you install solar', 'fallback'],
  ['are you licensed', 'license'],
  ['my water heater is leaking', 'water-heater-leak'],
  ['do you accept credit cards', 'payment'],
  ['i want a quote', 'quote'],
  ['talk to a human', 'human'],
  ['whats the weather like', 'fallback'],
]
describe('classify', () => {
  for (const [q, intent] of cases) it(`${q} -> ${intent}`, () => expect(classify(q).intent).toBe(intent))
})
