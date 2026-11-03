import { Ellipsis } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Icon, IconButton, Menu } from '../../../design-system/components'

type MenuButtonProps = {
  label: string
  items: { id: string; label: string; disabled?: boolean }[]
  onSelect: (id: string) => void
}

// A "..." button that opens a design system Menu.
export function MenuButton({ label, items, onSelect }: MenuButtonProps) {
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
    <div className="menu-button" ref={ref}>
      <IconButton
        kind="Tertiary"
        size="Small"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        iconElement={<Icon icon={Ellipsis} size="Medium" color="secondary" />}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="popover">
          <Menu
            size="Medium"
            aria-label={label}
            items={items}
            onItemSelect={(id) => {
              setOpen(false)
              onSelect(id)
            }}
          />
        </div>
      )}
    </div>
  )
}
