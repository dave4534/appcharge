import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
                <ChevronDown className="size-4" />
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
                      // Only Reward Calendars is built. The other items keep their hover state
                      // but do nothing when clicked, and the page stays where it is.
                      onClick={() => item.id === 'reward-calendars' && onNavigate(item.id)}
                    >
                      <item.icon className="size-[18px]" />
                      {item.label}
                      {item.beta && <Badge className="h-4 px-1.5 text-[10px]">Beta</Badge>}
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
