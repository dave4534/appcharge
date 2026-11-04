import { Check, ChevronLeft, ChevronRight, Gift, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Icon, IconButton } from '../../../design-system/components'
import { RewardIcon } from './tiles'
import {
  DAY7_BADGE_IMAGE,
  DAYS_PER_WEEK,
  dayNumber,
  itemName,
  formatQuantity,
  orderedItems,
  type DayRewards,
  type RewardWeek,
} from './rules'

export type Device = 'desktop' | 'mobile'

type PreviewPanelProps = {
  plan: RewardWeek[]
  weekCount: number
  week: number
  device: Device
  onWeekChange: (week: number) => void
}

// What a player has done so far in the preview. Week 1 shows a collected day, a day
// ready to collect and locked days, the same states players see in the store. A day
// with no reward has no state: the preview never shows a day the calendar leaves empty.
type PlayerState = 'collected' | 'ready' | 'locked' | 'empty'
const playerState = (week: number, day: number, filled: boolean): PlayerState =>
  !filled ? 'empty' : week === 0 && day === 0 ? 'collected' : week === 0 && day === 1 ? 'ready' : 'locked'

const pad = (n: number) => String(n).padStart(2, '0')

// A countdown that ticks, so the preview feels like the store.
function useCountdown(startSeconds: number) {
  const [left, setLeft] = useState(startSeconds)
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : startSeconds)), 1000)
    return () => clearInterval(t)
  }, [startSeconds])
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`
}

function PlayerTile({ rewards, week, day, state }: { rewards: DayRewards; week: number; day: number; state: PlayerState }) {
  const items = orderedItems(rewards)
  const lead = rewards.find((i) => i.kind === 'chips') ?? items[0]
  const isDay7 = day === DAYS_PER_WEEK - 1

  return (
    <div className={`pv-tile pv-tile--${state}${isDay7 ? ' pv-tile--wide' : ''}${items.length === 0 ? ' pv-tile--empty' : ''}`}>
      <span className="pv-day">
        {isDay7 && <img src={DAY7_BADGE_IMAGE} width={16} height={16} alt="" />}
        Day {dayNumber(week, day)}
      </span>
      {state === 'collected' && (
        <span className="pv-badge pv-badge--done" aria-label="Collected">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      {state === 'locked' && (
        <span className="pv-badge" aria-label="Locked">
          <Lock size={14} />
        </span>
      )}
      {items.length > 0 && (
        <>
          <span className="pv-art">
            {items.slice(0, 3).map((item) => (
              <RewardIcon key={item.kind} item={item} size={isDay7 ? 34 : 26} />
            ))}
          </span>
          <span className="pv-qty">
            {isDay7 ? 'Main reward' : items.length > 1 ? 'Multiple' : itemName(lead)}
            {!isDay7 && <strong> x{formatQuantity(lead)}</strong>}
          </span>
          {isDay7 && (
            <span className="pv-lines">
              {items.map((i) => `${formatQuantity(i)} ${itemName(i).toLowerCase()}`).join(' · ')}
            </span>
          )}
        </>
      )}
    </div>
  )
}

export function PreviewPanel({ plan, weekCount, week, device, onWeekChange }: PreviewPanelProps) {
  const countdown = useCountdown(12 * 3600 + 34 * 60 + 10)
  const rewards = plan[week] ?? []
  const blank = rewards.every((d) => d.length === 0)
  // Only a week with a day ready to collect has something to collect.
  const canCollect = Array.from({ length: DAYS_PER_WEEK }, (_, d) => playerState(week, d, (rewards[d] ?? []).length > 0)).includes('ready')

  return (
    <aside className="preview" aria-label="Player preview">
      <header className="preview-head">
        <IconButton
          kind="Secondary"
          size="XS"
          aria-label="Previous week"
          disabled={week === 0}
          iconElement={<Icon icon={ChevronLeft} size="Small" color="current" />}
          onClick={() => onWeekChange(week - 1)}
        />
        <span className="preview-week">Week {week + 1}</span>
        <IconButton
          kind="Secondary"
          size="XS"
          aria-label="Next week"
          disabled={week >= weekCount - 1}
          iconElement={<Icon icon={ChevronRight} size="Small" color="current" />}
          onClick={() => onWeekChange(week + 1)}
        />
      </header>

      <div className="pv-stage">
      <div className={`pv-browser pv-browser--${device}`}>
        <div className="pv-chrome">
          <span />
          <span />
          <span />
          <div className="pv-url">store.yourgame.com</div>
        </div>
        <nav className="pv-nav" aria-label="Store preview">
          <span className="pv-logo" />
          <span>Featured</span>
          <span>Bundles</span>
          <span>Offers</span>
          <span className="pv-coins">
            <Gift size={12} aria-hidden="true" />
            1,250
          </span>
        </nav>

        <div className={`pv-card${blank ? ' pv-card--blank' : ''}`}>
          <div className="pv-card-head">
            <h3>Daily Rewards</h3>
            <span>
              Next reward in <strong>{countdown}</strong>
            </span>
          </div>
          <div className="pv-grid">
            {Array.from({ length: DAYS_PER_WEEK }, (_, d) => (
              <PlayerTile key={d} rewards={rewards[d] ?? []} week={week} day={d} state={playerState(week, d, (rewards[d] ?? []).length > 0)} />
            ))}
          </div>
          <button type="button" className="pv-collect" disabled={!canCollect}>
            Collect
          </button>
          {blank && <p className="pv-hint">Add rewards to see them here</p>}
        </div>

        <div className="pv-offers" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pv-offer">
              <span />
              <span />
            </div>
          ))}
        </div>
      </div>
      </div>
    </aside>
  )
}
