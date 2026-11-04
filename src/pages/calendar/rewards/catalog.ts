import type { RewardKind } from './rules'

// The publisher's product bank: everything a manager could put in a calendar day.
// A real store would have hundreds of products. This is a small stand-in, limited to
// products that have artwork, so the prototype never shows generated visuals.
//
// The bank also holds the availability policy, which is the source of truth for what a
// day offers. The picker, the warnings, and the suggestions all read it, so
// they can never disagree. The manager only ever sees products that are available
// for the day they are editing, never a status.

export type Product = {
  sku: string
  name: string
  // Chips, Diamonds and the XP boost carry reward rules; every other product is an item.
  kind: RewardKind
  category: string
  price: string
  // The product's artwork. Chips have none here: their image depends on the amount
  // (see chipsTier in rules.ts).
  image?: string
  // Only offered on Day 7, the main reward.
  day7Only?: boolean
}

export const PRODUCTS: Product[] = [
  { sku: 'chips', name: 'Chips', kind: 'chips', category: 'Currency', price: '$0.99 per 20B' },
  { sku: 'diamonds', name: 'Diamonds', kind: 'diamonds', category: 'Currency', price: '$1.99 per 13', image: '/rewards/diamonds.png', day7Only: true },
  // The five gem currencies reuse the five chip-tier images, one each.
  { sku: 'sapphires', name: 'Sapphires', kind: 'item', category: 'Gems', price: '$0.99 per 10', image: '/rewards/chips-tier1.png' },
  { sku: 'emeralds', name: 'Emeralds', kind: 'item', category: 'Gems', price: '$0.99 per 8', image: '/rewards/chips-tier2.png' },
  { sku: 'topazes', name: 'Topazes', kind: 'item', category: 'Gems', price: '$1.99 per 10', image: '/rewards/chips-tier3.png' },
  { sku: 'amethysts', name: 'Amethysts', kind: 'item', category: 'Gems', price: '$1.99 per 8', image: '/rewards/chips-tier4.png' },
  { sku: 'rubies', name: 'Rubies', kind: 'item', category: 'Gems', price: '$2.99 per 5', image: '/rewards/chips-tier5.png' },
  { sku: 'xp-boost-2x', name: '2x XP boost', kind: 'xp-boost', category: 'Boosts', price: '$1.99 per hour', image: '/rewards/xp-boost.png', day7Only: true },
  { sku: 'champion-crown', name: 'Champion crown', kind: 'item', category: 'Trophies', price: '$4.99', image: '/rewards/day7-badge.png' },
  { sku: 'golden-chalice', name: 'Golden chalice', kind: 'item', category: 'Trophies', price: '$3.99', image: '/rewards/reserved-weekly-gift.png' },
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
