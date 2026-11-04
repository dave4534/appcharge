import { useLayoutEffect, useRef } from 'react'
import { Repeat } from 'lucide-react'
import { audienceLabel, typeLabels, type Offer } from './data'
import { formatDay } from './dates'
import { KebabButton, OfferTitle, PriorityBadge, ReadinessCell, StatusPill } from './parts'
import { isOpenable, rowClick } from './rows'

type ListViewProps = {
  offers: Offer[]
  priorityOf: (id: string) => number
  onOpen: (id: string) => void
  onDelete: (offer: Offer) => void
  // Every offer, whatever the filters hide, so overlaps are found against all of them.
  allOffers: Offer[]
}

export function ListView({ offers, priorityOf, onOpen, onDelete, allOffers }: ListViewProps) {
  const rows = useRef<HTMLUListElement>(null)
  const list = useRef<HTMLDivElement>(null)

  // The rows scroll on their own. Measure the scrollbar so the cards can give up that much
  // padding and still line up with the rest of the page.
  useLayoutEffect(() => {
    const el = rows.current
    if (!el) return
    const measure = () => list.current?.style.setProperty('--scrollbar', `${el.offsetWidth - el.clientWidth}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [offers.length])

  return (
    <div className="list" ref={list}>
      <div className="list-grid list-head" aria-hidden="true">
        <span className="col-audience">Audience</span>
        <span className="col-dates">Start and end</span>
        <span className="col-readiness">Readiness</span>
        <span className="col-status">Status</span>
      </div>

      <ul className="list-rows" ref={rows}>
        {offers.map((offer) => (
          <li
            key={offer.id}
            className={`list-grid list-row${isOpenable(offer) ? ' is-openable' : ''} `}
            onClick={rowClick(offer, onOpen)}
          >
            <PriorityBadge priority={priorityOf(offer.id)} />
            <div className="offer-name">
              <OfferTitle offer={offer} onOpen={onOpen} />
              <div className="offer-type">{typeLabels[offer.type].singular}</div>
            </div>
            <div className="col-audience">{audienceLabel(offer)}</div>
            <div className="col-dates">
              {offer.start && offer.end ? (
                <>
                  {formatDay(offer.start)} to {formatDay(offer.end)}
                  {offer.repeatWeeks && (
                    <span className="repeat" title={`Repeats every ${offer.repeatWeeks} weeks`}>
                      <Repeat className="size-4" />
                    </span>
                  )}
                </>
              ) : (
                <span className="muted">No dates yet</span>
              )}
            </div>
            <div className="col-readiness">
              <ReadinessCell offer={offer} offers={allOffers} />
            </div>
            <div className="col-status">
              <StatusPill status={offer.status} />
            </div>
            <KebabButton offer={offer} onEdit={onOpen} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </div>
  )
}
