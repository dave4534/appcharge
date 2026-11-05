import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ToastAlert } from './components/ToastAlert'
import { ToastHost } from './components/ToastHost'
import { TopBar } from './components/TopBar'
import { Walkthrough } from './components/walkthrough/Walkthrough'
import { demoVersions, placeTargets, type EditorScene, type PlaceId } from './components/walkthrough/places'
import { navSections } from './components/nav'
import { CalendarEditor } from './pages/calendar/CalendarEditor'
import { initialOffers, type Offer } from './pages/offers/data'
import { OffersPage } from './pages/offers/OffersPage'
import { McpDialog } from './components/McpDialog'

const sectionOf = (id: string) => navSections.find((s) => s.items.some((i) => i.id === id))!
const labelOf = (id: string) => sectionOf(id).items.find((i) => i.id === id)!.label

// null: the offers list. { offerId: null }: a new calendar. { offerId }: a saved draft.
// `scene` and `nonce` are set when the walkthrough opens a place: the nonce makes the editor start fresh.
type Editing = { offerId: string | null; scene?: EditorScene; nonce?: number } | null

export default function App() {
  const [activeId, setActiveId] = useState('reward-calendars')
  // Every load and refresh opens on the empty state: offers live only as long as the page is
  // open and are not restored next time. ?demo starts from the sample calendars instead.
  const [offers, setOffers] = useState<Offer[]>(() =>
    new URLSearchParams(window.location.search).has('demo') ? initialOffers : [],
  )
  const [editing, setEditing] = useState<Editing>(null)
  const [notice, setNotice] = useState<{ message: string; description?: string } | null>(null)
  const [mcpOpen, setMcpOpen] = useState(false)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])

  // A new draft joins the end of the list, so it gets the lowest priority, unless the
  // user already placed it among the other calendars (`rank` counts calendars only).
  const saveOffer = (offer: Offer, rank?: number) =>
    setOffers((all) => {
      if (all.some((o) => o.id === offer.id)) return all.map((o) => (o.id === offer.id ? offer : o))
      const calendars = all.filter((o) => o.type === 'reward-calendar')
      const before = rank !== undefined && rank < calendars.length ? all.indexOf(calendars[rank]) : -1
      return before < 0 ? [...all, offer] : [...all.slice(0, before), offer, ...all.slice(before)]
    })

  // Priority is the order of the offers. This puts the reward calendars in the given
  // order (highest first) and leaves every other offer where it is.
  const reorderCalendars = (ids: string[]) =>
    setOffers((all) => {
      const byId = new Map(all.map((o) => [o.id, o]))
      const queue = ids.map((id) => byId.get(id)).filter((o): o is Offer => !!o)
      return queue.length === all.filter((o) => o.type === 'reward-calendar').length
        ? all.map((o) => (o.type === 'reward-calendar' ? queue.shift()! : o))
        : all
    })

  const closeEditor = () => {
    setEditing(null)
  }

  // Opens a place the walkthrough points at: the right calendar, with the right thing showing.
  const showPlace = (id: PlaceId) => {
    if (id === 'mcp') {
      setMcpOpen(true)
      return
    }
    const { offerId, scene } = placeTargets[id]
    let target = offers.find((o) => o.id === offerId)
    // The tour points at the sample calendars, so bring them in when they are not there yet.
    const sample = initialOffers.find((o) => o.id === offerId)
    if (!target && sample) {
      setOffers((all) => [...all, ...initialOffers.filter((o) => !all.some((x) => x.id === o.id))])
      target = sample
    }
    if (id === 'history' && target && (target.versions?.length ?? 0) < 3) {
      saveOffer({ ...target, versions: demoVersions(target) })
    }
    setActiveId('reward-calendars')
    setEditing({ offerId: target ? offerId : null, scene, nonce: Date.now() })
  }

  const navigate = (id: string) => {
    closeEditor()
    setActiveId(id)
  }

  return (
    <div className="app">
      <Sidebar
        activeId={activeId}
        onNavigate={navigate}
        onGetMcp={() => setMcpOpen(true)}
      />
      <div className="main">
        {editing ? (
          <CalendarEditor
            key={`${editing.offerId ?? 'new'}:${editing.nonce ?? 0}`}
            scene={editing.scene}
            offer={offers.find((o) => o.id === editing.offerId) ?? null}
            offers={offers}
            onSave={saveOffer}
            onReorder={reorderCalendars}
            onFinish={(finished, message, rank, description) => {
              saveOffer(finished, rank)
              closeEditor()
              setNotice({ message, description })
            }}
            onClose={closeEditor}
          />
        ) : (
          <>
            <TopBar
              trail={[
                { name: 'Workspace', label: 'Company' },
                { name: 'Folder', label: 'Store' },
                { name: 'Group', label: sectionOf(activeId).label },
                { name: 'Board', label: labelOf(activeId) },
              ]}
            />
            <main className="content">
              {activeId === 'reward-calendars' && (
                <OffersPage
                  offers={offers}
                  onChange={setOffers}
                  onNew={() => setEditing({ offerId: null })}
                  onOpen={(offerId) => setEditing({ offerId })}
                  onNotify={(message, description) => setNotice({ message, description })}
                />
              )}
            </main>
          </>
        )}
      </div>
      {mcpOpen && (
        <McpDialog
          onClose={() => setMcpOpen(false)}
          onContactAdmin={() => {
            setMcpOpen(false)
            setNotice({ message: 'Admin notified', description: 'Your admin has been asked to help set up the Appcharge MCP.' })
          }}
        />
      )}
      <Walkthrough onShowPlace={showPlace} />
      <ToastHost toast={notice} className="app-toast">
        {(n) => <ToastAlert message={n.message} description={n.description} onClose={() => setNotice(null)} />}
      </ToastHost>
    </div>
  )
}
