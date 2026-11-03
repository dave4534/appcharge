export type OfferType = 'reward-calendar' | 'bundle' | 'promotion'
export type OfferStatus = 'live' | 'scheduled' | 'draft'

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
