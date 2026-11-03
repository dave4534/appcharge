const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAY_MS = 86_400_000

// The prototype pins "today" so the timeline looks the same on every visit.
export const TODAY = '2026-11-03'

// The timeline always shows seven weeks starting on a Monday.
export const TIMELINE_START = '2026-11-02'
export const TIMELINE_DAYS = 49

const toUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export const addDays = (iso: string, days: number) =>
  new Date(toUtc(iso) + days * DAY_MS).toISOString().slice(0, 10)

export const dayDiff = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS)

export const formatDay = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

export const monthLabel = (iso: string) => {
  const [y, m] = iso.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

export const dayOfMonth = (iso: string) => Number(iso.split('-')[2])
