import { DEFAULT_SKU, productOf } from './catalog'

// Reward logic for the Reward Calendar builder.
//
// This is the single place that knows how rewards rank, what a "good" calendar looks
// like, how to suggest the next week and which image a reward uses. Which products
// exist, and where each one is offered, lives in catalog.ts. It follows
// "Reward Spec.md", except that lottery tickets are left out until there is art for them.
// Every amount here is ILLUSTRATIVE: no public source documents
// a real daily calendar, so the UI labels amounts as assumptions.
//
// Nothing in here depends on the screens. The editor and the preview both
// call these functions, so any calendar a manager creates is checked and
// suggested the same way.

export const DAYS_PER_WEEK = 7

// Days count up across the whole calendar, so Week 2's first day is Day 8.
export const dayNumber = (week: number, day: number) => week * DAYS_PER_WEEK + day + 1
export const MAX_WEEKS = 10

const M = 1_000_000
const B = 1_000_000_000

// Chips, Diamonds and the XP boost have their own rules. Every other product in the
// bank is an 'item', which only needs a quantity.
export type RewardKind = 'chips' | 'xp-boost' | 'diamonds' | 'item'

// `sku` says which product in the bank this is.
export type RewardItem = { kind: RewardKind; quantity: number; sku: string }

// What a player gets on one day. Empty means nothing has been set yet.
export type DayRewards = RewardItem[]

// Always seven days, Day 7 last.
export type RewardWeek = DayRewards[]

// ---------------------------------------------------------------------------
// Per-kind rules. Which products exist, and where they are offered, lives in catalog.ts.

export type RewardDef = {
  kind: RewardKind
  name: string
  // 1 is the lowest. Chips take 1 to 5 depending on the amount (see chipsTier).
  premiumRank: number | null
  // Stepper size and limits in the reward's own unit (chips, minutes, count).
  step: number
  min: number
  max?: number
}

export const REWARD_DEFS: Record<RewardKind, RewardDef> = {
  chips: { kind: 'chips', name: 'Chips', premiumRank: null, step: 250 * M, min: 10 * M },
  'xp-boost': { kind: 'xp-boost', name: '2x XP boost', premiumRank: 7, step: 30, min: 10, max: 120 },
  diamonds: { kind: 'diamonds', name: 'Diamonds', premiumRank: 8, step: 5, min: 1 },
  item: { kind: 'item', name: 'Item', premiumRank: 6, step: 1, min: 1 },
}

export const DAY7_BADGE_IMAGE = '/rewards/day7-badge.png'

// A reward with its product filled in from the bank.
export const makeItem = (kind: RewardKind, quantity: number, sku?: string): RewardItem => ({
  kind,
  quantity,
  sku: sku ?? (kind === 'item' ? 'item' : DEFAULT_SKU[kind]),
})

// The name shown for a reward: its product's name.
export const itemName = (item: RewardItem) => productOf(item.sku)?.name ?? REWARD_DEFS[item.kind].name

// Chip tiers drive the art: under 1B, 1B to 1.5B, 1.5B to 2B, 2B to 3B, 3B and up.
export function chipsTier(quantity: number): 1 | 2 | 3 | 4 | 5 {
  if (quantity < 1 * B) return 1
  if (quantity < 1.5 * B) return 2
  if (quantity < 2 * B) return 3
  if (quantity < 3 * B) return 4
  return 5
}

// Which image a reward uses: chips by amount (one of five tier images, see chipsTier),
// every other product by the image set on it in catalog.ts.
export function rewardImage(item: RewardItem): string | null {
  if (item.kind === 'chips') return `/rewards/chips-tier${chipsTier(item.quantity)}.png`
  return productOf(item.sku)?.image ?? null
}

export function premiumRank(item: RewardItem): number {
  if (item.kind === 'chips') return chipsTier(item.quantity)
  return REWARD_DEFS[item.kind].premiumRank ?? 0
}

// ---------------------------------------------------------------------------
// Formatting and parsing. Chips show a unit and separators so a wrong digit is visible.

const trim = (n: number) => String(Math.round(n * 100) / 100)

export function formatChips(quantity: number): string {
  if (quantity >= B) return `${trim(quantity / B)}B`
  if (quantity >= M) return `${trim(quantity / M)}M`
  return quantity.toLocaleString('en-US')
}

export function formatMinutes(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} h`
  if (minutes >= 60) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
  return `${minutes} min`
}

export function formatQuantity(item: RewardItem): string {
  if (item.kind === 'chips') return formatChips(item.quantity)
  if (item.kind === 'xp-boost') return formatMinutes(item.quantity)
  return item.quantity.toLocaleString('en-US')
}

export function formatChipsExact(quantity: number): string {
  return `${quantity.toLocaleString('en-US')} chips`
}

export function itemSummary(item: RewardItem): string {
  const name = itemName(item)
  if (item.kind === 'chips') return `${formatChips(item.quantity)} chips`
  if (item.kind === 'xp-boost') return `${name} ${formatMinutes(item.quantity)}`
  return `${formatQuantity(item)} ${name.toLowerCase()}`
}

export function daySummary(day: DayRewards): string {
  return day.length === 0 ? 'No reward yet' : day.map(itemSummary).join(' + ')
}

// Accepts "1.5B", "500M", "1,500,000,000" for chips and "30", "1h", "90 min" for boosts.
export function parseQuantity(kind: RewardKind, text: string): number | null {
  const cleaned = text.trim().replace(/,/g, '')
  if (!cleaned) return null

  if (kind === 'chips') {
    const match = /^(\d*\.?\d+)\s*([kmb])?$/i.exec(cleaned)
    if (!match) return null
    const factor = { k: 1_000, m: M, b: B }[(match[2] ?? '').toLowerCase() as 'k' | 'm' | 'b'] ?? 1
    return Math.round(Number(match[1]) * factor)
  }
  if (kind === 'xp-boost') {
    const match = /^(\d*\.?\d+)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)?$/i.exec(cleaned)
    if (!match) return null
    const hours = /^h/i.test(match[2] ?? '')
    return Math.round(Number(match[1]) * (hours ? 60 : 1))
  }
  const whole = /^\d+$/.exec(cleaned)
  return whole ? Number(cleaned) : null
}

// ---------------------------------------------------------------------------
// Day helpers

// Cheapest first, so chips lead and the most premium reward ends the row.
export const orderedItems = (day: DayRewards) => [...day].sort((a, b) => premiumRank(a) - premiumRank(b))

export const chipsOf = (day: DayRewards) => day.find((i) => i.kind === 'chips')?.quantity ?? 0
export const hasKind = (day: DayRewards, kind: RewardKind) => day.some((i) => i.kind === kind)
export const quantityOf = (day: DayRewards, kind: RewardKind) => day.find((i) => i.kind === kind)?.quantity ?? 0

export const emptyWeek = (): RewardWeek => Array.from({ length: DAYS_PER_WEEK }, () => [])

export const isDayFilled = (day: DayRewards) => day.length > 0

// ---------------------------------------------------------------------------
// Guardrails

export type Severity = 'error' | 'warning'

export type Issue = {
  id: string
  code: string
  severity: Severity
  // Zero-based week and day, so Week 1 Day 1 is { week: 0, day: 0 }.
  week: number
  day: number
  message: string
}

export type RuleInfo = {
  code: string
  severity: Severity
  title: string
  description: string
  // Rules that only matter once a calendar is live. They are listed here so the
  // edit-live flow can pick them up, but validatePlan does not run them.
  appliesTo?: 'live'
}

export const RULES: RuleInfo[] = [
  {
    code: 'chips-paid-equivalent',
    severity: 'error',
    title: 'Chips match a paid bundle',
    description: 'Any chip reward of 20B or more equals a $0.99 paid bundle. This blocks publishing.',
  },
  {
    code: 'chips-high',
    severity: 'warning',
    title: 'Chips above 5B',
    description: 'Above 5B is high compared with the daily wheel.',
  },
  {
    code: 'chips-jump',
    severity: 'warning',
    title: 'Chips more than 3x the previous day',
    description: 'A jump of more than 3x is often an extra digit.',
  },
  {
    code: 'chips-decrease',
    severity: 'warning',
    title: 'Chips go down within a week',
    description: 'Days 1 to 6 should never give fewer chips than the day before.',
  },
  {
    code: 'chips-missing',
    severity: 'warning',
    title: 'Days 1 to 6 have no chips',
    description: 'Chips are the base reward on Days 1 to 6.',
  },
  {
    code: 'day7-only',
    severity: 'warning',
    title: 'A Day 7 reward on another day',
    description: 'Diamonds and the XP boost are only offered on Day 7, the main reward.',
  },
  {
    code: 'xp-over-max',
    severity: 'warning',
    title: 'XP boost longer than 2 hours',
    description: 'Boosts run from 10 minutes to 2 hours.',
  },
  {
    code: 'day7-not-larger',
    severity: 'warning',
    title: 'Day 7 is not larger than Day 6',
    description: 'Day 7 is the main reward and should clearly beat Day 6.',
  },
  {
    code: 'day7-below-2x',
    severity: 'warning',
    title: 'Day 7 chips are under 2x Day 6',
    description: 'Day 7 chips should be at least twice Day 6 of the same week.',
  },
  {
    code: 'day7-incomplete',
    severity: 'warning',
    title: 'Day 7 is missing part of the main reward',
    description: 'Day 7 combines chips, Diamonds and an XP boost.',
  },
  {
    code: 'week-regression',
    severity: 'warning',
    title: 'A week gives less than the week before',
    description: 'Every reward should grow week over week.',
  },
  {
    code: 'live-quantity-change',
    severity: 'warning',
    title: 'Changing a live reward a player already reached',
    description: 'Shows how many players are affected and asks for confirmation.',
    appliesTo: 'live',
  },
]

export const ruleInfo = (code: string) => RULES.find((r) => r.code === code)

const CHIPS_ERROR = 20 * B
const CHIPS_WARN = 5 * B

// Checks the active days of a plan. Days past `activeDays` (after the end date) are skipped.
export function validatePlan(plan: RewardWeek[], activeDays = plan.length * DAYS_PER_WEEK): Issue[] {
  const issues: Issue[] = []
  const add = (code: string, week: number, day: number, message: string) => {
    const severity = ruleInfo(code)?.severity ?? 'warning'
    issues.push({ id: `${code}-${week}-${day}`, code, severity, week, day, message })
  }

  plan.forEach((days, w) => {
    days.forEach((rewards, d) => {
      if (w * DAYS_PER_WEEK + d >= activeDays || rewards.length === 0) return

      const chips = chipsOf(rewards)
      const isDay7 = d === DAYS_PER_WEEK - 1
      const prevDay = d > 0 ? days[d - 1] : []
      const prevChips = chipsOf(prevDay)

      if (chips >= CHIPS_ERROR) {
        add('chips-paid-equivalent', w, d, `${formatChips(chips)} chips equals a $0.99 paid bundle (20B).`)
      } else if (chips > CHIPS_WARN) {
        add('chips-high', w, d, `${formatChips(chips)} chips is high compared with the daily wheel.`)
      }

      if (chips > 0 && prevChips > 0 && chips > prevChips * 3) {
        add('chips-jump', w, d, `More than 3x the previous day (${formatChips(prevChips)}). Check for an extra digit.`)
      }
      if (!isDay7 && chips === 0) add('chips-missing', w, d, 'Days 1 to 6 should include chips.')
      if (!isDay7 && d > 0 && chips > 0 && prevChips > 0 && chips < prevChips) {
        add('chips-decrease', w, d, `Fewer chips than the day before (${formatChips(prevChips)}).`)
      }

      // The picker never offers these on other days, so this only catches rewards that
      // got there another way, such as an imported or duplicated week.
      if (!isDay7) {
        rewards
          .filter((r) => productOf(r.sku)?.day7Only)
          .forEach((r) => add('day7-only', w, d, `Only Day 7 offers ${itemName(r).toLowerCase()}.`))
      }
      if (quantityOf(rewards, 'xp-boost') > 120) add('xp-over-max', w, d, 'An XP boost lasts at most 2 hours.')

      if (isDay7) {
        const day6Chips = chipsOf(days[5])
        if (chips > 0 && day6Chips > 0) {
          if (chips <= day6Chips) {
            add('day7-not-larger', w, d, `Day 7 should be larger than Day 6 (${formatChips(day6Chips)}).`)
          } else if (chips < day6Chips * 2) {
            add('day7-below-2x', w, d, `Day 7 chips should be at least 2x Day 6 (${formatChips(day6Chips * 2)}).`)
          }
        }
        const missing = (['chips', 'diamonds', 'xp-boost'] as RewardKind[]).filter((k) => !hasKind(rewards, k))
        if (missing.length > 0) {
          add('day7-incomplete', w, d, `Day 7 is missing ${missing.map((k) => REWARD_DEFS[k].name.toLowerCase()).join(' and ')}.`)
        }
      }

      const prevWeek = w > 0 ? plan[w - 1][d] : null
      if (prevWeek && prevWeek.length > 0) {
        const before = chipsOf(prevWeek)
        const worse =
          (chips > 0 && before > 0 && chips < before) ||
          (isDay7 &&
            ((hasKind(rewards, 'diamonds') && quantityOf(rewards, 'diamonds') < quantityOf(prevWeek, 'diamonds')) ||
              (hasKind(rewards, 'xp-boost') && quantityOf(rewards, 'xp-boost') < quantityOf(prevWeek, 'xp-boost'))))
        if (worse) add('week-regression', w, d, `Gives less than Day ${d + 1} of Week ${w}.`)
      }
    })
  })

  return issues
}

// Days inside the date range that still have no reward.
export function emptyActiveDays(plan: RewardWeek[], activeDays: number): { week: number; day: number }[] {
  const empty: { week: number; day: number }[] = []
  plan.forEach((days, w) =>
    days.forEach((rewards, d) => {
      if (w * DAYS_PER_WEEK + d < activeDays && rewards.length === 0) empty.push({ week: w, day: d })
    }),
  )
  return empty
}

// ---------------------------------------------------------------------------
// Suggestions

const item = makeItem

// The spec's Week 1: the entry level every later week grows from.
const BASELINE: RewardWeek = [
  [item('chips', 0.5 * B)],
  [item('chips', 0.5 * B)],
  [item('chips', 1 * B)],
  [item('chips', 1 * B)],
  [item('chips', 1.5 * B)],
  [item('chips', 1.5 * B)],
  [item('chips', 3 * B), item('diamonds', 5), item('xp-boost', 30)],
]

const roundChips = (q: number) => Math.round(q / (50 * M)) * 50 * M
const CHIP_CAP_DAY7 = 5 * B
const CHIP_CAP_DAY6 = 2.5 * B

const isComplete = (week: RewardWeek) => week.every((d) => d.length > 0)

// Grows one reward from the previous week. With two earlier weeks it continues their
// trend; with one it uses the spec's steps (+0.25B chips, +1B on Day 7, doubling
// Diamonds and boost time).
function grow(item: RewardItem, before: RewardItem | undefined, day: number, steeper: boolean): RewardItem {
  const push = steeper ? 1.5 : 1
  switch (item.kind) {
    case 'chips': {
      const fallback = day === DAYS_PER_WEEK - 1 ? 1 * B : 0.25 * B
      const trend = before && before.quantity < item.quantity ? item.quantity - before.quantity : fallback
      return { ...item, quantity: roundChips(item.quantity + trend * push) }
    }
    case 'diamonds': {
      const ratio = before && before.quantity > 0 ? Math.min(2, item.quantity / before.quantity) : 2
      return { ...item, quantity: Math.max(item.quantity, Math.round(item.quantity * Math.max(1.25, ratio * (steeper ? 1.25 : 1)))) }
    }
    case 'xp-boost':
      return { ...item, quantity: Math.min(120, item.quantity * 2) }
    default:
      return { ...item }
  }
}

// Keeps a suggested week inside the stage rules: chips never drop within Days 1 to 6,
// Day 7 chips are at least 2x Day 6, and nothing passes the high-chip limit.
function tidy(week: RewardWeek): RewardWeek {
  const out = week.map((d) => d.map((i) => ({ ...i })))
  let floor = 0
  for (let d = 0; d < DAYS_PER_WEEK - 1; d++) {
    const chips = out[d].find((i) => i.kind === 'chips')
    if (!chips) continue
    chips.quantity = Math.min(CHIP_CAP_DAY6, Math.max(chips.quantity, floor))
    floor = chips.quantity
  }
  const day7 = out[DAYS_PER_WEEK - 1].find((i) => i.kind === 'chips')
  if (day7) day7.quantity = Math.min(CHIP_CAP_DAY7, Math.max(day7.quantity, floor * 2))
  return out
}

export type Suggestion = { week: RewardWeek; basis: string }

// The next week, based on the last one or two complete weeks before `weekIndex`.
export function suggestWeek(plan: RewardWeek[], weekIndex: number, options: { steeper?: boolean } = {}): Suggestion {
  const steeper = options.steeper ?? false
  const before = plan.slice(0, weekIndex).filter(isComplete)
  const last = before.at(-1)
  const earlier = before.at(-2)

  if (!last) {
    return {
      week: BASELINE.map((d) => d.map((i) => ({ ...i }))),
      basis: 'a typical entry-level week (illustrative amounts)',
    }
  }

  const week = last.map((day, d) => day.map((i) => grow(i, earlier?.[d].find((e) => e.sku === i.sku), d, steeper)))
  const basis = earlier
    ? `Weeks ${plan.indexOf(earlier) + 1} and ${plan.indexOf(last) + 1}`
    : `Week ${plan.indexOf(last) + 1}`
  return { week: tidy(week), basis }
}

export type DaySuggestion = { items: DayRewards; basis: string }

// A single day, for the reward picker. Uses the same growth as a full week.
export function suggestDay(plan: RewardWeek[], weekIndex: number, dayIndex: number): DaySuggestion {
  const { week } = suggestWeek(plan, weekIndex)
  const items = week[dayIndex].map((i) => ({ ...i }))

  // Never suggest fewer chips than the day before in the same week.
  const prevChips = dayIndex > 0 ? chipsOf(plan[weekIndex]?.[dayIndex - 1] ?? []) : 0
  const chips = items.find((i) => i.kind === 'chips')
  if (chips && prevChips > chips.quantity) chips.quantity = prevChips

  const parts: string[] = []
  const filledBefore = dayIndex > 0 && (plan[weekIndex]?.slice(0, dayIndex) ?? []).every(isDayFilled)
  if (filledBefore) parts.push(dayIndex === 1 ? 'Day 1' : dayIndex === 2 ? 'Days 1 and 2' : `Days 1 to ${dayIndex}`)
  if (plan.slice(0, weekIndex).some(isComplete)) parts.push('last week')
  const basis = parts.length > 0 ? `Based on ${parts.join(' and ')}.` : 'Based on a typical entry-level week (illustrative).'
  return { items, basis }
}
