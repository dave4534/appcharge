import { addDays } from '../../offers/dates'
import { DAYS_PER_WEEK, emptyWeek, type DayRewards, type RewardWeek } from './rules'

// A calendar's weeks follow its dates: 18 days is two full weeks and a partial third.
// Days after the end date exist in the grid but can't hold rewards. Adding or removing
// days and weeks moves the end date, which the editor writes back to Settings.

// A calendar can run for as long as the publisher wants: there is no cap on weeks.
export const weekCountFor = (days: number) => Math.max(1, Math.ceil(days / DAYS_PER_WEEK))

export const endDateFor = (start: string, days: number) => addDays(start, days - 1)

// "2.5 weeks": rounded down to the nearest half week.
export function formatLength(days: number): string {
  const weeks = Math.floor((days / DAYS_PER_WEEK) * 2) / 2
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} · ${days} ${days === 1 ? 'day' : 'days'}`
}

export function ensureWeeks(plan: RewardWeek[], count: number): RewardWeek[] {
  return plan.length >= count ? plan : [...plan, ...Array.from({ length: count - plan.length }, emptyWeek)]
}

export function setDay(plan: RewardWeek[], week: number, day: number, items: DayRewards): RewardWeek[] {
  return plan.map((w, wi) => (wi === week ? w.map((d, di) => (di === day ? items : d)) : w))
}

export type Layout = { plan: RewardWeek[]; days: number }

// Each change returns the new plan and the new number of active days, or null when
// the change does not apply.

// Extends the calendar by a number of days (7 for a week, 28 for a month).
export function addPeriod(plan: RewardWeek[], days: number, extra: number): Layout {
  return { plan: ensureWeeks(plan, weekCountFor(days + extra)), days: days + extra }
}

// Takes the days that have no reward out of the calendar. The days after them move up, so
// the calendar gets shorter and numbering stays continuous.
export function removeEmptyDays(plan: RewardWeek[], days: number): Layout | null {
  const kept: DayRewards[] = []
  plan.forEach((week, w) =>
    week.forEach((day, d) => {
      if (w * DAYS_PER_WEEK + d < days && day.length > 0) kept.push(day)
    }),
  )
  if (kept.length === 0 || kept.length === days) return null
  const weeks = weekCountFor(kept.length)
  const next = Array.from({ length: weeks }, (_, w) => Array.from({ length: DAYS_PER_WEEK }, (_, d) => kept[w * DAYS_PER_WEEK + d] ?? []))
  return { plan: next, days: kept.length }
}

export function addDay(plan: RewardWeek[], days: number): Layout {
  return { plan: ensureWeeks(plan, weekCountFor(days + 1)), days: days + 1 }
}

export function duplicateWeek(plan: RewardWeek[], days: number, week: number): Layout {
  const weeks = weekCountFor(days)
  const full = ensureWeeks(plan, weeks)
  const copy = full[week].map((d) => d.map((i) => ({ ...i })))
  return { plan: [...full.slice(0, week + 1), copy, ...full.slice(week + 1)], days: days + DAYS_PER_WEEK }
}

export function deleteWeek(plan: RewardWeek[], days: number, week: number): Layout | null {
  const weeks = weekCountFor(days)
  if (weeks <= 1) return null
  const full = ensureWeeks(plan, weeks)
  const isLast = week === weeks - 1
  return {
    plan: full.filter((_, i) => i !== week),
    days: isLast ? (weeks - 1) * DAYS_PER_WEEK : days - DAYS_PER_WEEK,
  }
}

export function clearWeek(plan: RewardWeek[], week: number): RewardWeek[] {
  return plan.map((w, i) => (i === week ? emptyWeek() : w))
}

// Active days inside one week, given the total number of active days.
export const activeInWeek = (days: number, week: number) => Math.max(0, Math.min(DAYS_PER_WEEK, days - week * DAYS_PER_WEEK))

export const isWeekBlank = (week: RewardWeek, active: number) => week.slice(0, active).every((d) => d.length === 0)
