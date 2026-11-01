import { useState } from 'react'
import { Icon } from './Icon'
import { navSections } from './nav'

type SidebarProps = {
  activeId: string
  onNavigate: (id: string) => void
}

export function Sidebar({ activeId, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  return (
    <nav className="sidebar" aria-label="Main">
      <div className="logo">appcharge</div>

      <div className="store">
        <span className="store-badge">SI</span>
        Store
      </div>

      {navSections.map((section) => {
        const expanded = !collapsed[section.id]
        return (
          <div className="nav-section" key={section.id}>
            <button
              type="button"
              className="nav-section-header"
              aria-expanded={expanded}
              onClick={() => setCollapsed((c) => ({ ...c, [section.id]: expanded }))}
            >
              {section.label}
              <span className="chevron">
                <Icon name="chevron" size={14} />
              </span>
            </button>

            {expanded && (
              <ul className="nav-list">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="nav-item"
                      aria-current={item.id === activeId ? 'page' : undefined}
                      onClick={() => onNavigate(item.id)}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                      {item.beta && <span className="beta">Beta</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
