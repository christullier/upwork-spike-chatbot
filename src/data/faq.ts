export interface Faq {
  intent: string
  label: string
  examples: string[]
  answer: string
}

export const FAQ: Faq[] = [
  {
    intent: 'hours', label: 'Business hours',
    examples: ['what are your hours', 'when are you open', 'what time do you close', 'are you open on weekends', 'business hours', 'open on saturday'],
    answer: 'We are open Mon–Fri 7am–6pm and Sat 8am–2pm. Emergency calls are answered 24/7.',
  },
  {
    intent: 'service-area', label: 'Service area',
    examples: ['what areas do you serve', 'do you service my city', 'do you come to roseville', 'service area', 'where do you work', 'do you travel to my zip code'],
    answer: 'We serve Rocklin, Roseville, Loomis, Granite Bay, Folsom, Orangevale and Auburn. Give me your ZIP and I can confirm.',
  },
  {
    intent: 'emergency', label: 'Emergency service',
    examples: ['do you offer emergency service', 'same day service', 'my heater broke at night', 'urgent repair', 'can someone come today', '24 hour service'],
    answer: 'Yes. Emergency same-day service is available 24/7 with a 1.5× rate. A technician is usually on site within 2–4 hours.',
  },
  {
    intent: 'financing', label: 'Financing',
    examples: ['do you offer financing', 'payment plans', 'can i pay monthly', 'financing options', 'do you finance installs', 'monthly payments'],
    answer: 'Yes. We offer 0% APR for 12 months on installs over $3,000 (with approved credit). Ask your technician for details.',
  },
  {
    intent: 'warranty', label: 'Warranty',
    examples: ['do you have a warranty', 'is the work guaranteed', 'how long is the warranty', 'warranty on parts', 'guarantee on labor', 'what does the warranty cover'],
    answer: 'All repairs carry a 1-year labor warranty. New equipment includes a 10-year parts warranty and a 2-year labor warranty.',
  },
  {
    intent: 'payment', label: 'Payment methods',
    examples: ['what payment methods do you take', 'do you accept credit cards', 'can i pay by check', 'do you take cash', 'how do i pay', 'apple pay accepted'],
    answer: 'We accept all major credit cards, debit, ACH, checks and Apple Pay. Payment is due when the job is complete.',
  },
  {
    intent: 'license', label: 'License & insurance',
    examples: ['are you licensed', 'are you insured', 'contractor license number', 'do you have insurance', 'are your technicians certified', 'licensed and bonded'],
    answer: 'Yes. We are California-licensed (CSLB #1054321), bonded and fully insured. All technicians are background-checked and EPA-certified.',
  },
  {
    intent: 'maintenance', label: 'Maintenance plan',
    examples: ['do you have a maintenance plan', 'annual membership', 'yearly tune up plan', 'service agreement', 'maintenance membership', 'preventive maintenance'],
    answer: 'The Summit Club is $18/month: two tune-ups a year, 15% off repairs and priority scheduling.',
  },
  {
    intent: 'reschedule', label: 'Reschedule appointment',
    examples: ['i need to reschedule', 'change my appointment', 'cancel my appointment', 'move my booking', 'can i book another day', 'reschedule my visit'],
    answer: 'No problem. Call (916) 555-0142 or reply to your confirmation text at least 4 hours before your window. There is no fee.',
  },
  {
    intent: 'water-heater-leak', label: 'Water heater leaking',
    examples: ['my water heater is leaking', 'water heater leak', 'water pooling around heater', 'tank is dripping', 'water heater burst', 'hot water tank leaking'],
    answer: 'Turn off the power (or gas) and the cold-water valve on top of the heater, then keep the area clear. This is an emergency. I can book a technician now, or say "talk to a human".',
  },
  {
    intent: 'ac-tips', label: 'AC not cooling tips',
    examples: ['my ac is not cooling', 'air conditioner blowing warm air', 'ac not working', 'house wont cool down', 'ac running but not cold', 'ac blowing hot air'],
    answer: 'Try these first: 1) set thermostat to Cool and 5° below room temp, 2) replace a dirty filter, 3) check the breaker, 4) clear leaves from the outdoor unit. Still warm after 30 minutes? Book an AC Repair and I will quote it.',
  },
  {
    intent: 'pricing', label: 'Pricing transparency',
    examples: ['how much do you charge', 'do you charge a service fee', 'are there hidden fees', 'is the estimate free', 'diagnostic fee', 'upfront pricing'],
    answer: 'We use upfront flat-rate pricing with no hidden fees. Estimates are free, and the diagnostic fee is credited toward any repair. I can give you a quote right now.',
  },
]
