import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { CircleAlert, Plus, Redo2, TriangleAlert, Undo2 } from 'lucide-react'
import { Link } from '../../../design-system/components'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { readinessOf } from '../readiness'
import { ActionDialog } from '@/components/ActionDialog'
import { Button } from '@/components/ui/button'
import { formatUs } from '../../offers/dates'
import type { CalendarSettings } from '../settings'
import { PreviewPanel, type Device } from './PreviewPanel'
import { RewardPicker } from './RewardPicker'
import { WeekRow } from './WeekRow'
import {
  activeInWeek,
  addDay,
  addPeriod,
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
import { LIVE_PLAYERS, LIVE_PLAYER_TOTAL, dayNumber, daySummary, validatePlan, type DayRewards, type RewardWeek } from './rules'
import './rewards.css'

type RewardsStepProps = {
  settings: CalendarSettings
  plan: RewardWeek[]
  // How many days the date range covers.
  days: number
  device: Device
  onPlanChange: (plan: RewardWeek[]) => void
  onUndo: () => void
  onRedo: () => void
  // Tells the editor to show a toast.
  onNotify: (message: string, description?: string) => void
  // Adding or removing days and weeks moves the end date, so the editor updates Settings.
  onLayoutChange: (layout: Layout) => void
  onEditSettings: () => void
  // A live calendar has players on it, so edits reach them.
  live: boolean
  // Opens the reward picker on this day when the step appears.
  initialPicker?: { week: number; day: number }
  // The summary banner only appears once the user has tried to publish.
  showIssues: boolean
}

// The preview pane can be dragged wider or narrower.
const CHROME_DEFAULT = 460
const PREVIEW_MIN = 340
const PREVIEW_MAX = 720
const clampWidth = (w: number) => Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, w))

type Confirm = { title: string; body: string; label: string; run: () => void }

export function RewardsStep({
  settings,
  plan,
  days,
  device,
  onPlanChange,
  onUndo,
  onRedo,
  onLayoutChange,
  onEditSettings,
  live,
  initialPicker,
  showIssues,
}: RewardsStepProps) {
  const weekCount = weekCountFor(days)
  const weeks = useMemo(() => ensureWeeks(plan, weekCount).slice(0, weekCount), [plan, weekCount])

  const [picker, setPicker] = useState<{ week: number; day: number } | null>(initialPicker ?? null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [previewWeek, setPreviewWeek] = useState(0)
  const layoutRef = useRef<HTMLDivElement>(null)
  const [previewWidth, setPreviewWidth] = useState(CHROME_DEFAULT)

  const issues = useMemo(() => validatePlan(weeks, days), [weeks, days])
  const readiness = readinessOf(settings, weeks, days)
  // The problems the summary banner names, most serious first.
  const problems = !showIssues ? [] : [
    readiness.emptyDays > 0 && `${readiness.emptyDays} ${readiness.emptyDays === 1 ? 'day has' : 'days have'} no reward.`,
    readiness.emptyWeeks > 0 && `${readiness.emptyWeeks} ${readiness.emptyWeeks === 1 ? 'week is' : 'weeks are'} empty.`,
    readiness.unusualDays > 0 && `${readiness.unusualDays} ${readiness.unusualDays === 1 ? 'day has' : 'days have'} unusual values.`,
  ].filter((p): p is string => Boolean(p))
  const serious = readiness.emptyDays > 0 || readiness.emptyWeeks > 0
  const shownWeek = Math.min(previewWeek, weekCount - 1)

  // ----- editing days

  const saveDay = (items: DayRewards) => {
    if (!picker) return
    onPlanChange(setDay(weeks, picker.week, picker.day, items))
    setPreviewWeek(picker.week)
    setPicker(null)
  }

  const askClearDay = (week: number, day: number) =>
    setConfirm({
      title: `Delete the reward for Week ${week + 1}, Day ${dayNumber(week, day)}?`,
      body: `This removes ${daySummary(weeks[week][day])} from that day.`,
      label: 'Delete reward',
      run: () => onPlanChange(setDay(weeks, week, day, [])),
    })

  // Adding days, a week or a month is always available: a calendar has no length limit.
  const addTime = (extra: number) => apply(addPeriod(weeks, days, extra))

  const apply = (layout: Layout | null) => {
    if (layout) onLayoutChange(layout)
    return layout
  }

  const onMenu = (week: number, action: 'duplicate' | 'clear' | 'delete') => {
    const hasRewards = weeks[week].some((d) => d.length > 0)
    if (action === 'duplicate') {
      apply(duplicateWeek(weeks, days, week))
      return
    }
    const run = () => {
      if (action === 'clear') onPlanChange(clearWeek(weeks, week))
      else {
        apply(deleteWeek(weeks, days, week))
        setPreviewWeek((w) => Math.max(0, Math.min(w, weekCount - 2)))
      }
    }
    if (!hasRewards && action === 'clear') return
    if (!hasRewards) {
      run()
      return
    }
    setConfirm({
      title: `${action === 'clear' ? 'Clear' : 'Delete'} Week ${week + 1}?`,
      body:
        action === 'clear'
          ? 'This removes every reward in the week. The week stays in the calendar.'
          : 'This removes the week and its rewards. Later weeks move up and the end date moves back 7 days.',
      label: action === 'clear' ? 'Clear week' : 'Delete week',
      run,
    })
  }

  // ----- resizing the preview

  const dragResizer = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !layoutRef.current) return
    setPreviewWidth(clampWidth(layoutRef.current.getBoundingClientRect().right - e.clientX))
  }

  const keyResizer = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') setPreviewWidth((w) => clampWidth(w + 24))
    if (e.key === 'ArrowRight') setPreviewWidth((w) => clampWidth(w - 24))
  }

  return (
    <div
      ref={layoutRef}
      className="rewards-layout"
      style={{ '--preview-width': `${previewWidth}px` } as CSSProperties}
    >
      <section className="rewards-main" aria-label="Rewards">
        <header className="rewards-head">
          <h2>Rewards</h2>
          <span className="rewards-length">{formatLength(days)}</span>
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
          <div className="rewards-history">
            <Button variant="ghost" size="icon-sm" aria-label="Undo" title="Undo" onClick={onUndo}>
              <Undo2 />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Redo" title="Redo" onClick={onRedo}>
              <Redo2 />
            </Button>
          </div>
        </header>

        <div className="weeks">
          {live && (
            <Alert variant="warning">
              <TriangleAlert />
              <AlertTitle>This calendar is live.</AlertTitle>
              <AlertDescription>
                {LIVE_PLAYER_TOTAL.toLocaleString('en-US')} players are on it. Changes reach them when you save.
              </AlertDescription>
            </Alert>
          )}

          {problems.length > 0 && (
            <Alert variant={serious ? 'destructive' : 'warning'}>
              {serious ? <CircleAlert /> : <TriangleAlert />}
              <AlertTitle>{problems[0]}</AlertTitle>
              <AlertDescription>{[...problems.slice(1), 'You can still publish.'].join(' ')}</AlertDescription>
            </Alert>
          )}

          {weeks.map((week, i) => (
            <WeekRow
              key={i}
              index={i}
              week={week}
              activeDays={activeInWeek(days, i)}
              issues={issues.filter((x) => x.week === i)}
              canDuplicate
              canDelete={weekCount > 1}
              players={live ? LIVE_PLAYERS[i] : undefined}
              onOpenDay={(d) => setPicker({ week: i, day: d })}
              onClearDay={(d) => askClearDay(i, d)}
              onAddDay={() => apply(addDay(weeks, days))}
              onMenu={(action) => onMenu(i, action)}
            />
          ))}
        </div>

        <footer className="rewards-foot">
          {[
            { label: 'Day', extra: 1 },
            { label: 'Week', extra: 7 },
            { label: 'Month', extra: 28 },
          ].map(({ label, extra }) => (
            <Button
              key={label}
              variant="ghost"
              size="lg"
              aria-label={`Add ${extra} ${extra === 1 ? 'day' : 'days'} to the calendar`}
              onClick={() => addTime(extra)}
            >
              <Plus data-icon="inline-start" />
              {label}
            </Button>
          ))}
        </footer>
      </section>

      <div
        className="resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize the preview"
        aria-valuemin={PREVIEW_MIN}
        aria-valuemax={PREVIEW_MAX}
        aria-valuenow={previewWidth}
        tabIndex={0}
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={dragResizer}
        onKeyDown={keyResizer}
      />

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

      {confirm && (
        <ActionDialog
          size="sm"
          title={confirm.title}
          description={confirm.body}
          onClose={() => setConfirm(null)}
          secondaryAction={{ label: 'Cancel', onClick: () => setConfirm(null) }}
          primaryAction={{
            label: confirm.label,
            // Every confirmation here removes something, so the action is destructive.
            destructive: true,
            onClick: () => {
              confirm.run()
              setConfirm(null)
            },
          }}
        >
          <p className="confirm-note">You can't undo this.</p>
        </ActionDialog>
      )}
    </div>
  )
}
