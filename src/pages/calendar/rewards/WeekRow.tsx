import { Sparkles } from 'lucide-react'
import { Button, Icon } from '../../../design-system/components'
import { MenuButton } from './MenuButton'
import { DayTile, TileBody } from './tiles'
import { DAYS_PER_WEEK, type Issue, type RewardWeek } from './rules'

type WeekRowProps = {
  index: number
  week: RewardWeek
  // How many of the week's seven days fall inside the date range.
  activeDays: number
  issues: Issue[]
  // A suggestion waiting for Accept or Reject, shown in place of the tiles.
  suggestion: { week: RewardWeek; basis: string } | null
  // True while a suggestion is pending, which pauses edits that change the layout.
  locked: boolean
  canDuplicate: boolean
  canDelete: boolean
  onOpenDay: (day: number) => void
  onClearDay: (day: number) => void
  onAddDay: () => void
  onMenu: (action: 'duplicate' | 'clear' | 'delete') => void
  onAccept: () => void
  onReject: () => void
}

export function WeekRow({
  index,
  week,
  activeDays,
  issues,
  suggestion,
  locked,
  canDuplicate,
  canDelete,
  onOpenDay,
  onClearDay,
  onAddDay,
  onMenu,
  onAccept,
  onReject,
}: WeekRowProps) {
  const days = Array.from({ length: DAYS_PER_WEEK }, (_, d) => d)

  return (
    <section className="week" aria-label={`Week ${index + 1}`}>
      <header className="week-head">
        <h3>Week {index + 1}</h3>
        {activeDays < DAYS_PER_WEEK && (
          <span className="week-note">
            {activeDays} of {DAYS_PER_WEEK} days before the end date
          </span>
        )}
        <MenuButton
          label={`Week ${index + 1} actions`}
          items={[
            { id: 'duplicate', label: 'Duplicate week', disabled: locked || !canDuplicate },
            { id: 'clear', label: 'Clear week', disabled: locked },
            { id: 'delete', label: 'Delete week', disabled: locked || !canDelete },
          ]}
          onSelect={(id) => onMenu(id as 'duplicate' | 'clear' | 'delete')}
        />
      </header>

      {suggestion ? (
        <div className="suggested">
          <div className="suggested-head">
            <span className="suggested-icon" aria-hidden="true">
              <Icon icon={Sparkles} size="Small" color="primary" />
            </span>
            <div className="suggested-text">
              <strong>Suggested week</strong>
              <span>AI suggested rewards based on {suggestion.basis}</span>
            </div>
            <div className="suggested-actions">
              <Button kind="Secondary" size="Small" onClick={onReject}>
                Reject all
              </Button>
              <Button kind="Primary" size="Small" onClick={onAccept}>
                Accept all
              </Button>
            </div>
          </div>
          <div className="tiles">
            {days.map((d) =>
              d < activeDays ? (
                <div key={d} className="tile tile--filled tile--suggested">
                  <span className="tile-main tile-main--static">
                    <TileBody day={suggestion.week[d]} dayIndex={d} />
                  </span>
                </div>
              ) : (
                <div key={d} className="tile tile--inactive">
                  <span className="tile-label">Day {d + 1}</span>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="tiles">
          {days.map((d) => (
            <DayTile
              key={d}
              week={index}
              day={d}
              rewards={week[d]}
              inactive={d >= activeDays}
              canAddDay={d === activeDays && !locked}
              issues={issues.filter((i) => i.day === d)}
              onOpen={() => onOpenDay(d)}
              onClear={() => onClearDay(d)}
              onAddDay={onAddDay}
            />
          ))}
        </div>
      )}
    </section>
  )
}
