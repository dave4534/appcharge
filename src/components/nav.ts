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

// Based on the Appcharge back-office sidebar from the Figma screenshots, with Offers
// moved to the top and Reward Calendars first, since this prototype is about them.
// Progress Bars and Reward Calendars come from the public docs.
export const navSections: NavSection[] = [
  {
    id: 'offers',
    label: 'Offers',
    items: [
      { id: 'reward-calendars', label: 'Reward Calendars', icon: CalendarDays },
      { id: 'bundles', label: 'Bundles', icon: Boxes },
      { id: 'promotions', label: 'Promotions', icon: Percent },
      { id: 'popups', label: 'Popups', icon: MessageSquare },
      { id: 'progress-bars', label: 'Progress Bars', icon: Gauge },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    items: [
      { id: 'builder', label: 'Builder', icon: LayoutDashboard },
      { id: 'template-studio', label: 'Template Studio', icon: LayoutTemplate, beta: true },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'checkout-design', label: 'Checkout Design', icon: CreditCard },
      { id: 'badges', label: 'Badges', icon: BadgeCheck },
      { id: 'assets-library', label: 'Assets Library', icon: Image },
    ],
  },
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
]
