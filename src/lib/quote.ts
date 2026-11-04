import { RANGE_HIGH, RANGE_LOW, SERVICES, TANKLESS_ADDON, URGENCIES } from '../data/services'
import { fmt, type QuoteResult } from './types'

export function calcQuote(serviceId: string, sqft: number | undefined, urgencyId: string, tankless = false): QuoteResult {
  const svc = SERVICES.find((s) => s.id === serviceId)
  const urg = URGENCIES.find((u) => u.id === urgencyId)
  if (!svc || !urg) throw new Error('Unknown service or urgency')

  const lineItems: QuoteResult['lineItems'] = [{ label: svc.name + ' (base)', amount: svc.base }]
  let subtotal = svc.base
  if (svc.perSqFt && sqft) {
    const amt = Math.round(svc.perSqFt * sqft)
    lineItems.push({ label: `Sizing: ${sqft.toLocaleString('en-US')} sq ft × $${svc.perSqFt.toFixed(2)}`, amount: amt })
    subtotal += amt
  }
  if (svc.tankless && tankless) {
    lineItems.push({ label: 'Tankless upgrade', amount: TANKLESS_ADDON })
    subtotal += TANKLESS_ADDON
  }
  const base = subtotal
  const total = Math.round(subtotal * urg.mult)
  if (urg.mult !== 1) lineItems.push({ label: `${urg.name} service (×${urg.mult})`, amount: total - subtotal })

  let low = Math.round(total * RANGE_LOW)
  let high = Math.round(total * RANGE_HIGH)
  if (svc.partsLow !== undefined && svc.partsHigh !== undefined) {
    low = Math.round((total + svc.partsLow) * RANGE_LOW)
    high = Math.round((total + svc.partsHigh) * RANGE_HIGH)
    lineItems.push({ label: 'Parts allowance (if needed)', amount: 0, note: `${fmt(svc.partsLow)}–${fmt(svc.partsHigh)}` })
  }
  return {
    serviceId, serviceName: svc.name, urgencyName: urg.name, sqft: svc.perSqFt ? sqft : undefined,
    tankless: svc.tankless ? tankless : undefined, base, total, low, high, lineItems,
  }
}
