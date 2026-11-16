export const metrics = [
  { key: 'calories', name: 'Калорії', unit: 'ккал', color: '#dafe70' },
  { key: 'protein', name: 'Білки', unit: 'г', color: '#dafe70' },
  { key: 'fat', name: 'Жири', unit: 'г', color: '#f0ba86' },
  { key: 'carbs', name: 'Вуглеводи', unit: 'г', color: '#c9b8f4' },
  { key: 'water', name: 'Вода', unit: 'мл', color: '#99d5eb' },
] as const

export type Metric = typeof metrics[number]['key']
export type Totals = Record<Metric, number | null>
export type Day = Totals & { date: string }
export type WeighIn = { date: string; kg: number }
export interface Dashboard {
  date: string
  actual: Totals
  goal: Totals
  days: Day[]
  averages: Totals
  weights: WeighIn[]
}

const number = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 })
const longDate = new Intl.DateTimeFormat('uk-UA', {
  weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
})
const shortDate = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric', month: 'short', timeZone: 'UTC',
})

export function formatNumber(value: number | null, unit = '') {
  return value === null ? '—' : [number.format(value), unit].filter(Boolean).join(' ')
}

export function formatDate(date: string, short = false) {
  return (short ? shortDate : longDate).format(new Date(date + 'T00:00:00Z'))
}

export function weeklyTotal(days: Day[], key: Metric): number | null {
  const values = days.map(day => day[key]).filter(value => value !== null)
  return values.length ? values.reduce((total, value) => total + value, 0) : null
}
