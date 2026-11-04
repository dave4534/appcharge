import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react'
import { Icon, IconButton } from '../../design-system/components'
import { audienceLabel, typeLabels, type Offer } from './data'
import { TIMELINE_DAYS, TIMELINE_START, addDays, dayDiff, dayOfMonth, formatDay, monthLabel } from './dates'
import { DragHandle, KebabButton, OfferTitle, PriorityBadge, StatusPill } from './parts'
import { isOpenable, rowClick } from './rows'
import { useReorder } from './useReorder'

type TimelineViewProps = {
  offers: Offer[]
  priorityOf: (id: string) => number
  canReorder: boolean
  onMove: (id: string, targetId: string, after: boolean) => void
  onOpen: (id: string) => void
  onDelete: (offer: Offer) => void
}

// The timeline shows seven weeks at a time and can be moved a week at a time.
const MIN_SHIFT = -8
const MAX_SHIFT = 16

const pct = (days: number) => `${(days / TIMELINE_DAYS) * 100}%`

const weekStarts = Array.from({ length: TIMELINE_DAYS / 7 }, (_, i) => i * 7)

// Bars sit a few pixels inside their days, so they never touch the edge of the track
// or the bar before or after them.
const GAP = 4

// Clamp a run of days to the visible range, or return null when it is out of view.
function span(startDay: number, length: number) {
  const from = Math.max(startDay, 0)
  const to = Math.min(startDay + length, TIMELINE_DAYS)
  return to > from ? { left: `calc(${pct(from)} + ${GAP}px)`, width: `calc(${pct(to - from)} - ${GAP * 2}px)` } : null
}

function Track({ children }: { children?: ReactNode }) {
  return <div className="tl-track">{children}</div>
}

function Bars({ offer, from }: { offer: Offer; from: string }) {
  if (!offer.start || !offer.end) {
    return (
      <div className="tl-bar tl-empty" style={{ left: `calc(1% + ${GAP}px)`, width: '54%' }}>
        <span>Draft, no dates yet. Set a date range in Settings.</span>
      </div>
    )
  }

  const startDay = dayDiff(from, offer.start)
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
              <Icon icon={Repeat} size={14} color="current" /> every {offer.repeatWeeks} weeks
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

export function TimelineView({ offers, priorityOf, canReorder, onMove, onOpen, onDelete }: TimelineViewProps) {
  const reorder = useReorder(
    offers.map((o) => o.id),
    canReorder,
    onMove,
  )
  const [shift, setShift] = useState(0)

  const from = addDays(TIMELINE_START, shift * 7)
  const monthStarts = Array.from({ length: TIMELINE_DAYS }, (_, i) => i).filter(
    (i) => i === 0 || dayOfMonth(addDays(from, i)) === 1,
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
                  {monthLabel(addDays(from, day))}
                </span>
              ))}
            </div>
            <div className="tl-weeks">
              {weekStarts.map((day) => (
                <span key={day} style={{ left: pct(day) }}>
                  {dayOfMonth(addDays(from, day))}
                </span>
              ))}
            </div>
            <div className="tl-nav">
              <IconButton
                kind="Secondary"
                size="XS"
                aria-label="Show earlier weeks"
                disabled={shift <= MIN_SHIFT}
                iconElement={<Icon icon={ChevronLeft} size="Small" color="current" />}
                onClick={() => setShift((s) => Math.max(MIN_SHIFT, s - 1))}
              />
              <IconButton
                kind="Secondary"
                size="XS"
                aria-label="Show later weeks"
                disabled={shift >= MAX_SHIFT}
                iconElement={<Icon icon={ChevronRight} size="Small" color="current" />}
                onClick={() => setShift((s) => Math.min(MAX_SHIFT, s + 1))}
              />
            </div>
          </Track>
        </div>

        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`tl-row tl-body${isOpenable(offer) ? ' is-openable' : ''} ${reorder.rowClass(offer.id)}`}
            onClick={rowClick(offer, onOpen)}
            {...reorder.rowProps(offer.id)}
          >
            <div className="tl-left">
              <DragHandle offer={offer} {...reorder.handleProps(offer.id)} />
              <PriorityBadge priority={priorityOf(offer.id)} />
              <div className="offer-name">
                <OfferTitle offer={offer} onOpen={onOpen} />
                <div className="offer-type">
                  {typeLabels[offer.type].singular} · {audienceLabel(offer)}
                </div>
              </div>
              <StatusPill status={offer.status} />
              <KebabButton offer={offer} onEdit={onOpen} onDelete={onDelete} />
            </div>
            <Track>
              <Bars offer={offer} from={from} />
            </Track>
          </div>
        ))}
      </div>
    </div>
  )
}
