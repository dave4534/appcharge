import type { Offer, Version } from '../../pages/offers/data'
import type { CalendarSettings } from '../../pages/calendar/settings'

// A "place" is a spot in the prototype that a walkthrough step can open. Each one names
// the calendar to open and what to have showing, so a chip lands on a prepared state
// instead of just a screen.
export type PlaceId =
  | 'segmentation'
  | 'validation'
  | 'readiness'
  | 'live-warnings'
  | 'history'
  | 'calendar'
  | 'wizard'
  | 'tabs'
  | 'ai-suggestion'

// What the calendar editor should have open when it appears.
export type EditorScene = {
  step?: 0 | 1
  readiness?: boolean
  history?: boolean
  // Scrolls this element (by id) into view, for places further down a long page.
  scrollTo?: string
  // Opens the reward picker on this day (zero-based week and day).
  picker?: { week: number; day: number }
  // Fills in some Settings and shows every problem, as if Next was clicked on a half-finished calendar.
  prefill?: Partial<CalendarSettings>
  validate?: boolean
}

export const placeTargets: Record<PlaceId, { offerId: string | null; scene: EditorScene }> = {
  // Settings, scrolled to the Audience card, on a draft that targets a segment.
  segmentation: { offerId: 'november-reward-calendar', scene: { step: 0, scrollTo: 'settings-audience' } },
  // A half-finished new calendar with its problems already showing.
  validation: {
    offerId: null,
    scene: {
      step: 0,
      validate: true,
      prefill: { name: 'Spring Streak', startDate: '2026-11-10', missedDay: 'weekly', popupTrigger: 'automatic' },
    },
  },
  // A draft whose Settings are done: the checklist lists what is still open on Rewards.
  readiness: { offerId: 'november-reward-calendar', scene: { step: 1, readiness: true } },
  // A calendar players are on: Rewards says so and shows who each week reaches.
  'live-warnings': { offerId: 'weekly-reward-calendar', scene: { step: 1 } },
  // The same live calendar, with its autosave history open.
  history: { offerId: 'weekly-reward-calendar', scene: { step: 1, history: true } },
  // A finished calendar on its Rewards step.
  calendar: { offerId: 'whales-streak', scene: { step: 1 } },
  // First-time setup: a new calendar, with the two-step header.
  wizard: { offerId: null, scene: { step: 0 } },
  // A calendar that already exists: its header is tabs.
  tabs: { offerId: 'whales-streak', scene: { step: 0 } },
  // An empty day on a draft opens the picker with the suggestion already chosen.
  'ai-suggestion': { offerId: 'november-reward-calendar', scene: { step: 1, picker: { week: 0, day: 0 } } },
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
