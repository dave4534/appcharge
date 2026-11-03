import { Sparkles } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { AttentionBox, Button, Icon, Link } from '../../../design-system/components'
import { formatUs } from '../../offers/dates'
import type { CalendarSettings } from '../settings'
import { CharliePanel, type Message } from './CharliePanel'
import { PreviewPanel, type Device } from './PreviewPanel'
import { RewardPicker } from './RewardPicker'
import { WeekRow } from './WeekRow'
import { HELP_TEXT, compareText, explainText, intentFor, reviewText, type Intent } from './charlie'
import {
  activeInWeek,
  addBlankWeek,
  addDay,
  clearWeek,
  deleteWeek,
  duplicateWeek,
  endDateFor,
  ensureWeeks,
  formatLength,
  setDay,
  weekCountFor,
  type Layout,
} from './plan'
import { MAX_WEEKS, daySummary, suggestWeek, validatePlan, type DayRewards, type RewardWeek } from './rules'
import './rewards.css'

type RewardsStepProps = {
  settings: CalendarSettings
  plan: RewardWeek[]
  // How many days the date range covers.
  days: number
  device: Device
  onPlanChange: (plan: RewardWeek[]) => void
  // Adding or removing days and weeks moves the end date, so the editor updates Settings.
  onLayoutChange: (layout: Layout) => void
  onEditSettings: () => void
}

// `undo` is set when the suggestion added a new week, so rejecting it removes that week again.
type Pending = { week: number; days: RewardWeek; basis: string; undo?: Layout }

// A week has a gap when one of its days inside the date range has no reward yet.
const hasGap = (weeks: RewardWeek[], days: number, i: number) =>
  weeks[i].slice(0, activeInWeek(days, i)).some((d) => d.length === 0)

// A suggestion only fills empty days; days the manager already set stay as they are.
const keepFilled = (existing: RewardWeek, suggested: RewardWeek): RewardWeek =>
  suggested.map((d, i) => (existing[i].length > 0 ? existing[i] : d))

export function RewardsStep({ settings, plan, days, device, onPlanChange, onLayoutChange, onEditSettings }: RewardsStepProps) {
  const weekCount = weekCountFor(days)
  const weeks = useMemo(() => ensureWeeks(plan, weekCount).slice(0, weekCount), [plan, weekCount])

  const [pending, setPending] = useState<Pending | null>(null)
  const [picker, setPicker] = useState<{ week: number; day: number } | null>(null)
  const [previewWeek, setPreviewWeek] = useState(0)
  const [charlieOpen, setCharlieOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const nextId = useRef(1)

  const issues = useMemo(() => validatePlan(weeks, days), [weeks, days])
  const errors = issues.filter((i) => i.severity === 'error')
  const shownWeek = Math.min(previewWeek, weekCount - 1)
  const atMaxWeeks = weekCount >= MAX_WEEKS

  // ----- editing days

  const saveDay = (items: DayRewards) => {
    if (!picker) return
    onPlanChange(setDay(weeks, picker.week, picker.day, items))
    setPreviewWeek(picker.week)
    setPicker(null)
  }

  const apply = (layout: Layout | null) => {
    if (layout) onLayoutChange(layout)
    return layout
  }

  const onMenu = (week: number, action: 'duplicate' | 'clear' | 'delete') => {
    if (action === 'clear') onPlanChange(clearWeek(weeks, week))
    if (action === 'duplicate') apply(duplicateWeek(weeks, days, week))
    if (action === 'delete') {
      apply(deleteWeek(weeks, days, week))
      setPreviewWeek((w) => Math.max(0, Math.min(w, weekCount - 2)))
    }
  }

  // ----- suggestions

  // Fills the empty days of the first week that has any. When every week is full, a new
  // week is added (which moves the end date) and filled instead. Days that already have
  // rewards are kept.
  const addSuggestedWeek = (steeper = false): { week: number; basis: string } | null => {
    let base = weeks
    let undo: Layout | undefined
    let target = weeks.findIndex((_, i) => hasGap(weeks, days, i))
    if (target === -1) {
      const layout = apply(addBlankWeek(weeks, days))
      if (!layout) return null
      base = layout.plan
      target = layout.plan.length - 1
      undo = { plan: weeks, days }
    }
    const { week, basis } = suggestWeek(base, target, { steeper })
    setPending({ week: target, days: keepFilled(base[target], week), basis, undo })
    setPreviewWeek(target)
    return { week: target, basis }
  }

  const acceptSuggestion = () => {
    if (!pending) return
    const active = activeInWeek(days, pending.week)
    const filled = pending.days.map((d, i) => (i < active ? d : []))
    onPlanChange(weeks.map((w, i) => (i === pending.week ? filled : w)))
    setPending(null)
  }

  const rejectSuggestion = () => {
    if (pending?.undo) onLayoutChange(pending.undo)
    setPending(null)
  }

  // ----- Charlie

  const say = (role: Message['role'], text: string, follow?: Message['follow']) =>
    setMessages((m) => [...m, { id: nextId.current++, role, text, follow }])

  const runIntent = (intent: Intent, label: string) => {
    say('user', label)
    switch (intent) {
      case 'suggest-week': {
        const result = addSuggestedWeek()
        if (!result) {
          say('charlie', `This calendar already runs ${MAX_WEEKS} weeks, the most a calendar can have.`)
          return
        }
        const n = result.week + 1
        say(
          'charlie',
          `Added a suggested Week ${n}${n > 1 ? ` below Week ${n - 1}` : ''}, based on ${result.basis}.\n\nAccept or reject it in the calendar. Nothing changes until you accept.`,
          [
            { label: `Make Week ${n} steeper`, intent: 'steeper' },
            ...(n > 1 ? [{ label: `Compare with Week ${n - 1}`, intent: 'compare' as Intent }] : []),
          ],
        )
        return
      }
      case 'steeper': {
        if (!pending) {
          say('charlie', 'Add a suggested week first, then I can make it steeper.', [{ label: 'Add a suggested week', intent: 'suggest-week' }])
          return
        }
        const { week, basis } = suggestWeek(weeks, pending.week, { steeper: true })
        setPending({ ...pending, days: keepFilled(weeks[pending.week], week), basis })
        say('charlie', `Made Week ${pending.week + 1} steeper: Day 7 now gives ${daySummary(week[6])}.\n\nStill a suggestion. Accept or reject it in the calendar.`, [
          ...(pending.week > 0 ? [{ label: `Compare with Week ${pending.week}`, intent: 'compare' as Intent }] : []),
        ])
        return
      }
      case 'compare': {
        const target = pending?.week ?? weekCount - 1
        const view = pending ? weeks.map((w, i) => (i === pending.week ? pending.days : w)) : weeks
        say('charlie', compareText(view, target))
        return
      }
      case 'review':
        say('charlie', reviewText(weeks, days))
        return
      case 'explain':
        say('charlie', explainText(settings, weeks, days))
        return
      default:
        say('charlie', HELP_TEXT)
    }
  }

  const onSend = (text: string) => runIntent(intentFor(text), text)

  const nextWeekNumber = (pending?.week ?? weeks.findIndex((_, i) => hasGap(weeks, days, i))) + 1

  return (
    <div className={`rewards-layout${charlieOpen ? ' has-charlie' : ''}`}>
      {charlieOpen && (
        <CharliePanel
          messages={messages}
          hasSuggestion={pending !== null}
          nextWeekNumber={Math.max(1, nextWeekNumber)}
          canAddWeek={!pending && !(atMaxWeeks && !weeks.some((_, i) => hasGap(weeks, days, i)))}
          onIntent={runIntent}
          onSend={onSend}
          onReset={() => setMessages([])}
          onClose={() => setCharlieOpen(false)}
        />
      )}

      <section className="rewards-main" aria-label="Rewards">
        <header className="rewards-head">
          <h2>Rewards</h2>
          <span className="rewards-length">{formatLength(days)}</span>
          <span className="rewards-spacer" />
          <Button
            kind={charlieOpen ? 'Primary' : 'Secondary'}
            size="Small"
            icon="Left"
            aria-pressed={charlieOpen}
            iconElement={<Icon icon={Sparkles} size="Small" color={charlieOpen ? 'on-primary' : 'primary'} />}
            onClick={() => setCharlieOpen((o) => !o)}
          >
            Charlie
          </Button>
          <Link
            size="Small"
            href="#"
            className="rewards-dates"
            title="Edit dates in Settings"
            onClick={(e) => {
              e.preventDefault()
              onEditSettings()
            }}
          >
            {formatUs(settings.startDate)} – {formatUs(endDateFor(settings.startDate, days))}
          </Link>
        </header>

        <div className="weeks">
          {issues.length > 0 && (
            <AttentionBox
              type={errors.length > 0 ? 'Negative' : 'Warning'}
              compact
              title={`${errors.length > 0 ? `${errors.length} blocking ${errors.length === 1 ? 'error' : 'errors'}, ` : ''}${issues.length - errors.length} ${issues.length - errors.length === 1 ? 'warning' : 'warnings'} to review`}
            >
              <ul className="check-list">
                {[...errors, ...issues.filter((i) => i.severity === 'warning')].slice(0, 4).map((i) => (
                  <li key={i.id}>
                    <Link size="Small" href="#" onClick={(e) => { e.preventDefault(); setPicker({ week: i.week, day: i.day }) }}>
                      Week {i.week + 1}, Day {i.day + 1}
                    </Link>{' '}
                    {i.message}
                  </li>
                ))}
                {issues.length > 4 && <li>and {issues.length - 4} more. Ask Charlie to review all weeks.</li>}
              </ul>
            </AttentionBox>
          )}

          {weeks.map((week, i) => (
            <WeekRow
              key={i}
              index={i}
              week={week}
              activeDays={activeInWeek(days, i)}
              issues={issues.filter((x) => x.week === i)}
              suggestion={pending?.week === i ? { week: pending.days, basis: pending.basis } : null}
              locked={pending !== null}
              canDuplicate={!atMaxWeeks}
              canDelete={weekCount > 1}
              onOpenDay={(d) => setPicker({ week: i, day: d })}
              onClearDay={(d) => onPlanChange(setDay(weeks, i, d, []))}
              onAddDay={() => apply(addDay(weeks, days))}
              onMenu={(action) => onMenu(i, action)}
              onAccept={acceptSuggestion}
              onReject={rejectSuggestion}
            />
          ))}
        </div>

        <footer className="rewards-foot">
          <Button kind="Secondary" size="Large" className="foot-blank" disabled={pending !== null || atMaxWeeks} onClick={() => apply(addBlankWeek(weeks, days))}>
            + Add blank week
          </Button>
          <Button
            kind="Primary"
            size="Large"
            icon="Left"
            iconElement={<Icon icon={Sparkles} size="Small" color="on-primary" />}
            disabled={pending !== null}
            onClick={() => addSuggestedWeek()}
          >
            Add suggested week
          </Button>
        </footer>
      </section>

      <PreviewPanel plan={weeks} weekCount={weekCount} week={shownWeek} device={device} onWeekChange={setPreviewWeek} />


      {picker && (
        <RewardPicker
          key={`${picker.week}-${picker.day}`}
          week={picker.week}
          day={picker.day}
          plan={weeks}
          activeDays={days}
          onClose={() => setPicker(null)}
          onSave={saveDay}
        />
      )}
    </div>
  )
}
