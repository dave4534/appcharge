import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { navSections } from './components/nav'
import { CalendarEditor } from './pages/calendar/CalendarEditor'
import { initialOffers, type Offer } from './pages/offers/data'
import { OffersPage } from './pages/offers/OffersPage'

const sectionOf = (id: string) => navSections.find((s) => s.items.some((i) => i.id === id))!
const labelOf = (id: string) => sectionOf(id).items.find((i) => i.id === id)!.label

// null: the offers list. { offerId: null }: a new calendar. { offerId }: a saved draft.
type Editing = { offerId: string | null } | null

export default function App() {
  const [activeId, setActiveId] = useState('reward-calendars')
  const [offers, setOffers] = useState<Offer[]>(initialOffers)
  const [editing, setEditing] = useState<Editing>(null)

  // A new draft joins the end of the list, so it gets the lowest priority.
  const saveOffer = (offer: Offer) =>
    setOffers((all) => (all.some((o) => o.id === offer.id) ? all.map((o) => (o.id === offer.id ? offer : o)) : [...all, offer]))

  const navigate = (id: string) => {
    setEditing(null)
    setActiveId(id)
  }

  return (
    <div className="app">
      <Sidebar activeId={activeId} onNavigate={navigate} />
      <div className="main">
        {editing ? (
          <CalendarEditor
            key={editing.offerId ?? 'new'}
            offer={offers.find((o) => o.id === editing.offerId) ?? null}
            onSave={saveOffer}
            onClose={() => setEditing(null)}
          />
        ) : (
          <>
            <TopBar trail={['Company', 'Store', sectionOf(activeId).label, labelOf(activeId)]} />
            <main className="content">
              {activeId === 'reward-calendars' && (
                <OffersPage
                  offers={offers}
                  onChange={setOffers}
                  onNew={() => setEditing({ offerId: null })}
                  onOpen={(offerId) => setEditing({ offerId })}
                />
              )}
            </main>
          </>
        )}
      </div>
    </div>
  )
}
