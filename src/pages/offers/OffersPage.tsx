import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { ActionDialog } from '@/components/ActionDialog'
import { SlackIcon } from '@/components/SlackIcon'
import { ButtonGroup, Dropdown, EmptyState, Search } from '../../design-system/components'
import { NewOfferMenu } from './NewOfferMenu'
import { ListView } from './ListView'
import { TimelineView } from './TimelineView'
import { statusLabels, typeLabels, type Offer, type OfferStatus, type OfferType } from './data'
import './offers.css'

type View = 'list' | 'timeline'
type SortKey = 'priority' | 'start' | 'audience'
type TypeFilter = OfferType | 'all'
type StatusFilter = OfferStatus | 'all'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'start', label: 'Start date' },
  { value: 'audience', label: 'Audience' },
]
const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All offers' },
  ...(Object.keys(typeLabels) as OfferType[]).map((t) => ({ value: t, label: typeLabels[t].plural })),
]
const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(statusLabels) as OfferStatus[]).map((s) => ({ value: s, label: statusLabels[s] })),
]
type OffersPageProps = {
  // Every offer, in priority order.
  offers: Offer[]
  onChange: (offers: Offer[]) => void
  onNew: () => void
  onOpen: (id: string) => void
  onNotify: (message: string, description?: string) => void
}

type ToolbarSelectProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  width?: number
}

// A design system Dropdown with its name beside it, so each filter reads "Sort  Priority".
function ToolbarSelect({ label, value, options, onChange, width }: ToolbarSelectProps) {
  return (
    <div className="tool" style={width ? ({ '--tool-width': `${width}px` } as CSSProperties) : undefined}>
      <span className="tool-label">{label}</span>
      <Dropdown size="Medium" aria-label={label} value={value} options={options} onChange={onChange} />
    </div>
  )
}

export function OffersPage({ offers, onChange, onNew, onOpen, onNotify }: OffersPageProps) {
  const offersById = useMemo(() => new Map(offers.map((o) => [o.id, o])), [offers])
  const order = useMemo(() => offers.map((o) => o.id), [offers])
  const audienceOptions = useMemo(
    () => [
      { value: 'all', label: 'All' },
      ...[...new Set(offers.map((o) => o.audience))].map((a) => ({ value: a, label: a })),
    ],
    [offers],
  )
  const [view, setView] = useState<View>('list')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('priority')
  const [type, setType] = useState<TypeFilter>('reward-calendar')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [audience, setAudience] = useState('all')
  // The offer the user asked to delete, waiting for confirmation.
  const [deleting, setDeleting] = useState<Offer | null>(null)

  // Priority is ranked within each offer type, so every type starts at 1.
  const priorityOf = (id: string) => {
    const offerType = offersById.get(id)!.type
    return order.filter((x) => offersById.get(x)!.type === offerType).indexOf(id) + 1
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = order
      .map((id) => offersById.get(id)!)
      .filter(
        (o) =>
          (type === 'all' || o.type === type) &&
          (status === 'all' || o.status === status) &&
          (audience === 'all' || o.audience === audience) &&
          (!q || o.name.toLowerCase().includes(q)),
      )
    if (sort === 'audience') return matches.sort((a, b) => a.audience.localeCompare(b.audience))
    // Offers without dates sort last.
    if (sort === 'start') return matches.sort((a, b) => (a.start ?? '9999').localeCompare(b.start ?? '9999'))
    return matches
  }, [order, offersById, query, sort, type, status, audience])

  // Dragging a row only reshuffles the visible offers among their own priority
  // slots, so hidden offers keep the numbers they already have.
  const move = (id: string, targetId: string, after: boolean) => {
    const ids = visible.map((o) => o.id).filter((x) => x !== id)
    const at = ids.indexOf(targetId)
    ids.splice(after ? at + 1 : at, 0, id)
    const shown = new Set(ids)
    const slots = order.flatMap((x, i) => (shown.has(x) ? [i] : []))
    const next = [...order]
    slots.forEach((slot, k) => {
      next[slot] = ids[k]
    })
    onChange(next.map((x) => offersById.get(x)!))
  }

  const canReorder = sort === 'priority'
  const noun = type === 'all' ? 'offers' : typeLabels[type][visible.length === 1 ? 'singular' : 'plural'].toLowerCase()

  const clearFilters = () => {
    setQuery('')
    setType('all')
    setStatus('all')
    setAudience('all')
  }

  const viewProps = { offers: visible, priorityOf, canReorder, onMove: move, onOpen, onDelete: setDeleting }

  const confirmDelete = (offer: Offer) => {
    onChange(offers.filter((o) => o.id !== offer.id))
    setDeleting(null)
    onNotify(`${offer.name} deleted`)
  }

  // A live offer has players on it, so deleting it needs a manager to approve.
  const requestCancellation = (offer: Offer) => {
    setDeleting(null)
    onNotify('Cancellation request submitted', `Your manager can approve deleting ${offer.name} in Slack.`)
  }

  return (
    <div className="offers">
      <header className="offers-head">
        <div>
          <h1>Offers</h1>
          <p className="offers-sub">
            Popup offers players see in your web store. Sorted by priority: the lowest number shows first.
          </p>
        </div>
        <NewOfferMenu onNewCalendar={onNew} />
      </header>

      <div className="toolbar">
        <Search
          size="Medium"
          className="toolbar-search"
          placeholder="Search offers"
          aria-label="Search offers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
        />
        <ToolbarSelect label="Sort" width={134} value={sort} options={sortOptions} onChange={(v) => setSort(v as SortKey)} />
        <ToolbarSelect label="Type" width={216} value={type} options={typeOptions} onChange={(v) => setType(v as TypeFilter)} />
        <ToolbarSelect label="Status" width={104} value={status} options={statusOptions} onChange={(v) => setStatus(v as StatusFilter)} />
        <ToolbarSelect label="Audience" width={138} value={audience} options={audienceOptions} onChange={setAudience} />

        <ButtonGroup
          className="view-toggle"
          size="Medium"
          aria-label="View"
          items={[
            { label: 'List', value: 'list' },
            { label: 'Timeline', value: 'timeline' },
          ]}
          value={view}
          onChange={(v) => setView(v as View)}
        />
      </div>

      <div className="section-line">
        <h2>Popup offers</h2>
      </div>
      <p className="section-count">
        {visible.length} {noun}
        {view === 'list' && !canReorder && ' · Sort by priority to reorder'}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          variant="compact"
          title="No offers match these filters"
          description="Try changing or clearing a filter."
          mainAction={{ label: 'Clear filters', onClick: clearFilters }}
        />
      ) : view === 'list' ? (
        <ListView {...viewProps} />
      ) : (
        <TimelineView {...viewProps} />
      )}

      {visible.length > 0 && view === 'timeline' && (
        <p className="footnote">
          Bars are colored by status. The timeline shows each offer&apos;s start and end date and repeats.
          {!canReorder && ' Sort by priority to reorder.'}
        </p>
      )}

      {deleting && (
        <ActionDialog
          size="sm"
          title={`Delete ${deleting.name}?`}
          description={
            deleting.status === 'live'
              ? `${deleting.name} is live, so players are on it. To delete a live ${typeLabels[deleting.type].singular.toLowerCase()}, you need a manager's approval.`
              : `This removes ${deleting.name}${deleting.rewards ? ' and its rewards' : ''}. You can't undo this.`
          }
          onClose={() => setDeleting(null)}
          secondaryAction={{ label: 'Cancel', onClick: () => setDeleting(null) }}
          primaryAction={
            deleting.status === 'live'
              ? {
                  label: (
                    <>
                      <SlackIcon />
                      Submit Cancellation Request
                      <ArrowUpRight />
                    </>
                  ),
                  destructive: true,
                  onClick: () => requestCancellation(deleting),
                }
              : { label: 'Delete', destructive: true, onClick: () => confirmDelete(deleting) }
          }
        />
      )}
    </div>
  )
}
