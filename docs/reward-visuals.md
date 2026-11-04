# Reward visuals: logic and what is needed

For anyone finding artwork for the Reward Calendar prototype. Read this first, then the files in the table below.

## Where the logic lives

| File | What it decides |
|------|-----------------|
| `src/pages/calendar/rewards/catalog.ts` | **The product bank.** Every product a manager can put in a calendar, which tab it sits in, and which days offer it. |
| `src/pages/calendar/rewards/rules.ts` | Reward rules (amounts, week-to-week growth, suggestions) and **`rewardImage()`**, which picks the image for a reward. |
| `src/pages/calendar/rewards/tiles.tsx` | `RewardIcon`, which shows the image, or the product's icon when there is no image yet. |
| `Reward Spec.md` (the Appcharge folder) | The written spec the rules follow. Amounts are illustrative. |

## The one rule for artwork

`rewardImage()` in `rules.ts` is the only place that chooses an image:

- **Chips:** picked by the amount, one of five tier images: under 1B, 1B to 1.5B, 1.5B to 2B, 2B to 3B, 3B and up. These are `chips-tier1.png` to `chips-tier5.png`.
- **Diamonds** and the **2x XP boost:** one fixed image each (`diamonds.png`, `xp-boost.png`).
- **Every other product:** `public/rewards/<sku>.png`. The file name is the product's SKU from `catalog.ts`.
- If a file is missing, the screens show a Lucide icon on a tinted square, so nothing breaks while art is missing.

Art does **not** depend on the day, the week or the quantity (except chips tiers). One image per product is enough.

## How many images are needed

- Products in the bank: **24**
- Products that already have art: **3** (Chips with 5 tier images, Diamonds, 2x XP boost)
- Products that still need one image each: **21**
- Also in use: `public/rewards/day7-badge.png` (the crown on Day 7 tiles). Not tied to a product.

**Extrapolating:** the number of images needed equals the number of products in `catalog.ts` without a file in `public/rewards/`, plus one more for every new product added to the bank. Chips always take five. Nothing else is multiplied by days or weeks.

To list what is missing, run this from the project folder:

```bash
for sku in $(grep -o "sku: '[^']*'" src/pages/calendar/rewards/catalog.ts | cut -d"'" -f2); do
  [ -f "public/rewards/$sku.png" ] || echo "missing: $sku"
done
```

(Chips, Diamonds and the XP boost use their own file names, so they show as missing in that list even though they have art.)

## Image specification

- PNG with a transparent background, a cut-out symbol with no frame or shadow.
- Roughly square. The existing art is 60 to 120 px on a side. Larger (256 px or more) is better, because the images are only ever drawn small.
- Drawn at about 26 to 36 px in the editor tiles, the picker and the preview, and 34 px on Day 7. It must read clearly at that size, so keep one simple, bold shape.
- Same look as the existing art: glossy, jewel-like game symbols. The current set is from a third-party demo and is for the private prototype only.
- Save as `public/rewards/<sku>.png`.

## Products that need an image

| Product | SKU | Tab | Offered |
|---------|-----|-----|---------|
| Star points | `star-points` | Virtual currencies | Any day |
| Spin tokens | `spin-tokens` | Virtual currencies | Any day |
| Event tokens | `event-tokens` | Virtual currencies | Any day |
| Lucky charm | `lucky-charm` | Items | Any day |
| Power spark | `power-spark` | Items | Any day |
| Gold avatar frame | `avatar-frame-gold` | Items | Any day |
| Emote pack | `emote-pack` | Items | Any day |
| Sticker sheet | `sticker-sheet` | Items | Any day |
| Table skin | `table-skin` | Items | Any day |
| VIP badge | `vip-badge` | Items | Any day |
| Champion crown | `champion-crown` | Items | Any day |
| Starter pack | `starter-pack` | Bundles | Any day |
| Weekend bundle | `weekend-bundle` | Bundles | Any day |
| Comeback bundle | `comeback-bundle` | Bundles | Any day |
| High roller bundle | `high-roller-bundle` | Bundles | Any day |
| Daily bundle | `daily-bundle` | Bundles | Any day |
| Bronze crate | `bronze-crate` | Lootboxes | Any day |
| Silver crate | `silver-crate` | Lootboxes | Any day |
| Gold crate | `gold-crate` | Lootboxes | Any day |
| Mystery box | `mystery-box` | Lootboxes | Any day |
| Battle chest | `battle-chest` | Lootboxes | Any day |

## Full bank

| Product | SKU | Tab | Offered | Art | File |
|---------|-----|-----|---------|-----|------|
| Chips | `chips` | Virtual currencies | Any day | Has art | 5 chip tier images (chips-tier1.png to chips-tier5.png) |
| Diamonds | `diamonds` | Virtual currencies | Day 7 only | Has art | public/rewards/diamonds.png |
| Star points | `star-points` | Virtual currencies | Any day | Needs art | public/rewards/star-points.png |
| Spin tokens | `spin-tokens` | Virtual currencies | Any day | Needs art | public/rewards/spin-tokens.png |
| Event tokens | `event-tokens` | Virtual currencies | Any day | Needs art | public/rewards/event-tokens.png |
| 2x XP boost | `xp-boost-2x` | Items | Day 7 only | Has art | public/rewards/xp-boost.png |
| Lucky charm | `lucky-charm` | Items | Any day | Needs art | public/rewards/lucky-charm.png |
| Power spark | `power-spark` | Items | Any day | Needs art | public/rewards/power-spark.png |
| Gold avatar frame | `avatar-frame-gold` | Items | Any day | Needs art | public/rewards/avatar-frame-gold.png |
| Emote pack | `emote-pack` | Items | Any day | Needs art | public/rewards/emote-pack.png |
| Sticker sheet | `sticker-sheet` | Items | Any day | Needs art | public/rewards/sticker-sheet.png |
| Table skin | `table-skin` | Items | Any day | Needs art | public/rewards/table-skin.png |
| VIP badge | `vip-badge` | Items | Any day | Needs art | public/rewards/vip-badge.png |
| Champion crown | `champion-crown` | Items | Any day | Needs art | public/rewards/champion-crown.png |
| Starter pack | `starter-pack` | Bundles | Any day | Needs art | public/rewards/starter-pack.png |
| Weekend bundle | `weekend-bundle` | Bundles | Any day | Needs art | public/rewards/weekend-bundle.png |
| Comeback bundle | `comeback-bundle` | Bundles | Any day | Needs art | public/rewards/comeback-bundle.png |
| High roller bundle | `high-roller-bundle` | Bundles | Any day | Needs art | public/rewards/high-roller-bundle.png |
| Daily bundle | `daily-bundle` | Bundles | Any day | Needs art | public/rewards/daily-bundle.png |
| Bronze crate | `bronze-crate` | Lootboxes | Any day | Needs art | public/rewards/bronze-crate.png |
| Silver crate | `silver-crate` | Lootboxes | Any day | Needs art | public/rewards/silver-crate.png |
| Gold crate | `gold-crate` | Lootboxes | Any day | Needs art | public/rewards/gold-crate.png |
| Mystery box | `mystery-box` | Lootboxes | Any day | Needs art | public/rewards/mystery-box.png |
| Battle chest | `battle-chest` | Lootboxes | Any day | Needs art | public/rewards/battle-chest.png |

## Availability rules that affect what a day shows

- Only **Day 7** offers Diamonds and the 2x XP boost. Days 1 to 6 offer everything else.
- Every day offers at least four products in every tab of the bank. Keep it that way when adding products.
- The picker lists only what a day can offer. Managers never see a status such as "reserved".
