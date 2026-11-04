import type { Offer, Version } from '../../pages/offers/data'
import type { CalendarSettings } from '../../pages/calendar/settings'

// A "place" is a spot in the prototype that a walkthrough step can open. Each one names
// the calendar to open and what to have showing, so "Show me" lands on a prepared state
// instead of just a screen.
export type PlaceId = 'validation' | 'readiness' | 'live-warnings' | 'history'

// What the calendar editor should have open when it appears.
export type EditorScene = { step?: 0 | 1; readiness?: boolean; history?: boolean }

export const placeTargets: Record<PlaceId, { offerId: string | null; scene: EditorScene }> = {
  // A new calendar: nothing is chosen yet, so Settings shows what is still needed.
  validation: { offerId: null, scene: { step: 0 } },
  // A draft whose Settings are done: the checklist lists what is still open on Rewards.
  readiness: { offerId: 'november-reward-calendar', scene: { step: 1, readiness: true } },
  // A calendar players are on: Rewards says so and shows who each week reaches.
  'live-warnings': { offerId: 'weekly-reward-calendar', scene: { step: 1 } },
  // The same live calendar, with its autosave history open.
  history: { offerId: 'weekly-reward-calendar', scene: { step: 1, history: true } },
}

const HOUR = 3_600_000

// Seeded calendars start with one version, so the history would be empty. This gives the
// live calendar a believable past: earlier saves with small settings changes, ending on
// the current settings so nothing about the calendar itself changes.
export function demoVersions(offer: Offer): Version[] {
  if (!offer.settings || !offer.rewards) return offer.versions ?? []
  const now = Date.now()
  const earlier: Array<[number, string, Partial<CalendarSettings>]> = [
    [70, 'Dave', { popupTrigger: 'click', collection: 'forced' }],
    [47, 'Maya', { popupTrigger: 'automatic', collection: 'forced' }],
    [22, 'Dave', { popupTrigger: 'automatic', collection: 'manual', missedDay: 'complete' }],
  ]
  const versions: Version[] = earlier.map(([hoursAgo, by, patch], i) => ({
    n: i + 1,
    savedAt: now - hoursAgo * HOUR,
    by,
    settings: { ...offer.settings!, ...patch },
    rewards: offer.rewards!,
  }))
  versions.push({ n: versions.length + 1, savedAt: now - 2 * HOUR, by: 'Dave', settings: offer.settings, rewards: offer.rewards })
  return versions
}
