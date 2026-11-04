import type { Offer } from '../pages/offers/data'

// Offers (including every draft) are saved in the browser so nothing is lost if the
// page closes. Bump VERSION when the saved shape changes and old data should be dropped.
const KEY = 'appcharge-prototype:offers'
const VERSION = 5

export function loadOffers(fallback: Offer[]): Offer[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw) as { version?: number; offers?: Offer[] }
    return saved.version === VERSION && Array.isArray(saved.offers) ? saved.offers : fallback
  } catch {
    return fallback
  }
}

export function saveOffers(offers: Offer[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ version: VERSION, offers }))
  } catch {
    // Private windows or full storage: the prototype still works, it just won't remember.
  }
}
