import { dayDiff } from '../offers/dates'
import type { Offer } from '../offers/data'
import { ensureWeeks, weekCountFor } from './rewards/plan'
import { emptyActiveDays, validatePlan, DAYS_PER_WEEK, type RewardWeek } from './rewards/rules'
import { emptySettings, validate, type CalendarSettings } from './settings'

// How ready a calendar is to publish. It never blocks publishing, except that the
// required Settings must be filled in. Everything else is risk the user can accept.

export type ReadyStatus = 'ready' | 'warning' | 'required' | 'unchecked'

export type ReadyItem = {
  id: 'settings' | 'days' | 'values' | 'overlap'
  label: string
  status: ReadyStatus
  detail: string
}

export type Readiness = {
  // 0 to 100.
  percent: number
  items: ReadyItem[]
  // Counts the rewards screen shows in its summary banner.
  emptyDays: number
  emptyWeeks: number
  unusualDays: number
}

// Settings count for 40%, having a reward on every day for 40% and sensible values for
// 20%. Schedule overlap is not checked yet, so it does not count.
const WEIGHTS = { settings: 40, days: 40, values: 20 }
// The most things validate() can report as missing.
const SETTINGS_FIELDS = 8

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function readinessOf(settings: CalendarSettings, rewards: RewardWeek[], days: number): Readiness {
  // Settings
  const { missing, valid } = validate(settings)
  const settingsFraction = valid ? 1 : Math.max(0, 1 - missing.length / SETTINGS_FIELDS)
  const settingsItem: ReadyItem = valid
    ? { id: 'settings', label: 'Settings', status: 'ready', detail: 'All required fields are filled in' }
    : { id: 'settings', label: 'Settings', status: 'required', detail: `${plural(missing.length, 'field', 'fields')} still needed` }

  // Reward days: every day inside the date range needs a reward, and no week can be empty.
  const weekCount = weekCountFor(Math.max(days, 1))
  const weeks = ensureWeeks(rewards, weekCount).slice(0, weekCount)
  const empty = emptyActiveDays(weeks, days)
  const filled = Math.max(0, days - empty.length)
  const emptyWeeks = weeks.filter((w, i) => {
    const active = Math.max(0, Math.min(DAYS_PER_WEEK, days - i * DAYS_PER_WEEK))
    return active > 0 && w.slice(0, active).every((d) => d.length === 0)
  }).length

  let daysItem: ReadyItem
  if (days === 0 || filled === 0) {
    daysItem = { id: 'days', label: 'Reward days', status: 'unchecked', detail: 'Not started' }
  } else if (empty.length > 0) {
    const weeksNote = emptyWeeks > 0 ? ` and ${plural(emptyWeeks, 'empty week', 'empty weeks')}` : ''
    daysItem = {
      id: 'days',
      label: 'Reward days',
      status: 'warning',
      detail: `${plural(empty.length, 'day has', 'days have')} no reward${weeksNote}`,
    }
  } else {
    daysItem = { id: 'days', label: 'Reward days', status: 'ready', detail: `All ${days} days have a reward` }
  }
  const daysFraction = days === 0 ? 0 : filled / days

  // Reward values: the guardrails already flag amounts that fall, spike or fail to grow.
  const unusual = new Set(validatePlan(weeks, days).map((i) => `${i.week}-${i.day}`)).size
  let valuesItem: ReadyItem
  let valuesFraction = 0
  if (filled === 0) {
    valuesItem = { id: 'values', label: 'Reward values', status: 'unchecked', detail: 'Not checked yet' }
  } else if (unusual > 0) {
    valuesFraction = Math.max(0, 1 - unusual / filled)
    valuesItem = {
      id: 'values',
      label: 'Reward values',
      status: 'warning',
      detail: `${plural(unusual, 'day has', 'days have')} unusual values`,
    }
  } else {
    valuesFraction = 1
    valuesItem = { id: 'values', label: 'Reward values', status: 'ready', detail: 'Amounts grow as expected' }
  }

  const overlapItem: ReadyItem = {
    id: 'overlap',
    label: 'Schedule overlap',
    status: 'unchecked',
    detail: settings.startDate ? 'Not checked yet' : 'Needs a start date',
  }

  const percent = Math.round(
    WEIGHTS.settings * settingsFraction + WEIGHTS.days * daysFraction + WEIGHTS.values * valuesFraction,
  )

  return {
    percent,
    items: [settingsItem, daysItem, valuesItem, overlapItem],
    emptyDays: empty.length,
    emptyWeeks,
    unusualDays: unusual,
  }
}

// Readiness for a calendar in the offers list. Other offer types are not modeled.
export function readinessOfOffer(offer: Offer): Readiness | null {
  if (offer.type !== 'reward-calendar') return null
  const settings = offer.settings ?? { ...emptySettings, name: offer.name, startDate: offer.start ?? '', endDate: offer.end ?? '' }
  const days = settings.startDate && settings.endDate ? Math.max(0, dayDiff(settings.startDate, settings.endDate) + 1) : 0
  return readinessOf(settings, offer.rewards ?? [], days)
}
