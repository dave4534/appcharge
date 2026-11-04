import type { MouseEvent } from 'react'
import type { Offer } from './data'

// Reward calendars open in the editor; other offer types are plain text for now.
export const isOpenable = (offer: Offer) => offer.type === 'reward-calendar'

// Clicking a row opens it, except when the click lands on a control inside the row.
export const rowClick = (offer: Offer, onOpen: (id: string) => void) => (e: MouseEvent<HTMLElement>) => {
  if (!isOpenable(offer) || (e.target as HTMLElement).closest('button, a, input, [role="menuitem"], [role="menu"]')) return
  onOpen(offer.id)
}
