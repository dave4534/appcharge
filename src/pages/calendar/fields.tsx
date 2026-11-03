import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { formatLong } from '../offers/dates'
import { segmentOptions, type FieldError } from './settings'

export function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="card-hint">{hint}</p>
      {children}
    </section>
  )
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  placeholder?: string
  error?: FieldError
  onChange: (value: string) => void
  onBlur: () => void
}

export function TextField({ id, label, value, placeholder, error, onChange, onBlur }: TextFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        className={`input${error ? ' has-error' : ''}`}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error.message}
        </p>
      )}
    </div>
  )
}

type DateFieldProps = Omit<TextFieldProps, 'placeholder'>

// The visible box shows the date as "Wed 11 Nov 2026"; a transparent native date
// input sits on top so clicking opens the browser's own picker.
export function DateField({ id, label, value, error, onChange, onBlur }: DateFieldProps) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className={`input date-input${error ? ' has-error' : ''}`}>
        <span className={value ? '' : 'placeholder'}>{value ? formatLong(value) : 'Select a date'}</span>
        <input
          id={id}
          ref={ref}
          type="date"
          className="date-native"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onClick={() => ref.current?.showPicker?.()}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error.message}
        </p>
      )}
    </div>
  )
}

type RadioGroupProps<T extends string> = {
  legend: string
  name: string
  value: T | null
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  inline?: boolean
  hideLegend?: boolean
  // A plain-language example of what the selected option does.
  effect?: string | null
}

export function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  inline,
  hideLegend,
  effect,
}: RadioGroupProps<T>) {
  return (
    <fieldset className="radio-group">
      <legend className={hideLegend ? 'sr-only' : undefined}>{legend}</legend>
      <div className={inline ? 'radio-row' : 'radio-col'}>
        {options.map((o) => (
          <label key={o.value} className="radio">
            <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {effect && <p className="effect">{effect}</p>}
    </fieldset>
  )
}

type SegmentPickerProps = {
  selected: string[]
  error?: FieldError
  onChange: (names: string[]) => void
}

export function SegmentPicker({ selected, error, onChange }: SegmentPickerProps) {
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

  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name])

  return (
    <div className="segment-picker" ref={ref}>
      <div className={`input segment-box${error ? ' has-error' : ''}`}>
        {selected.map((name) => (
          <span key={name} className="segment-chip">
            {name}
            <button type="button" aria-label={`Remove ${name}`} onClick={() => toggle(name)}>
              <Icon name="close" size={12} />
            </button>
          </span>
        ))}
        <button
          type="button"
          className="segment-toggle"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="placeholder">{selected.length === 0 ? 'Select segments' : ''}</span>
          <Icon name="chevron" size={14} />
        </button>
      </div>

      {open && (
        <ul className="menu segment-menu" role="listbox" aria-multiselectable="true">
          {segmentOptions.map((s) => (
            <li key={s.name} role="option" aria-selected={selected.includes(s.name)}>
              <label className="menu-check">
                <input type="checkbox" checked={selected.includes(s.name)} onChange={() => toggle(s.name)} />
                <span>{s.name}</span>
                <span className="muted">{s.size.toLocaleString('en-US')}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="field-error">{error.message}</p>}
    </div>
  )
}
