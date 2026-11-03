import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, Icon, Menu } from '../../design-system/components'

// "New offer" opens a menu of offer types. Only reward calendars are built so far.
export function NewOfferMenu({ onNewCalendar }: { onNewCalendar: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="new-offer" ref={ref}>
      <Button
        kind="Primary"
        size="Large"
        icon="Right"
        aria-haspopup="menu"
        aria-expanded={open}
        iconElement={<Icon icon={ChevronDown} size="Small" color="on-primary" />}
        onClick={() => setOpen((o) => !o)}
      >
        New offer
      </Button>
      {open && (
        <div className="popover">
          <Menu
            size="Medium"
            aria-label="Offer types"
            items={[
              { id: 'reward-calendar', label: 'Reward Calendar' },
              { id: 'bundle', label: 'Bundle', disabled: true },
              { id: 'promotion', label: 'Promotion', disabled: true },
            ]}
            onItemSelect={(id) => {
              if (id !== 'reward-calendar') return
              setOpen(false)
              onNewCalendar()
            }}
          />
        </div>
      )}
    </div>
  )
}
