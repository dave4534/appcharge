import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { navSections } from './components/nav'

const sectionOf = (id: string) => navSections.find((s) => s.items.some((i) => i.id === id))!
const labelOf = (id: string) => sectionOf(id).items.find((i) => i.id === id)!.label

export default function App() {
  const [activeId, setActiveId] = useState('reward-calendars')

  return (
    <div className="app">
      <Sidebar activeId={activeId} onNavigate={setActiveId} />
      <div className="main">
        <TopBar trail={['Company', 'Store', sectionOf(activeId).label, labelOf(activeId)]} />
        <main className="content">{/* Wireframe content goes here */}</main>
      </div>
    </div>
  )
}
