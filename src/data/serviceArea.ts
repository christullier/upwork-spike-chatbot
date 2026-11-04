export const SERVICE_AREA: Record<string, string> = {
  '95677': 'Rocklin',
  '95765': 'Rocklin',
  '95650': 'Loomis',
  '95661': 'Roseville',
  '95678': 'Roseville',
  '95747': 'Roseville',
  '95746': 'Granite Bay',
  '95630': 'Folsom',
  '95662': 'Orangevale',
  '95603': 'Auburn',
}
export const PHONE = '(916) 555-0142'

// One ZIP for each city in the service area, in the order that chat messages list them.
const CITY_ORDER = ['Rocklin', 'Roseville', 'Loomis', 'Granite Bay', 'Folsom', 'Orangevale', 'Auburn']
export const AREA_PLACES = CITY_ORDER.flatMap((city) => {
  const zip = Object.keys(SERVICE_AREA).find((z) => SERVICE_AREA[z] === city)
  return zip ? [{ city, zip }] : []
})
