import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { Icon, Label } from '../design-system/components'
import { Button } from '@/components/ui/button'
import { navSections } from './nav'

type SidebarProps = {
  activeId: string
  onNavigate: (id: string) => void
  onGetMcp: () => void
}

export function Sidebar({ activeId, onNavigate, onGetMcp }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  return (
    <nav className="sidebar" aria-label="Main">
      <button type="button" className="logo" aria-label="appcharge, go to Reward Calendars" onClick={() => onNavigate('reward-calendars')}>
        appcharge
      </button>

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
                <Icon icon={ChevronDown} size="Small" color="current" />
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
                      <Icon icon={item.icon} size={18} color="current" />
                      {item.label}
                      {item.beta && (
                        <Label color="Primary" size="Small">
                          Beta
                        </Label>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

      <div className="nav-bottom">
        <Button variant="ghost" size="sm" className="mcp-cta cursor-pointer" onClick={onGetMcp}>
          <Sparkles data-icon="inline-start" />
          Get Appcharge MCP
        </Button>
      </div>
    </nav>
  )
}
