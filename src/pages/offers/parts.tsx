import type { HTMLAttributes } from 'react'
import { statusLabels, type Offer, type OfferStatus } from './data'

export function StatusPill({ status }: { status: OfferStatus }) {
  return <span className={`status-pill s-${status}`}>{statusLabels[status]}</span>
}

export function DragHandle({ offer, ...rest }: { offer: Offer } & HTMLAttributes<HTMLButtonElement> & { draggable: boolean }) {
  return (
    <button
      type="button"
      className="drag-handle"
      aria-label={`Reorder ${offer.name}. Use the up and down arrow keys.`}
      disabled={!rest.draggable}
      {...rest}
    >
      <svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true" fill="currentColor">
        {[3, 9, 15].flatMap((y) => [3, 9].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />))}
      </svg>
    </button>
  )
}

export function KebabButton({ offer }: { offer: Offer }) {
  return (
    <button type="button" className="kebab" aria-label={`More actions for ${offer.name}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
        <circle cx="3" cy="8" r="1.4" />
        <circle cx="8" cy="8" r="1.4" />
        <circle cx="13" cy="8" r="1.4" />
      </svg>
    </button>
  )
}

export function PriorityBadge({ priority }: { priority: number }) {
  return (
    <span className="priority" title={`Priority ${priority}`}>
      {priority}
    </span>
  )
}
