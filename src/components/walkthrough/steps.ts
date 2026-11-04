import type { PlaceId } from './places'

// The walkthrough's words, from the "Walkthrough content" section of Deck.md. Edit there,
// then sync here; the component never needs to change.
//
// - Paragraphs can hold links written as [text](url).
// - {timeOfDay} becomes morning, afternoon or evening on the reader's clock.
// - A step can list places in the prototype: each shows as a chip that opens that spot.
//   A place can carry a short `note`, shown under the chip once it is opened.
export type WalkthroughPlace = { id: PlaceId; label: string; note?: string }
export type WalkthroughStep = { title: string; body: string[]; places?: WalkthroughPlace[] }

export const walkthroughSteps: WalkthroughStep[] = [
  {
    title: 'Hi, I’m Dave!',
    body: [
      'Welcome, I had a lot of fun working on this. I hope this guide finds you well and is useful for showing you context-specific key decisions I made. You’ll see little text chips in each step, these are my way of showing you examples of what I’m talking about.',
    ],
  },
  {
    title: 'Do we have a problem?',
    body: [
      'Well, monetization managers do yeah. They set up many calendars each week, under time pressure. They know their game and economy, but they aren’t designers or developers. Things that add complexity to the experience are live calendars (editing live calendars could hurt streaks that are in progress), segmentation and reward economy. Making a mistake could be costly.',
    ],
  },
  {
    title: 'Understanding our users',
    body: [
      'After researching the market and understanding there is a close overlap with the role of the Monetization Manager and Marketing/Revenue roles, making a journey based approach (like Xsolla’s node canvas) made sense to consider, but ultimately I got the impression the user is not tech savvy thus I decided to stick with an actual calendar. The tradeoff was that this approach could lower chances of product adoption from the more “marketing/analytics” part of the market. In reality I would have liked to have more research and I would have done user testing at scale as well as understand what the roadmap looks like for Appcharge',
      'Go ahead and create a fresh reward calendar and see for yourself :)',
    ],
  },
  {
    title: 'User segmentation',
    body: [
      'Segmentation in settings is also kept at a low scope, considering both the scope of this assignment but also considering this is a feature that has a wide spectrum of technicality and based on the assumption users aren’t tech savvy, I chose to let the user choose only which segments a calendar is shown to. Segmentation rules with conditionals and attributes seemed to me that they might overwhelm our user persona.',
    ],
    places: [{ id: 'segmentation', label: 'Segmentation (in settings)' }],
  },
  {
    title: 'Risk management',
    body: [
      'The costliest mistake is editing a live calendar. In 2021, Marvel Strike Force players who logged in for 21 days found their final rewards missing. I took a very communicative approach to warnings that is used to help the user better understand what is at risk and how this change could impact their users.',
    ],
    places: [
      { id: 'validation', label: 'Validation' },
      { id: 'readiness', label: 'Readiness' },
      { id: 'live-warnings', label: 'Live edit warnings' },
      { id: 'history', label: 'Version history' },
    ],
  },
  {
    title: 'Understanding the market',
    body: [
      'A deep competitive research run showed that Aghanim and Xsolla are two direct competitors who provide Reward Calendars. Both have a settings-first approach and in Xsolla’s case although it does have a Publisher’s dashboard more similar to Aghanim with a list display of daily rewards, they also have a node-based interface that I assume is an attempt to go upmarket by providing a tool with marketing transparency and ways to work with data and analytics.',
      'An additional research round was dedicated to inferring Appcharge’s roadmap to understand where the product direction is planned to go. I understood that Appcharge plans on fortifying its LiveOps retention feature offering (like progress bars and store refresh pop ups) and is also expanding its Checkout and Payments abilities. There also seems to be an active effort to integrate AI tools like an MCP server and AI store builder. Appcharge is investing in LiveOps retention and AI tools, so I designed with that direction in mind.',
    ],
  },
  {
    title: 'A calendar, not a list view',
    body: [
      'A node canvas suits marketing teams, but I assumed this audience isn’t technical, so I kept an actual calendar.',
      'The trade-off is that it may appeal less to analytics-minded teams. With more research I’d test this at scale.',
    ],
    places: [{ id: 'calendar', label: 'Calendar' }],
  },
  {
    title: 'Wizard once, tabs after',
    body: [
      'First-time setup is a guided wizard. Editing a calendar that already exists uses tabs, because wizards are slow for repeat work.',
      'Settings get a page of their own, since they hold more fields than a modal handles well.',
    ],
    places: [
      { id: 'wizard', label: 'Wizard' },
      { id: 'tabs', label: 'Tabs' },
    ],
  },
  {
    title: 'AI, with guardrails',
    body: [
      'I explored daily and weekly AI suggestions that help users create reward content not only at scale but also helps them be informed by their performance data and according to their business objectives. These features would obviously need to be accompanied by additional back-office product areas but I do assume there should be AI within the product because users will be expecting that, and competitors might have those features tomorrow. The scope of having weekly suggestions was too large for me to polish although I did start [exploring that concept](https://claude.ai/artifact/A2X9rANQ9m3P7nsBMvkTzB#artboard-f295c0a60844). I also explored an action button in the left nav where users can install an MCP. I think MCPs could in the future serve as a core part of an experience where agents orchestrate between business objectives, campaigns and thus reward calendars.',
      'Charlie AI: I [explored an AI chat](https://claude.ai/artifact/A2X9rANQ9m3P7nsBMvkTzB#artboard-f099f9b277d0) addition under the assumption that users would not only expect it in today’s AI landscape, but they might also want to consult with it about best-performing day and week configurations.',
    ],
    places: [{ id: 'ai-suggestion', label: 'AI Suggestion' }],
  },
  {
    title: 'What I’d do differently',
    body: [
      'I spent a lot of time on competitive and market research. It was really important to me to understand the big picture and landscape, which affects Appcharge’s inferred roadmap and thus the product direction that is a part of my hypothesis. In hindsight I think it would’ve been better to spend less on that, and more on other stuff. Also, although my reasoning for descoping AI suggestions, segmentation and templating, I would have spent more time looking at AI patterns that could be relevant. On one hand, it could be risky to not be armed with AI features tomorrow. On the other hand, with fintech and generally financial contexts AI is a bit more risky so maybe that is a smart move to ease into it.',
    ],
  },
  {
    title: 'Thanks for joining me!',
    body: [
      'Thanks for joining me on this journey! I hope you have a great {timeOfDay} and I really look forward to coming in and presenting this in person :)',
    ],
  },
]
