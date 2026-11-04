export interface Service {
  id: string
  name: string
  base: number
  perSqFt: number
  needsSqFt: boolean
  note?: string
  partsLow?: number
  partsHigh?: number
  tankless?: boolean
}

// NOTE: New AC Install uses $1.25/sq ft so 2,000 sq ft = $3,800 + $2,500 = $6,300 base.
export const SERVICES: Service[] = [
  { id: 'ac-tune', name: 'AC Tune-up', base: 129, perSqFt: 0, needsSqFt: false },
  { id: 'ac-repair', name: 'AC Repair', base: 189, perSqFt: 0, needsSqFt: false, partsLow: 150, partsHigh: 600, note: 'Parts estimated at $150–$600' },
  { id: 'ac-install', name: 'New AC Install', base: 3800, perSqFt: 1.25, needsSqFt: true },
  { id: 'furnace', name: 'Furnace Repair', base: 179, perSqFt: 0, needsSqFt: false },
  { id: 'water-heater', name: 'Water Heater Replace', base: 1400, perSqFt: 0, needsSqFt: false, tankless: true, note: 'Tankless upgrade adds $1,200' },
  { id: 'drain', name: 'Drain Cleaning', base: 149, perSqFt: 0, needsSqFt: false },
  { id: 'leak', name: 'Leak Repair', base: 199, perSqFt: 0, needsSqFt: false },
]

export interface Urgency {
  id: string
  name: string
  mult: number
}

export const URGENCIES: Urgency[] = [
  { id: 'standard', name: 'Standard', mult: 1.0 },
  { id: 'next-day', name: 'Next-day', mult: 1.15 },
  { id: 'emergency', name: 'Emergency same-day', mult: 1.5 },
]

export const TANKLESS_ADDON = 1200
export const RANGE_LOW = 0.9
export const RANGE_HIGH = 1.15
