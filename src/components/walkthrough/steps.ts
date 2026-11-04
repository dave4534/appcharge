import type { PlaceId } from './places'

// The walkthrough's words. Edit here; the component never needs to change.
// A step can list places in the prototype: each shows as a chip that opens that spot, with
// a short note on what to look for.
export type WalkthroughPlace = { id: PlaceId; label: string; note: string }
export type WalkthroughStep = { title: string; body: string[]; places?: WalkthroughPlace[] }

export const walkthroughSteps: WalkthroughStep[] = [
  {
    title: 'Hi, I’m Dave',
    body: [
      'This is my take on the Reward Calendar builder. I can’t be in the room, so this guide walks you through my thinking.',
      'Keep it open while you click around the prototype, or close it and come back any time.',
    ],
  },
  {
    title: 'The problem, as I understood it',
    body: [
      'Monetization managers set up many calendars each week, under time pressure. They know their game and economy, but they aren’t designers or developers.',
      'A big reward at the end of a weekly chain brings players back, so mistakes here cost revenue.',
    ],
  },
  {
    title: 'Risk management',
    body: [
      'The costliest mistake is editing a live calendar. In 2021, Marvel Strike Force players who logged in for 21 days found their final rewards missing.',
      'So I warn assertively about what’s at risk, and let managers go back in time to undo a mistake.',
    ],
    places: [
      {
        id: 'validation',
        label: 'Validation',
        note: 'Settings can’t move on until required choices are made, and the page says what’s still needed.',
      },
      {
        id: 'readiness',
        label: 'Readiness checklist',
        note: 'Before publishing, a checklist shows what’s still open. It never blocks you, but the risk is clear.',
      },
      {
        id: 'live-warnings',
        label: 'Live edit warnings',
        note: 'A live calendar says so, shows how many players each week reaches, and sends changes for approval in Slack.',
      },
      {
        id: 'history',
        label: 'Version history',
        note: 'Every autosave is a version. Restoring one saves it as a new version, so nothing is lost.',
      },
    ],
  },
  {
    title: 'What the market does',
    body: [
      'Xsolla and Aghanim both offer reward calendars. Both lead with settings. Xsolla also has a node-based canvas aimed at marketers.',
      'Appcharge is investing in LiveOps retention, checkout and AI tools, so I designed with that direction in mind.',
    ],
  },
  {
    title: 'A calendar, not a canvas',
    body: [
      'A node canvas suits marketing teams, but I assumed this audience isn’t technical, so I kept an actual calendar.',
      'The trade-off is that it may appeal less to analytics-minded teams. With more research I’d test this at scale.',
    ],
  },
  {
    title: 'Wizard once, tabs after',
    body: [
      'First-time setup is a guided wizard. Editing a calendar that already exists uses tabs, because wizards are slow for repeat work.',
      'Settings get a page of their own, since they hold more fields than a modal handles well.',
    ],
  },
  {
    title: 'AI, with guardrails',
    body: [
      'Daily suggestions and a chat assistant, Charlie, help fill many weeks at once. People who don’t have AI in the product will use outside tools anyway.',
      'Charlie is scripted here. In a real product I’d pair AI actions with impact previews.',
    ],
  },
  {
    title: 'Assumptions and open questions',
    body: [
      'I assumed users aren’t technical, so segmentation only picks who sees a calendar. There are no rules or conditions.',
      'Still open: is this a recurring weekly program or one long one? And is Appcharge growing toward marketing tools or revenue drivers?',
    ],
  },
]
