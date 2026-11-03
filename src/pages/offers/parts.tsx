import { Ellipsis, GripVertical } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { Counter, Icon, IconButton, Label, Link, type LabelColor } from '../../design-system/components'
import { statusLabels, type Offer, type OfferStatus } from './data'
import { isOpenable } from './rows'

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

export function KebabButton({ offer }: { offer: Offer }) {
  return (
    <IconButton
      kind="Tertiary"
      size="Small"
      aria-label={`More actions for ${offer.name}`}
      iconElement={<Icon icon={Ellipsis} size="Medium" color="secondary" />}
    />
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
