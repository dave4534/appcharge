import { Copy, Eraser, Trash2 } from 'lucide-react'
import { MenuButton } from './MenuButton'
import { DayTile } from './tiles'
import { DAYS_PER_WEEK, type Issue, type RewardWeek } from './rules'

type WeekRowProps = {
  index: number
  week: RewardWeek
  // How many of the week's seven days fall inside the date range.
  activeDays: number
  issues: Issue[]
  canDuplicate: boolean
  canDelete: boolean
  onOpenDay: (day: number) => void
  onClearDay: (day: number) => void
  onAddDay: () => void
  onMenu: (action: 'duplicate' | 'clear' | 'delete') => void
}

export function WeekRow({
  index,
  week,
  activeDays,
  issues,
  canDuplicate,
  canDelete,
  onOpenDay,
  onClearDay,
  onAddDay,
  onMenu,
}: WeekRowProps) {
  return (
    <section className="week" aria-label={`Week ${index + 1}`}>
      <header className="week-head">
        <h3>Week {index + 1}</h3>
        <MenuButton
          label={`Week ${index + 1} actions`}
          items={[
            { id: 'duplicate', label: 'Duplicate week', icon: Copy, disabled: !canDuplicate },
            { id: 'clear', label: 'Clear week', icon: Eraser, destructive: true },
            { id: 'delete', label: 'Delete week', icon: Trash2, disabled: !canDelete, destructive: true },
          ]}
          onSelect={(id) => onMenu(id as 'duplicate' | 'clear' | 'delete')}
        />
      </header>

      <div className="tiles">
        {Array.from({ length: DAYS_PER_WEEK }, (_, d) => (
          <DayTile
            key={d}
            week={index}
            day={d}
            rewards={week[d]}
            inactive={d >= activeDays}
            canAddDay={d === activeDays}
            issues={issues.filter((i) => i.day === d)}
            onOpen={() => onOpenDay(d)}
            onClear={() => onClearDay(d)}
            onAddDay={onAddDay}
          />
        ))}
      </div>
    </section>
  )
}
