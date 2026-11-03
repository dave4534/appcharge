import type { ReactNode } from 'react'
import {
  AttentionBox,
  Chips,
  DatePicker,
  Dropdown,
  RadioGroup as DsRadioGroup,
} from '../../design-system/components'
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

// The design system date picker hands back a full ISO timestamp for local midnight,
// so convert to and from the plain "YYYY-MM-DD" strings the form stores.
const toPickerValue = (day: string) => {
  if (!day) return ''
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d).toISOString()
}

const fromPickerValue = (iso: string) => {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

type DateFieldProps = {
  label: string
  value: string
  error?: FieldError
  onChange: (value: string) => void
  onBlur: () => void
}

export function DateField({ label, value, error, onChange, onBlur }: DateFieldProps) {
  return (
    <div className="field" onBlur={onBlur}>
      <DatePicker
        type="Date"
        label={label}
        placeholder="Select a date"
        value={toPickerValue(value)}
        onChange={(iso) => onChange(fromPickerValue(iso))}
      />
      {error && <p className="field-error">{error.message}</p>}
    </div>
  )
}

type RadioSectionProps<T extends string> = {
  legend: string
  value: T | null
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  inline?: boolean
  hideLegend?: boolean
  // A plain-language example of what the selected option does.
  effect?: string | null
}

export function RadioSection<T extends string>({
  legend,
  value,
  options,
  onChange,
  inline,
  hideLegend,
  effect,
}: RadioSectionProps<T>) {
  return (
    <div className="radio-section">
      <h3 className={hideLegend ? 'sr-only' : undefined}>{legend}</h3>
      <DsRadioGroup
        aria-label={legend}
        positioning={inline ? 'horizontal' : 'vertical'}
        options={options}
        value={value ?? ''}
        onChange={(v) => onChange(v as T)}
      />
      {effect && (
        <AttentionBox type="Neutral" compact showIcon={false} className="effect">
          {effect}
        </AttentionBox>
      )}
    </div>
  )
}

type SegmentPickerProps = {
  selected: string[]
  error?: FieldError
  onChange: (names: string[]) => void
}

// The design system has no multi-select yet, so this pairs a Dropdown that adds
// segments with removable Chips that show what is selected.
export function SegmentPicker({ selected, error, onChange }: SegmentPickerProps) {
  const remaining = segmentOptions
    .filter((s) => !selected.includes(s.name))
    .map((s) => ({ value: s.name, label: `${s.name} (${s.size.toLocaleString('en-US')})` }))

  return (
    <div className="segment-picker">
      <Dropdown
        size="Large"
        aria-label="Add a segment"
        placeholder={selected.length === 0 ? 'Select segments' : 'Add another segment'}
        state={error ? 'error' : 'default'}
        value=""
        options={remaining}
        onChange={(name) => onChange([...selected, name])}
      />
      {selected.length > 0 && (
        <div className="chip-row">
          {selected.map((name) => (
            <Chips
              key={name}
              type="Primary"
              showCloseButton
              onClose={() => onChange(selected.filter((n) => n !== name))}
            >
              {name}
            </Chips>
          ))}
        </div>
      )}
      {error && <p className="field-error">{error.message}</p>}
    </div>
  )
}
