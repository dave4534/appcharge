import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { audienceLabel, typeLabels, type Offer } from './data'
import {
  TIMELINE_DAYS,
  TIMELINE_START,
  TODAY,
  addDays,
  dayDiff,
  dayOfMonth,
  formatDay,
  monthLabel,
} from './dates'
import { DragHandle, KebabButton, PriorityBadge, StatusPill } from './parts'
import { useReorder } from './useReorder'

type TimelineViewProps = {
  offers: Offer[]
  priorityOf: (id: string) => number
  canReorder: boolean
  onMove: (id: string, targetId: string, after: boolean) => void
}

const pct = (days: number) => `${(days / TIMELINE_DAYS) * 100}%`

// Seven weekly gridlines, one month label at the start of each month in range.
const weekStarts = Array.from({ length: TIMELINE_DAYS / 7 }, (_, i) => i * 7)
const monthStarts = Array.from({ length: TIMELINE_DAYS }, (_, i) => i).filter(
  (i) => i === 0 || dayOfMonth(addDays(TIMELINE_START, i)) === 1,
)
const todayOffset = dayDiff(TIMELINE_START, TODAY) + 0.5

// Clamp a run of days to the visible range, or return null when it is out of view.
function span(startDay: number, length: number) {
  const from = Math.max(startDay, 0)
  const to = Math.min(startDay + length, TIMELINE_DAYS)
  return to > from ? { left: pct(from), width: pct(to - from) } : null
}

function Track({ children }: { children?: ReactNode }) {
  return (
    <div className="tl-track">
      {children}
      <span className="tl-today" style={{ left: pct(todayOffset) }} />
    </div>
  )
}

function Bars({ offer }: { offer: Offer }) {
  if (!offer.start || !offer.end) {
    return (
      <div className="tl-bar tl-empty" style={{ left: '1%', width: '54%' }}>
        <span>Draft, no dates yet. Set a date range in Settings.</span>
      </div>
    )
  }

  const startDay = dayDiff(TIMELINE_START, offer.start)
  const length = dayDiff(offer.start, offer.end) + 1
  const run = span(startDay, length)
  const next = offer.repeatWeeks ? span(startDay + length, length) : null

  return (
    <>
      {run && (
        <div
          className={`tl-bar s-${offer.status}`}
          style={run}
          title={`${formatDay(offer.start)} to ${formatDay(offer.end)}`}
        >
          <span>
            {formatDay(offer.start)} to {formatDay(offer.end)}
          </span>
          {offer.repeatWeeks && (
            <span className="tl-repeat">
              <Icon name="repeat" size={13} /> every {offer.repeatWeeks} weeks
            </span>
          )}
        </div>
      )}
      {next && (
        <div className={`tl-bar tl-next s-${offer.status}`} style={next}>
          Next run
        </div>
      )}
    </>
  )
}

export function TimelineView({ offers, priorityOf, canReorder, onMove }: TimelineViewProps) {
  const reorder = useReorder(
    offers.map((o) => o.id),
    canReorder,
    onMove,
  )

  return (
    <div className="tl-scroll">
      <div className="tl">
        <div className="tl-row tl-head">
          <div className="tl-left tl-head-left" aria-hidden="true">
            <span className="tl-col-offer">Priority and offer</span>
            <span className="tl-col-status">Status</span>
          </div>
          <Track>
            <div className="tl-months">
              {monthStarts.map((day) => (
                <span key={day} style={{ left: pct(day) }}>
                  {monthLabel(addDays(TIMELINE_START, day))}
                </span>
              ))}
            </div>
            <div className="tl-weeks">
              {weekStarts.slice(1).map((day) => (
                <span key={day} style={{ left: pct(day) }}>
                  {dayOfMonth(addDays(TIMELINE_START, day))}
                </span>
              ))}
              <span className="tl-today-chip" style={{ left: pct(todayOffset) }}>
                Today
              </span>
            </div>
          </Track>
        </div>

        {offers.map((offer) => (
          <div key={offer.id} className={`tl-row tl-body ${reorder.rowClass(offer.id)}`} {...reorder.rowProps(offer.id)}>
            <div className="tl-left">
              <DragHandle offer={offer} {...reorder.handleProps(offer.id)} />
              <PriorityBadge priority={priorityOf(offer.id)} />
              <div className="offer-name">
                <div className="offer-title">{offer.name}</div>
                <div className="offer-type">
                  {typeLabels[offer.type].singular} · {audienceLabel(offer)}
                </div>
              </div>
              <StatusPill status={offer.status} />
              <KebabButton offer={offer} />
            </div>
            <Track>
              <Bars offer={offer} />
            </Track>
          </div>
        ))}
      </div>
    </div>
  )
}
