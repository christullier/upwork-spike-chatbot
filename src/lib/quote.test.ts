import { describe, expect, it } from 'vitest'
import { calcQuote } from './quote'

describe('calcQuote', () => {
  it('AC install 2000 sqft standard', () => {
    const q = calcQuote('ac-install', 2000, 'standard')
    expect(q.total).toBe(6300)
    expect(q.low).toBe(5670)
    expect(q.high).toBe(7245)
  })
  it('emergency applies 1.5x', () => {
    expect(calcQuote('drain', undefined, 'emergency').total).toBe(Math.round(149 * 1.5))
  })
  it('tankless adds 1200', () => {
    expect(calcQuote('water-heater', undefined, 'standard', true).total).toBe(2600)
  })
})
