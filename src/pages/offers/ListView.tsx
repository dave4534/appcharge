import { Icon } from '../../components/Icon'
import { audienceLabel, typeLabels, type Offer } from './data'
import { formatDay } from './dates'
import { DragHandle, KebabButton, PriorityBadge, StatusPill } from './parts'
import { useReorder } from './useReorder'

type ListViewProps = {
  offers: Offer[]
  priorityOf: (id: string) => number
  canReorder: boolean
  onMove: (id: string, targetId: string, after: boolean) => void
}

export function ListView({ offers, priorityOf, canReorder, onMove }: ListViewProps) {
  const reorder = useReorder(
    offers.map((o) => o.id),
    canReorder,
    onMove,
  )

  return (
    <div className="list">
      <div className="list-grid list-head" aria-hidden="true">
        <span className="col-audience">Audience</span>
        <span className="col-dates">Start and end</span>
        <span className="col-status">Status</span>
      </div>

      <ul className="list-rows">
        {offers.map((offer) => (
          <li key={offer.id} className={`list-grid list-row ${reorder.rowClass(offer.id)}`} {...reorder.rowProps(offer.id)}>
            <DragHandle offer={offer} {...reorder.handleProps(offer.id)} />
            <PriorityBadge priority={priorityOf(offer.id)} />
            <div className="offer-name">
              <div className="offer-title">{offer.name}</div>
              <div className="offer-type">{typeLabels[offer.type].singular}</div>
            </div>
            <div className="col-audience">{audienceLabel(offer)}</div>
            <div className="col-dates">
              {offer.start && offer.end ? (
                <>
                  {formatDay(offer.start)} to {formatDay(offer.end)}
                  {offer.repeatWeeks && (
                    <span className="repeat" title={`Repeats every ${offer.repeatWeeks} weeks`}>
                      <Icon name="repeat" size={14} />
                    </span>
                  )}
                </>
              ) : (
                <span className="muted">No dates yet</span>
              )}
            </div>
            <div className="col-status">
              <StatusPill status={offer.status} />
            </div>
            <KebabButton offer={offer} />
          </li>
        ))}
      </ul>
    </div>
  )
}
