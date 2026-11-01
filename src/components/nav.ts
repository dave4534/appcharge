import type { IconName } from './Icon'

export type NavItem = {
  id: string
  label: string
  icon: IconName
  beta?: boolean
}

export type NavSection = {
  id: string
  label: string
  items: NavItem[]
}

// Mirrors the Appcharge back-office sidebar from the Figma screenshots.
// "Offers" was cut off in the screenshots: Bundles, Promotions and Popups are
// visible, Progress Bars and Reward Calendars are added from the public docs.
export const navSections: NavSection[] = [
  {
    id: 'management',
    label: 'Management',
    items: [
      { id: 'analytics', label: 'Analytics', icon: 'analytics' },
      { id: 'players', label: 'Players', icon: 'players' },
      { id: 'pricing', label: 'Pricing', icon: 'pricing' },
      { id: 'coupons', label: 'Coupons', icon: 'coupons' },
      { id: 'localization', label: 'Localization', icon: 'localization' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    items: [
      { id: 'builder', label: 'Builder', icon: 'builder' },
      { id: 'template-studio', label: 'Template Studio', icon: 'template', beta: true },
      { id: 'products', label: 'Products', icon: 'products' },
      { id: 'offer-design', label: 'Offer Design', icon: 'design' },
      { id: 'checkout-design', label: 'Checkout Design', icon: 'checkout' },
      { id: 'badges', label: 'Badges', icon: 'badges' },
      { id: 'assets-library', label: 'Assets Library', icon: 'assets' },
    ],
  },
  {
    id: 'offers',
    label: 'Offers',
    items: [
      { id: 'bundles', label: 'Bundles', icon: 'products' },
      { id: 'promotions', label: 'Promotions', icon: 'promotions' },
      { id: 'popups', label: 'Popups', icon: 'popups' },
      { id: 'progress-bars', label: 'Progress Bars', icon: 'progress' },
      { id: 'reward-calendars', label: 'Reward Calendars', icon: 'calendar' },
    ],
  },
]
