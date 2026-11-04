import { Blend, CalendarDays, CircleAlert, CircleCheck, SlidersHorizontal, TrendingUp, TriangleAlert, X } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { SubmitRequestButton } from '@/components/SubmitRequestButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ReadinessDonut } from './ReadinessDonut'
import type { ReadyItem, ReadyStatus, Readiness } from '@/pages/calendar/readiness'
import './readiness.css'

const ICONS: Record<ReadyItem['id'], ComponentType<{ size?: number }>> = {
  status: TriangleAlert,
  settings: SlidersHorizontal,
  days: CalendarDays,
  values: TrendingUp,
  overlap: Blend,
}

const STATUS: Record<ReadyStatus, { label: string; icon?: ComponentType<{ size?: number }> }> = {
  ready: { label: 'Ready', icon: CircleCheck },
  warning: { label: 'Review', icon: TriangleAlert },
  required: { label: 'Required', icon: CircleAlert },
  unchecked: { label: 'Not checked' },
}

type ReadinessPopoverProps = {
  readiness: Readiness
  open: boolean
  onOpenChange: (open: boolean) => void
  // Publishing (or saving a live calendar) anyway, with open items.
  confirmLabel: string
  onConfirm: () => void
  // Takes empty days out of the calendar.
  onRemoveEmpty: () => void
  // A live calendar can't be saved straight away: a manager approves the change in Slack.
  live?: boolean
  onSubmitRequest?: () => void
  // True while nothing can be published, because no day has a reward yet.
  blocked?: boolean
}

// The readiness ring in the header. It opens a checklist of what is ready and what is a
// risk. Anything short of 100% can still be published, and the popover says so.
export function ReadinessPopover({ readiness, open, onOpenChange, confirmLabel, onConfirm, onRemoveEmpty, live, onSubmitRequest, blocked }: ReadinessPopoverProps) {
  const complete = readiness.percent >= 100
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="readiness-trigger" aria-label={`Readiness: ${readiness.percent}% ready`}>
        <ReadinessDonut percent={readiness.percent} size={16} />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="readiness-popover w-[380px] gap-0 p-0">
        <div className="readiness-head">
          <ReadinessDonut percent={readiness.percent} size={36} />
          <div>
            <div className="readiness-title">Readiness</div>
            <div className="readiness-sub">{complete ? 'Ready to publish' : `${readiness.percent}% ready`}</div>
          </div>
          <button type="button" className="readiness-close" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X size={18} />
          </button>
        </div>

        <ul className="readiness-list">
          {readiness.items.map((item) => {
            const Icon = ICONS[item.id]
            const status = STATUS[item.status]
            const StatusIcon = status.icon
            return (
              <li key={item.id} className="readiness-row">
                <span className="readiness-icon">
                  <Icon size={20} />
                </span>
                <div className="readiness-text">
                  <strong>{item.label}</strong>
                  <span className="readiness-detail">{item.detail}</span>
                </div>
                <span className={`readiness-status readiness-status--${item.status}`}>
                  {StatusIcon && <StatusIcon size={16} />}
                  {status.label}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="readiness-foot">
          {live ? (
            <p>Changes to a live calendar reach players, so a manager approves them first.</p>
          ) : blocked ? (
            <p>Add a reward to at least one day to publish.</p>
          ) : complete ? (
            <p>Everything checked is ready.</p>
          ) : (
            <p>You can still publish. Open items put players at risk.</p>
          )}
          {live && (
            <div className="readiness-actions">
              <SubmitRequestButton
                variant="outline"
                disabled={blocked}
                onClick={() => {
                  onOpenChange(false)
                  onSubmitRequest?.()
                }}
              />
            </div>
          )}
          {!live && !complete && (
            <div className="readiness-actions">
              {readiness.emptyDays > 0 && readiness.filledDays > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onRemoveEmpty}
                >
                  Remove Empty Days
                </Button>
              )}
              <Button
                size="lg"
                disabled={blocked}
                onClick={() => {
                  onOpenChange(false)
                  onConfirm()
                }}
              >
                {confirmLabel}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
