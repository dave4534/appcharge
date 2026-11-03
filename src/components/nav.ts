import {
  CalendarDays,
  ChartColumn,
  CreditCard,
  Gauge,
  Image,
  BadgeCheck,
  Languages,
  LayoutDashboard,
  LayoutTemplate,
  MessageSquare,
  Package,
  Palette,
  Percent,
  Settings,
  Tag,
  Ticket,
  Users,
  Boxes,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
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
      { id: 'analytics', label: 'Analytics', icon: ChartColumn },
      { id: 'players', label: 'Players', icon: Users },
      { id: 'pricing', label: 'Pricing', icon: Tag },
      { id: 'coupons', label: 'Coupons', icon: Ticket },
      { id: 'localization', label: 'Localization', icon: Languages },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    items: [
      { id: 'builder', label: 'Builder', icon: LayoutDashboard },
      { id: 'template-studio', label: 'Template Studio', icon: LayoutTemplate, beta: true },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'offer-design', label: 'Offer Design', icon: Palette },
      { id: 'checkout-design', label: 'Checkout Design', icon: CreditCard },
      { id: 'badges', label: 'Badges', icon: BadgeCheck },
      { id: 'assets-library', label: 'Assets Library', icon: Image },
    ],
  },
  {
    id: 'offers',
    label: 'Offers',
    items: [
      { id: 'bundles', label: 'Bundles', icon: Boxes },
      { id: 'promotions', label: 'Promotions', icon: Percent },
      { id: 'popups', label: 'Popups', icon: MessageSquare },
      { id: 'progress-bars', label: 'Progress Bars', icon: Gauge },
      { id: 'reward-calendars', label: 'Reward Calendars', icon: CalendarDays },
    ],
  },
]
