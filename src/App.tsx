import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ToastAlert } from './components/ToastAlert'
import { ToastHost } from './components/ToastHost'
import { TopBar } from './components/TopBar'
import { navSections } from './components/nav'
import { loadOffers, saveOffers } from './lib/storage'
import { CalendarEditor } from './pages/calendar/CalendarEditor'
import { initialOffers, type Offer } from './pages/offers/data'
import { OffersPage } from './pages/offers/OffersPage'
import { McpDialog } from './components/McpDialog'

const sectionOf = (id: string) => navSections.find((s) => s.items.some((i) => i.id === id))!
const labelOf = (id: string) => sectionOf(id).items.find((i) => i.id === id)!.label

// null: the offers list. { offerId: null }: a new calendar. { offerId }: a saved draft.
type Editing = { offerId: string | null } | null

export default function App() {
  const [activeId, setActiveId] = useState('reward-calendars')
  const [offers, setOffers] = useState<Offer[]>(() => loadOffers(initialOffers))
  const [editing, setEditing] = useState<Editing>(null)
  const [notice, setNotice] = useState<{ message: string; description?: string } | null>(null)
  const [mcpOpen, setMcpOpen] = useState(false)

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(t)
  }, [notice])

  // Everything is saved as it changes, so a closed tab never loses a draft.
  useEffect(() => saveOffers(offers), [offers])

  // A new draft joins the end of the list, so it gets the lowest priority.
  const saveOffer = (offer: Offer) =>
    setOffers((all) => (all.some((o) => o.id === offer.id) ? all.map((o) => (o.id === offer.id ? offer : o)) : [...all, offer]))

  const closeEditor = () => {
    setEditing(null)
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
            key={editing.offerId ?? 'new'}
            offer={offers.find((o) => o.id === editing.offerId) ?? null}
            offers={offers}
            onSave={saveOffer}
            onFinish={(finished, message) => {
              saveOffer(finished)
              closeEditor()
              setNotice({ message })
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
      <ToastHost toast={notice} className="app-toast">
        {(n) => <ToastAlert message={n.message} description={n.description} onClose={() => setNotice(null)} />}
      </ToastHost>
    </div>
  )
}
