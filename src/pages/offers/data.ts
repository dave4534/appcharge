import type { CalendarSettings } from '../calendar/settings'
import { suggestWeek, type RewardWeek } from '../calendar/rewards/rules'

export type OfferType = 'reward-calendar' | 'bundle' | 'promotion'
export type OfferStatus = 'live' | 'scheduled' | 'draft'

// One autosave of a calendar. The newest version is the current one.
export type Version = {
  n: number
  savedAt: number
  by: string
  settings: CalendarSettings
  rewards: RewardWeek[]
}

export type Offer = {
  id: string
  name: string
  type: OfferType
  audience: string
  audienceSize?: number
  start: string | null
  end: string | null
  // Set when the offer runs again on a fixed cycle, in weeks.
  repeatWeeks?: number
  status: OfferStatus
  // Everything entered on the Settings step, kept so a draft can be reopened.
  settings?: CalendarSettings
  // The reward for each day of each week, set on the Rewards step.
  rewards?: RewardWeek[]
  // Autosave history, oldest first.
  versions?: Version[]
}

export const typeLabels: Record<OfferType, { singular: string; plural: string }> = {
  'reward-calendar': { singular: 'Reward Calendar', plural: 'Reward Calendars' },
  bundle: { singular: 'Bundle', plural: 'Bundles' },
  promotion: { singular: 'Promotion', plural: 'Promotions' },
}

export const statusLabels: Record<OfferStatus, string> = {
  live: 'Live',
  scheduled: 'Scheduled',
  draft: 'Draft',
}

export const audienceLabel = (o: Offer) =>
  o.audienceSize ? `${o.audience} (${o.audienceSize.toLocaleString('en-US')})` : o.audience

// The example schedule from the reward spec, grown week over week by the same logic
// the editor uses. Illustrative amounts.
function seedRewards(weeks: number): RewardWeek[] {
  const plan: RewardWeek[] = []
  for (let i = 0; i < weeks; i++) plan.push(suggestWeek(plan, i).week)
  return plan
}

const completeSettings = (
  name: string,
  startDate: string,
  endDate: string,
  rest: Pick<CalendarSettings, 'missedDay' | 'afterLast' | 'popupTrigger' | 'collection' | 'audienceMode' | 'segments'>,
): CalendarSettings => ({ name, startDate, startTime: '00:00', endDate, endTime: '23:59', timezone: 'UTC', ...rest })

// Listed in priority order. Each offer type is ranked from 1 within this list.
export const initialOffers: Offer[] = [
  {
    id: 'starter-bundle',
    name: 'Starter Bundle',
    type: 'bundle',
    audience: 'New players',
    start: '2026-11-01',
    end: '2026-11-30',
    status: 'live',
  },
  {
    id: 'weekly-reward-calendar',
    name: 'Weekly Reward Calendar',
    type: 'reward-calendar',
    audience: 'All players',
    start: '2026-11-02',
    end: '2026-11-29',
    repeatWeeks: 4,
    status: 'live',
    settings: completeSettings('Weekly Reward Calendar', '2026-11-02', '2026-11-29', {
      missedDay: 'weekly',
      afterLast: 'restart',
      popupTrigger: 'automatic',
      collection: 'manual',
      audienceMode: 'all',
      segments: [],
    }),
    rewards: seedRewards(4),
  },
  {
    id: 'whales-streak',
    name: 'Whales Streak',
    type: 'reward-calendar',
    audience: 'High spenders',
    audienceSize: 4210,
    start: '2026-11-09',
    end: '2026-12-06',
    status: 'scheduled',
    settings: completeSettings('Whales Streak', '2026-11-09', '2026-12-06', {
      missedDay: 'complete',
      afterLast: 'end',
      popupTrigger: 'automatic',
      collection: 'forced',
      audienceMode: 'segments',
      segments: ['High spenders'],
    }),
    rewards: seedRewards(4),
  },
  {
    id: 'weekend-flash-sale',
    name: 'Weekend Flash Sale',
    type: 'promotion',
    audience: 'All players',
    start: '2026-11-06',
    end: '2026-11-08',
    status: 'scheduled',
  },
  {
    id: 'november-reward-calendar',
    name: 'November Reward Calendar',
    type: 'reward-calendar',
    audience: 'High spenders',
    audienceSize: 4210,
    start: '2026-11-11',
    end: '2026-12-06',
    status: 'draft',
    settings: {
      name: 'November Reward Calendar',
      startDate: '2026-11-11',
      startTime: '00:00',
      endDate: '2026-12-06',
      endTime: '23:59',
      timezone: 'UTC',
      missedDay: 'complete',
      afterLast: 'restart',
      popupTrigger: 'automatic',
      collection: 'manual',
      audienceMode: 'segments',
      segments: ['High spenders'],
    },
  },
  {
    id: 'welcome-calendar',
    name: 'Welcome Calendar',
    type: 'reward-calendar',
    audience: 'New players',
    start: null,
    end: null,
    status: 'draft',
  },
]
