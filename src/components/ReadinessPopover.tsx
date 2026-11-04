import { Blend, CalendarDays, CircleAlert, CircleCheck, SlidersHorizontal, TrendingUp, TriangleAlert, X } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ReadinessDonut } from './ReadinessDonut'
import type { ReadyItem, ReadyStatus, Readiness } from '@/pages/calendar/readiness'
import './readiness.css'

const ICONS: Record<ReadyItem['id'], ComponentType<{ size?: number }>> = {
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
}

// The readiness ring in the header. It opens a checklist of what is ready and what is a
// risk. Anything short of 100% can still be published, and the popover says so.
export function ReadinessPopover({ readiness, open, onOpenChange, confirmLabel, onConfirm }: ReadinessPopoverProps) {
  const complete = readiness.percent >= 100
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="readiness-trigger" aria-label={`Readiness: ${readiness.percent}% ready`}>
        <ReadinessDonut percent={readiness.percent} size={32} />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="readiness-popover w-[380px] gap-0 p-0">
        <div className="readiness-head">
          <ReadinessDonut percent={readiness.percent} size={44} />
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
                  <span className={`readiness-detail readiness-detail--${item.status}`}>{item.detail}</span>
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
          {complete ? (
            <p>Everything checked is ready.</p>
          ) : (
            <p>You can still publish. Open items put players at risk.</p>
          )}
          {!complete && (
            <Button
              size="lg"
              onClick={() => {
                onOpenChange(false)
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
