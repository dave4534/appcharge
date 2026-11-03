import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'

type Option<T extends string> = { value: T; label: string }

type DropdownProps<T extends string> = {
  prefix: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  // Highlights the chip when it is narrowing the list.
  active?: boolean
}

export function Dropdown<T extends string>({ prefix, value, options, onChange, active }: DropdownProps<T>) {
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

  const current = options.find((o) => o.value === value)

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className={`chip${active ? ' is-active' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>
          {prefix}: <span className="chip-value">{current?.label}</span>
        </span>
        <Icon name="chevron" size={12} />
      </button>

      {open && (
        <ul className="menu" role="menu">
          {options.map((o) => (
            <li key={o.value} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={o.value === value}
                className="menu-item"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
