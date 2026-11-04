import { GripVertical, InfoIcon, TriangleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { statusLabels, type OfferStatus } from '../offers/data'
import { useReorder } from '../offers/useReorder'
import { Card } from './fields'

export type PriorityItem = {
  id: string
  name: string
  status: OfferStatus
  audience: string
  dates: string
  // The calendar being edited.
  self: boolean
  // Runs at the same time as the calendar being edited, for an overlapping audience.
  overlapsSelf: boolean
}

type PrioritySectionProps = {
  items: PriorityItem[]
  live: boolean
  onChange: (ids: string[]) => void
}

const names = (items: PriorityItem[]) => items.map((i) => i.name).join(', ')

// The order of every reward calendar. Players see the one highest in the list first,
// so the order decides who sees what, and it is spelled out here before it is changed.
export function PrioritySection({ items, live, onChange }: PrioritySectionProps) {
  const ids = items.map((i) => i.id)
  const move = (id: string, targetId: string, after: boolean) => {
    const rest = ids.filter((x) => x !== id)
    const at = rest.indexOf(targetId)
    rest.splice(after ? at + 1 : at, 0, id)
    onChange(rest)
  }
  const reorder = useReorder(ids, true, move)

  const selfIndex = items.findIndex((i) => i.self)
  const above = items.slice(0, selfIndex).filter((i) => i.overlapsSelf)
  const below = items.slice(selfIndex + 1).filter((i) => i.overlapsSelf)

  let impact: string
  if (above.length > 0) {
    impact = `${names(above)} ${above.length === 1 ? 'runs' : 'run'} at the same time and rank${above.length === 1 ? 's' : ''} above this calendar. Players in both audiences see ${above.length === 1 ? 'it' : 'them'} first, so this calendar can be hidden from them.`
  } else if (below.length > 0) {
    impact = `This calendar ranks above ${names(below)}. Players in both audiences see this one first, and ${below.length === 1 ? 'that calendar waits' : 'those calendars wait'} until it ends or they have collected.`
  } else {
    impact = 'No other calendar runs at the same time for an overlapping audience, so the order has no effect right now. It matters as soon as dates or audiences overlap.'
  }

  return (
    <Card title="Priority" hint="Which calendar players see first when they qualify for more than one.">
      <Alert>
        <InfoIcon />
        <AlertTitle>How priority works</AlertTitle>
        <AlertDescription>
          A player sees one calendar at a time. If they qualify for several, the one highest in this list shows first, and the
          ones below it wait until it ends or the player has collected. Drag a calendar to change its place.
        </AlertDescription>
      </Alert>

      <ol className="grid gap-2" aria-label="Calendar priority, highest first">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${item.self ? 'border-primary bg-primary/5' : 'bg-card'} ${reorder.rowClass(item.id)}`}
            {...reorder.rowProps(item.id)}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              className="cursor-grab"
              aria-label={`Reorder ${item.name}. Use the up and down arrow keys.`}
              {...reorder.handleProps(item.id)}
            >
              <GripVertical />
            </Button>
            <Badge variant="outline" className="size-6 justify-center rounded-full px-0" title={`Priority ${index + 1}`}>
              {index + 1}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {item.name}
                {item.self && <span className="ml-2 text-xs font-normal text-primary">This calendar</span>}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {item.audience} · {item.dates}
              </div>
            </div>
            <Badge variant={item.status === 'live' ? 'success' : item.status === 'scheduled' ? 'default' : 'outline'}>
              {statusLabels[item.status]}
            </Badge>
          </li>
        ))}
      </ol>

      <Alert className="border-[var(--content-color-working-orange)]">
        <TriangleAlertIcon style={{ color: 'var(--content-color-working-orange-hover)' }} />
        <AlertTitle>Risk of changing the order</AlertTitle>
        <AlertDescription>
          {impact}
          {live && ' This calendar is live, so a change to the order reaches players as soon as you save.'}
        </AlertDescription>
      </Alert>
    </Card>
  )
}
