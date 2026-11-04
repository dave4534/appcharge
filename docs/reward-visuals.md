# Reward visuals: logic and coverage

For anyone working on the artwork for the Reward Calendar prototype. Every product in the bank has artwork today, so nothing is missing. This explains how that works, so new products can be added without generating visuals.

## Where the logic lives

| File | What it decides |
|------|-----------------|
| `src/pages/calendar/rewards/catalog.ts` | **The product bank.** Every product a manager can put in a calendar, its image, and which days offer it. |
| `src/pages/calendar/rewards/rules.ts` | Reward rules (amounts, week-to-week growth, suggestions) and **`rewardImage()`**, which picks the image for a reward. |
| `src/pages/calendar/rewards/tiles.tsx` | `RewardIcon`, which draws the image. |
| `Reward Spec.md` (the Appcharge folder) | The written spec the rules follow. Amounts are illustrative. |

## The one rule for artwork

`rewardImage()` in `rules.ts` is the only place that chooses an image:

- **Chips:** picked by the amount, one of five images: under 1B, 1B to 1.5B, 1.5B to 2B, 2B to 3B, 3B and up (`chips-tier1.png` to `chips-tier5.png`).
- **Every other product:** the `image` set on the product in `catalog.ts`.
- A product with no image would show a plain grey square. There are none now.

Art does not depend on the day, the week or the quantity, except the chips tiers.

## Coverage: 10 products, all with art

| Product | SKU | Category | Offered | Image |
|---------|-----|----------|---------|-------|
| Chips | `chips` | Currency | Any day | `chips-tier1.png` to `chips-tier5.png`, by amount |
| Diamonds | `diamonds` | Currency | Day 7 only | `diamonds.png` |
| Sapphires | `sapphires` | Gems | Any day | `chips-tier1.png` |
| Emeralds | `emeralds` | Gems | Any day | `chips-tier2.png` |
| Topazes | `topazes` | Gems | Any day | `chips-tier3.png` |
| Amethysts | `amethysts` | Gems | Any day | `chips-tier4.png` |
| Rubies | `rubies` | Gems | Any day | `chips-tier5.png` |
| 2x XP boost | `xp-boost-2x` | Boosts | Day 7 only | `xp-boost.png` |
| Champion crown | `champion-crown` | Trophies | Any day | `day7-badge.png` |
| Golden chalice | `golden-chalice` | Trophies | Any day | `reserved-weekly-gift.png` |

Five gem currencies and the two trophies reuse images that were supplied for other rewards, so the same picture can stand for two products (for example, Chips at 1B to 1.5B and Emeralds). Their names tell them apart on every tile.

Files live in `public/rewards/`. `day7-badge.png` is also the crown shown on Day 7 tiles.

## If more art arrives

- A product that should have its own picture: save `public/rewards/<sku>.png` and set `image: '/rewards/<sku>.png'` on that product in `catalog.ts`.
- A new product: add one entry to `PRODUCTS` in `catalog.ts` with its image. One image per product is enough.
- Image spec: PNG with a transparent background, a cut-out symbol with no frame or shadow, roughly square (the current art is 60 to 120 px; 256 px or more is better). It is drawn at about 26 to 36 px, so keep one bold shape in the same glossy style. The current set is from a third-party demo and is for the private prototype only.

## Availability rules that affect what a day shows

- Only **Day 7** offers Diamonds and the 2x XP boost. Days 1 to 6 offer the other eight products. Day 7 offers all ten.
- Every day offers at least four products. Keep it that way when adding or removing products.
- The picker lists only what a day can offer. Managers never see a status such as "reserved".
