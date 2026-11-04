import {
  Archive,
  Box,
  Clover,
  Crown,
  Dices,
  Flame,
  Frame,
  Gem,
  Gift,
  Layers,
  Medal,
  Package,
  PackageOpen,
  Palette,
  Rocket,
  Shield,
  Smile,
  Sparkles,
  Star,
  Sticker,
  Swords,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { RewardKind } from './rules'

// The publisher's product bank: everything a manager could put in a calendar day.
// A real store would have hundreds of products. This is a small stand-in.
//
// The bank also holds the availability policy, which is the source of truth for what a
// day offers. The picker, the warnings, the suggestions and Charlie all read it, so
// they can never disagree. The manager only ever sees products that are available
// for the day they are editing, never a status.

export type BankTab = 'Virtual currencies' | 'Items' | 'Bundles' | 'Lootboxes'

export const BANK_TABS: BankTab[] = ['Virtual currencies', 'Items', 'Bundles', 'Lootboxes']

export type Product = {
  sku: string
  name: string
  // Chips, Diamonds and the XP boost carry reward rules; every other product is an item.
  kind: RewardKind
  tab: BankTab
  category: string
  price: string
  icon: LucideIcon
  // Only offered on Day 7, the main reward.
  day7Only?: boolean
}

export const PRODUCTS: Product[] = [
  // Virtual currencies
  { sku: 'chips', name: 'Chips', kind: 'chips', tab: 'Virtual currencies', category: 'Core currency', price: '$0.99 per 20B', icon: Gem },
  { sku: 'diamonds', name: 'Diamonds', kind: 'diamonds', tab: 'Virtual currencies', category: 'Premium currency', price: '$1.99 per 13', icon: Gem, day7Only: true },
  { sku: 'star-points', name: 'Star points', kind: 'item', tab: 'Virtual currencies', category: 'Loyalty', price: '$0.99 per 100', icon: Star },
  { sku: 'spin-tokens', name: 'Spin tokens', kind: 'item', tab: 'Virtual currencies', category: 'Core currency', price: '$0.99 per 10', icon: Dices },
  { sku: 'event-tokens', name: 'Event tokens', kind: 'item', tab: 'Virtual currencies', category: 'Events', price: '$0.99 per 25', icon: Medal },

  // Items
  { sku: 'xp-boost-2x', name: '2x XP boost', kind: 'xp-boost', tab: 'Items', category: 'Boosts', price: '$1.99 per hour', icon: Zap, day7Only: true },
  { sku: 'lucky-charm', name: 'Lucky charm', kind: 'item', tab: 'Items', category: 'Boosts', price: '$0.99', icon: Clover },
  { sku: 'power-spark', name: 'Power spark', kind: 'item', tab: 'Items', category: 'Boosts', price: '$0.99', icon: Flame },
  { sku: 'avatar-frame-gold', name: 'Gold avatar frame', kind: 'item', tab: 'Items', category: 'Cosmetics', price: '$2.99', icon: Frame },
  { sku: 'emote-pack', name: 'Emote pack', kind: 'item', tab: 'Items', category: 'Cosmetics', price: '$1.99', icon: Smile },
  { sku: 'sticker-sheet', name: 'Sticker sheet', kind: 'item', tab: 'Items', category: 'Cosmetics', price: '$0.99', icon: Sticker },
  { sku: 'table-skin', name: 'Table skin', kind: 'item', tab: 'Items', category: 'Cosmetics', price: '$3.99', icon: Palette },
  { sku: 'vip-badge', name: 'VIP badge', kind: 'item', tab: 'Items', category: 'Status', price: '$4.99', icon: Shield },
  { sku: 'champion-crown', name: 'Champion crown', kind: 'item', tab: 'Items', category: 'Status', price: '$4.99', icon: Crown },

  // Bundles
  { sku: 'starter-pack', name: 'Starter pack', kind: 'item', tab: 'Bundles', category: 'Welcome', price: '$4.99', icon: Package },
  { sku: 'weekend-bundle', name: 'Weekend bundle', kind: 'item', tab: 'Bundles', category: 'Seasonal', price: '$9.99', icon: Gift },
  { sku: 'comeback-bundle', name: 'Comeback bundle', kind: 'item', tab: 'Bundles', category: 'Retention', price: '$7.99', icon: Rocket },
  { sku: 'high-roller-bundle', name: 'High roller bundle', kind: 'item', tab: 'Bundles', category: 'Premium', price: '$49.99', icon: Trophy },
  { sku: 'daily-bundle', name: 'Daily bundle', kind: 'item', tab: 'Bundles', category: 'Seasonal', price: '$1.99', icon: Layers },

  // Lootboxes
  { sku: 'bronze-crate', name: 'Bronze crate', kind: 'item', tab: 'Lootboxes', category: 'Crates', price: '$0.99', icon: Box },
  { sku: 'silver-crate', name: 'Silver crate', kind: 'item', tab: 'Lootboxes', category: 'Crates', price: '$2.99', icon: Archive },
  { sku: 'gold-crate', name: 'Gold crate', kind: 'item', tab: 'Lootboxes', category: 'Crates', price: '$7.99', icon: PackageOpen },
  { sku: 'mystery-box', name: 'Mystery box', kind: 'item', tab: 'Lootboxes', category: 'Mystery', price: '$4.99', icon: Sparkles },
  { sku: 'battle-chest', name: 'Battle chest', kind: 'item', tab: 'Lootboxes', category: 'Events', price: '$5.99', icon: Swords },
]

// The product behind Chips, Diamonds and the XP boost, for rewards created by the rules.
export const DEFAULT_SKU: Record<Exclude<RewardKind, 'item'>, string> = {
  chips: 'chips',
  diamonds: 'diamonds',
  'xp-boost': 'xp-boost-2x',
}

export const productOf = (sku: string) => PRODUCTS.find((p) => p.sku === sku)

const DAY_7 = 6

export const isOfferedOn = (product: Product, dayIndex: number) => !product.day7Only || dayIndex === DAY_7

// Everything a day can offer, in bank order.
export const offeredOn = (dayIndex: number) => PRODUCTS.filter((p) => isOfferedOn(p, dayIndex))
