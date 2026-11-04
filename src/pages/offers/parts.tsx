import { Ellipsis, Pause, Pencil, Play, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/IconButton'
import { ReadinessDonut } from '@/components/ReadinessDonut'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { readinessOfOffer } from '../calendar/readiness'
import { statusLabels, type Offer, type OfferStatus } from './data'
import { isOpenable } from './rows'

// Live is green, Scheduled is the brand color and Draft is an outline, the same mapping
// the timeline bars use.
const statusVariant: Record<OfferStatus, 'success' | 'warning' | 'default' | 'outline'> = {
  live: 'success',
  paused: 'warning',
  scheduled: 'default',
  draft: 'outline',
}

export function StatusPill({ status }: { status: OfferStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
}

type KebabProps = {
  offer: Offer
  onEdit: (id: string) => void
  onDelete: (offer: Offer) => void
  // Pausing asks first; resuming does not.
  onPause: (offer: Offer) => void
  onResume: (offer: Offer) => void
}

// The row's flyout menu: edit it, pause or resume it, or delete it (which asks first).
export function KebabButton({ offer, onEdit, onDelete, onPause, onResume }: KebabProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<IconButton kind="Tertiary" size="Small" aria-label={`More actions for ${offer.name}`} iconElement={<Ellipsis className="size-4" />} />}
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem disabled={!isOpenable(offer)} onClick={() => onEdit(offer.id)}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        {offer.status === 'live' && (
          <DropdownMenuItem onClick={() => onPause(offer)}>
            <Pause />
            Pause
          </DropdownMenuItem>
        )}
        {offer.status === 'paused' && (
          <DropdownMenuItem onClick={() => onResume(offer)}>
            <Play />
            Resume
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(offer)}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PriorityBadge({ priority }: { priority: number }) {
  return (
    <Badge variant="outline" className="size-6 justify-center rounded-full px-0 text-sm" title={`Priority ${priority}`}>
      {priority}
    </Badge>
  )
}

export function OfferTitle({ offer, onOpen }: { offer: Offer; onOpen: (id: string) => void }) {
  if (isOpenable(offer)) {
    return (
      <a
        href="#"
        className="offer-title text-base font-medium text-primary underline-offset-4 hover:underline"
        onClick={(e) => {
          e.preventDefault()
          onOpen(offer.id)
        }}
      >
        {offer.name}
      </a>
    )
  }
  return <div className="offer-title text-base font-medium">{offer.name}</div>
}

// How ready a reward calendar is to run. Other offer types are not rated.
export function ReadinessCell({ offer, offers }: { offer: Offer; offers: Offer[] }) {
  const readiness = readinessOfOffer(offer, offers)
  if (!readiness) return <span className="muted">–</span>
  const ready = readiness.percent >= 100
  return (
    <span className="readiness-cell" title={readiness.items.map((i) => `${i.label}: ${i.detail}`).join('\n')}>
      <ReadinessDonut percent={readiness.percent} size={20} />
      {ready ? 'Ready' : `${readiness.percent}% ready`}
    </span>
  )
}
