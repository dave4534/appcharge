import { Ellipsis, GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { Counter, Icon, IconButton, Label, Link, type LabelColor } from '../../design-system/components'
import { statusLabels, type Offer, type OfferStatus } from './data'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { isOpenable } from './rows'
import { ReadinessDonut } from '@/components/ReadinessDonut'
import { readinessOfOffer } from '../calendar/readiness'

// Live is Positive, Scheduled is Primary and Draft is Dark, the same mapping the
// timeline bars use.
const statusColor: Record<OfferStatus, LabelColor> = {
  live: 'Positive',
  scheduled: 'Primary',
  draft: 'Dark',
}

export function StatusPill({ status }: { status: OfferStatus }) {
  return (
    <Label color={statusColor[status]} kind={status === 'draft' ? 'Line' : 'Fill'}>
      {statusLabels[status]}
    </Label>
  )
}

export function DragHandle({ offer, ...rest }: { offer: Offer } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <IconButton
      kind="Tertiary"
      size="XS"
      className="drag-handle"
      aria-label={`Reorder ${offer.name}. Use the up and down arrow keys.`}
      disabled={!rest.draggable}
      iconElement={<Icon icon={GripVertical} size="Small" color="secondary" />}
      {...rest}
    />
  )
}

// The row's flyout menu: edit it, or delete it (which asks first).
export function KebabButton({ offer, onEdit, onDelete }: { offer: Offer; onEdit: (id: string) => void; onDelete: (offer: Offer) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton
            kind="Tertiary"
            size="Small"
            aria-label={`More actions for ${offer.name}`}
            iconElement={<Icon icon={Ellipsis} size="Medium" color="secondary" />}
          />
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem disabled={!isOpenable(offer)} onClick={() => onEdit(offer.id)}>
          <Pencil />
          Edit
        </DropdownMenuItem>
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
    <Counter size="Large" color="Dark" kind="Line" title={`Priority ${priority}`}>
      {priority}
    </Counter>
  )
}

export function OfferTitle({ offer, onOpen }: { offer: Offer; onOpen: (id: string) => void }) {
  if (isOpenable(offer)) {
    return (
      <Link
        size="Large"
        href="#"
        className="offer-title"
        onClick={(e) => {
          e.preventDefault()
          onOpen(offer.id)
        }}
      >
        {offer.name}
      </Link>
    )
  }
  return <div className="offer-title">{offer.name}</div>
}

// How ready a reward calendar is to run. Other offer types are not rated.
export function ReadinessCell({ offer }: { offer: Offer }) {
  const readiness = readinessOfOffer(offer)
  if (!readiness) return <span className="muted">–</span>
  const ready = readiness.percent >= 100
  return (
    <span className="readiness-cell" title={readiness.items.map((i) => `${i.label}: ${i.detail}`).join('\n')}>
      <ReadinessDonut percent={readiness.percent} size={24} />
      {ready ? 'Ready' : `${readiness.percent}% ready`}
    </span>
  )
}
