import type { Dashboard, Day, Totals } from './dashboard'

const goal = { calories: 3000, protein: 160, fat: 80, carbs: 410, water: 2800 }
const actual = { calories: 2380, protein: 131, fat: 63, carbs: 306, water: 1950 }
const empty = { calories: null, protein: null, fat: null, carbs: null, water: null }

function day(date: string, totals: Totals): Day {
  return { date, ...totals }
}

export const demo: Dashboard = {
  date: '2026-06-04',
  goal,
  actual,
  days: [
    day('2026-06-01', { calories: 2840, protein: 148, fat: 78, carbs: 386, water: 2400 }),
    day('2026-06-02', { calories: 2960, protein: 152, fat: 81, carbs: 407, water: 2750 }),
    day('2026-06-03', { ...empty, water: 2400 }),
    day('2026-06-04', actual),
    day('2026-06-05', empty),
    day('2026-06-06', empty),
    day('2026-06-07', empty),
  ],
  averages: { calories: 2900, protein: 150, fat: 79.5, carbs: 396.5, water: 2516.7 },
  weights: [
    { date: '2026-05-04', kg: 78.1 },
    { date: '2026-05-11', kg: 78.4 },
    { date: '2026-05-18', kg: 78.3 },
    { date: '2026-05-25', kg: 78.7 },
    { date: '2026-06-01', kg: 79 },
  ],
}
