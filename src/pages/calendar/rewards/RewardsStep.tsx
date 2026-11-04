import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Plus } from 'lucide-react'
import { AttentionBox, Link, Modal } from '../../../design-system/components'
import { Button } from '@/components/ui/button'
import { formatUs } from '../../offers/dates'
import type { CalendarSettings } from '../settings'
import { PreviewPanel, type Device } from './PreviewPanel'
import { RewardPicker } from './RewardPicker'
import { WeekRow } from './WeekRow'
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
import { MAX_WEEKS, dayNumber, daySummary, validatePlan, type DayRewards, type RewardWeek } from './rules'
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
  onLayoutChange,
  onEditSettings,
}: RewardsStepProps) {
  const weekCount = weekCountFor(days)
  const weeks = useMemo(() => ensureWeeks(plan, weekCount).slice(0, weekCount), [plan, weekCount])

  const [picker, setPicker] = useState<{ week: number; day: number } | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [previewWeek, setPreviewWeek] = useState(0)
  const layoutRef = useRef<HTMLDivElement>(null)
  const [previewWidth, setPreviewWidth] = useState(CHROME_DEFAULT)

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

  const askClearDay = (week: number, day: number) =>
    setConfirm({
      title: `Delete the reward for Week ${week + 1}, Day ${dayNumber(week, day)}?`,
      body: `This removes ${daySummary(weeks[week][day])} from that day.`,
      label: 'Delete reward',
      run: () => onPlanChange(setDay(weeks, week, day, [])),
    })

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
                    <Link
                      size="Small"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPicker({ week: i.week, day: i.day })
                      }}
                    >
                      Week {i.week + 1}, Day {dayNumber(i.week, i.day)}
                    </Link>{' '}
                    {i.message}
                  </li>
                ))}
                {issues.length > 4 && <li>and {issues.length - 4} more.</li>}
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
              canDuplicate={!atMaxWeeks}
              canDelete={weekCount > 1}
              onOpenDay={(d) => setPicker({ week: i, day: d })}
              onClearDay={(d) => askClearDay(i, d)}
              onAddDay={() => apply(addDay(weeks, days))}
              onMenu={(action) => onMenu(i, action)}
            />
          ))}
        </div>

        <footer className="rewards-foot">
          <Button variant="ghost" size="lg" className="foot-blank" disabled={atMaxWeeks} onClick={() => apply(addBlankWeek(weeks, days))}>
            <Plus data-icon="inline-start" />
            Add blank week
          </Button>
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
        <Modal
          size="Small"
          title={confirm.title}
          subtitle={confirm.body}
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
        </Modal>
      )}
    </div>
  )
}
