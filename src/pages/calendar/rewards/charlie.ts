import { chipsOf, daySummary, formatChips, ruleInfo, validatePlan, emptyActiveDays, type RewardWeek } from './rules'
import type { CalendarSettings } from '../settings'
import { formatLength } from './plan'

// Charlie is scripted, not a live model. Every answer comes from the reward rules in
// rules.ts and the calendar's own settings, so it stays consistent and explainable.

export type Intent = 'suggest-day' | 'compare' | 'review' | 'explain' | 'help'

// Free text is matched on keywords, because the prototype has no language model.
export function intentFor(text: string): Intent {
  const t = text.toLowerCase()
  if (/compare|versus|\bvs\b|difference/.test(t)) return 'compare'
  if (/review|check|mistake|issue|problem|wrong|validate/.test(t)) return 'review'
  if (/explain|summar|rule|how does|what is this/.test(t)) return 'explain'
  if (/suggest|fill|next day|next empty|generate/.test(t)) return 'suggest-day'
  return 'help'
}

export function reviewText(plan: RewardWeek[], activeDays: number): string {
  const issues = validatePlan(plan, activeDays)
  const empty = emptyActiveDays(plan, activeDays)
  if (issues.length === 0 && empty.length === 0) {
    return 'I checked every week against your reward rules and found nothing to fix.'
  }
  const lines: string[] = []
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.length - errors.length
  lines.push(
    `${errors.length} blocking ${errors.length === 1 ? 'error' : 'errors'}, ${warnings} ${warnings === 1 ? 'warning' : 'warnings'}, ${empty.length} empty ${empty.length === 1 ? 'day' : 'days'}.`,
  )
  const sorted = [...errors, ...issues.filter((i) => i.severity === 'warning')].slice(0, 5)
  sorted.forEach((i) => lines.push(`• Week ${i.week + 1}, Day ${i.day + 1}: ${i.message}`))
  if (issues.length > sorted.length) lines.push(`…and ${issues.length - sorted.length} more.`)
  const codes = [...new Set(issues.map((i) => i.code))]
  const hint = codes.map(ruleInfo).find((r) => r)?.description
  if (hint) lines.push(`Why: ${hint}`)
  return lines.join('\n')
}

export function compareText(plan: RewardWeek[], week: number): string {
  if (week < 1) return 'There is no earlier week to compare with yet.'
  const a = plan[week]
  const b = plan[week - 1]
  const pct = (now: number, before: number) => (before > 0 ? `${now >= before ? '+' : ''}${Math.round(((now - before) / before) * 100)}%` : '')
  // Only days that have chips in both weeks can be compared.
  const rows = [0, 3, 5, 6]
    .filter((d) => chipsOf(a[d]) > 0 && chipsOf(b[d]) > 0)
    .map((d) => `• Day ${d + 1}: ${formatChips(chipsOf(a[d]))} chips vs ${formatChips(chipsOf(b[d]))} ${pct(chipsOf(a[d]), chipsOf(b[d]))}`.trimEnd())
  if (rows.length === 0) return `Week ${week + 1} and Week ${week} have no days with chips in common yet.`
  const day7 = a[6].length > 0 ? [`Day 7 gives ${daySummary(a[6])}.`] : []
  return [`Week ${week + 1} compared with Week ${week}:`, ...rows, ...day7].join('\n')
}

const MISSED = {
  complete: 'back to Week 1, Day 1',
  weekly: 'back to Day 1 of the current week',
}
const AFTER = {
  restart: 'start again at Week 1',
  end: 'finish, and the calendar ends for them',
}

export function explainText(settings: CalendarSettings, plan: RewardWeek[], days: number): string {
  const lines = [`A player collects one reward a day. This calendar runs ${formatLength(days)}.`]
  if (settings.missedDay) lines.push(`• Miss a day and the player goes ${MISSED[settings.missedDay]}.`)
  if (settings.afterLast) lines.push(`• After the last week the player will ${AFTER[settings.afterLast]}.`)
  if (settings.popupTrigger) {
    lines.push(
      settings.popupTrigger === 'automatic'
        ? '• The popup opens by itself when a reward is ready.'
        : '• The popup only opens when the player clicks the badge.',
    )
  }
  if (settings.collection) {
    lines.push(
      settings.collection === 'forced'
        ? '• The popup cannot be closed until the player collects.'
        : '• Players can close the popup and collect later that day.',
    )
  }
  const filled = plan.flat().filter((d) => d.length > 0)
  const chips = filled.map(chipsOf).filter((c) => c > 0)
  if (chips.length > 0) {
    lines.push(`• Daily chips run from ${formatChips(Math.min(...chips))} to ${formatChips(Math.max(...chips))}. Amounts are illustrative.`)
  }
  return lines.join('\n')
}

export const HELP_TEXT =
  'I can suggest the next empty day, compare weeks, review your calendar for mistakes, or explain how it works. Try one of the options, or ask in your own words.'
