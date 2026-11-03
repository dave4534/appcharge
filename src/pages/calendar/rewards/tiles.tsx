import { CircleAlert, Gift, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { Icon, IconButton } from '../../../design-system/components'
import {
  DAY7_BADGE_IMAGE,
  DAYS_PER_WEEK,
  REWARD_DEFS,
  formatQuantity,
  daySummary,
  orderedItems,
  rewardImage,
  type DayRewards,
  type Issue,
  type RewardItem,
} from './rules'

export function RewardIcon({ item, size = 28 }: { item: RewardItem; size?: number }) {
  const src = rewardImage(item)
  if (src) return <img className="reward-icon" src={src} width={size} height={size} alt="" />
  // A placeholder for any reward that has no art yet.
  return (
    <span className="reward-icon reward-icon--placeholder" style={{ width: size, height: size }}>
      <Gift size={Math.round(size * 0.6)} />
    </span>
  )
}

// The reward a tile names: the one that sets the chip tier, or the first.
const headline = (day: DayRewards) => day.find((i) => i.kind === 'chips') ?? orderedItems(day)[0]

// A tile's artwork and text. Several rewards show as "Multiple" with overlapping icons.
export function TileBody({ day, dayIndex }: { day: DayRewards; dayIndex: number }) {
  const items = orderedItems(day)
  const lead = headline(day)
  const multiple = items.length > 1
  const isDay7 = dayIndex === DAYS_PER_WEEK - 1

  return (
    <>
      <span className="tile-label">
        Day {dayIndex + 1}
        {isDay7 && <img className="tile-crown" src={DAY7_BADGE_IMAGE} width={18} height={18} alt="Main reward" />}
      </span>
      <span className={`tile-art${multiple ? ' tile-art--multiple' : ''}`}>
        {items.slice(0, 3).map((item) => (
          <RewardIcon key={item.kind} item={item} size={multiple ? 26 : 30} />
        ))}
      </span>
      <span className="tile-name">{multiple ? 'Multiple' : REWARD_DEFS[lead.kind].name}</span>
      <span className="tile-qty">
        x{formatQuantity(lead)}
        {multiple && <span className="tile-more"> +{items.length - 1}</span>}
      </span>
    </>
  )
}

type DayTileProps = {
  week: number
  day: number
  rewards: DayRewards
  inactive: boolean
  // The first inactive day offers to extend the calendar by one day.
  canAddDay: boolean
  issues: Issue[]
  onOpen: () => void
  onClear: () => void
  onAddDay: () => void
}

export function DayTile({ week, day, rewards, inactive, canAddDay, issues, onOpen, onClear, onAddDay }: DayTileProps) {
  const where = `Week ${week + 1}, Day ${day + 1}`

  if (inactive) {
    return (
      <div className="tile tile--inactive" title="After the end date">
        <span className="tile-label">Day {day + 1}</span>
        {canAddDay && (
          <button type="button" className="tile-add-day" onClick={onAddDay} aria-label={`Add a day: extends the end date to include ${where}`}>
            <Plus size={14} /> Add day
          </button>
        )}
      </div>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="tile tile--empty">
        <button type="button" className="tile-main" onClick={onOpen} aria-label={`Add reward to ${where}`}>
          <span className="tile-label">Day {day + 1}</span>
          <span className="tile-cta">+ Reward</span>
        </button>
      </div>
    )
  }

  const worst = issues.some((i) => i.severity === 'error') ? 'error' : issues.length > 0 ? 'warning' : null

  return (
    <div className={`tile tile--filled${worst ? ` tile--${worst}` : ''}`}>
      <button
        type="button"
        className="tile-main"
        onClick={onOpen}
        aria-label={`${where}: ${daySummary(rewards)}. Edit reward`}
        title={daySummary(rewards)}
      >
        <TileBody day={rewards} dayIndex={day} />
      </button>
      {worst && (
        <span className="tile-flag" title={issues.map((i) => i.message).join('\n')}>
          <Icon icon={worst === 'error' ? CircleAlert : TriangleAlert} size={14} color={worst === 'error' ? 'negative' : 'warning'} label={`${issues.length} to review`} />
        </span>
      )}
      <IconButton
        kind="Tertiary"
        size="XXS"
        className="tile-delete"
        aria-label={`Clear reward for ${where}`}
        iconElement={<Icon icon={Trash2} size={12} color="on-primary" />}
        onClick={onClear}
      />
    </div>
  )
}
