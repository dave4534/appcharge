import { useState, type ReactNode } from 'react'
import { CalendarIcon, InfoIcon, XIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card as UiCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SelectCombobox } from '@/components/SelectCombobox'
import { TODAY, formatLong } from '../offers/dates'
import { segmentOptions, type FieldError as FieldErrorInfo } from './settings'

// A section of the form: a shadcn Card with a title and a hint.
export function Card({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <UiCard>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </UiCard>
  )
}

// The form stores plain "YYYY-MM-DD" strings; the calendar works in local dates.
const toDate = (day: string) => {
  if (!day) return undefined
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const fromDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

type DateFieldProps = {
  label: string
  value: string
  error?: FieldErrorInfo
  // Days before this one are greyed out and can't be picked.
  minDate?: string
  onChange: (value: string) => void
  onBlur: () => void
}

// A date: a button that opens the shadcn Calendar in a popover.
export function DateField({ label, value, error, minDate, onChange, onBlur }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const date = toDate(value)
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel>{label}</FieldLabel>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) onBlur()
        }}
      >
        <PopoverTrigger
          render={<Button variant="outline" className="w-full justify-start font-normal" aria-label={label} aria-invalid={!!error || undefined} />}
        >
          <CalendarIcon data-icon="inline-start" />
          {date ? formatLong(value) : <span className="text-muted-foreground">Select a date</span>}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date ?? toDate(minDate ?? '')}
            today={toDate(TODAY)}
            disabled={minDate ? { before: toDate(minDate)! } : undefined}
            onSelect={(next) => {
              if (!next) return
              onChange(fromDate(next))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
// Every quarter hour, plus the end of the day.
const QUARTER_HOURS = [...Array.from({ length: 96 }, (_, i) => `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`), '23:59']

type TimeFieldProps = {
  label: string
  value: string
  error?: FieldErrorInfo
  onChange: (value: string) => void
  onBlur: () => void
}

// A time of day, chosen from a shadcn Combobox.
export function TimeField({ label, value, error, onChange, onBlur }: TimeFieldProps) {
  const times = QUARTER_HOURS.includes(value) || !value ? QUARTER_HOURS : [value, ...QUARTER_HOURS]
  return (
    <Field data-invalid={!!error || undefined} onBlur={onBlur}>
      <FieldLabel>{label}</FieldLabel>
      <SelectCombobox
        aria-label={label}
        invalid={!!error}
        value={value}
        options={times.map((t) => ({ value: t, label: t }))}
        onChange={onChange}
      />
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
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
  impact?: string | null
}

export function RadioSection<T extends string>({ legend, value, options, onChange, inline, hideLegend, impact }: RadioSectionProps<T>) {
  const name = legend.replace(/\W+/g, '-').toLowerCase()
  return (
    <FieldSet>
      <FieldLegend variant="label" className={hideLegend ? 'sr-only' : undefined}>
        {legend}
      </FieldLegend>
      <RadioGroup value={value ?? ''} onValueChange={(v) => onChange(v as T)} className={inline ? 'flex flex-wrap gap-6' : undefined} aria-label={legend}>
        {options.map((o) => (
          <Field key={o.value} orientation="horizontal" className="w-auto">
            <RadioGroupItem id={`${name}-${o.value}`} value={o.value} />
            <FieldLabel htmlFor={`${name}-${o.value}`} className="font-normal">
              {o.label}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
      {impact && (
        <Alert>
          <InfoIcon />
          <AlertDescription>{impact}</AlertDescription>
        </Alert>
      )}
    </FieldSet>
  )
}

type SegmentPickerProps = {
  selected: string[]
  error?: FieldErrorInfo
  onChange: (names: string[]) => void
}

// A Combobox that adds segments, with removable Badges showing what is selected.
export function SegmentPicker({ selected, error, onChange }: SegmentPickerProps) {
  const remaining = segmentOptions
    .filter((s) => !selected.includes(s.name))
    .map((s) => ({ value: s.name, label: `${s.name} (${s.size.toLocaleString('en-US')})` }))

  return (
    <Field data-invalid={!!error || undefined}>
      <SelectCombobox
        aria-label="Add a segment"
        placeholder={selected.length === 0 ? 'Select segments' : 'Add another segment'}
        invalid={!!error}
        value=""
        options={remaining}
        onChange={(name) => onChange([...selected, name])}
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((name) => (
            <Badge key={name} variant="secondary" className="h-6 gap-1 pr-1 text-sm">
              {name}
              <button
                type="button"
                className="grid size-4 cursor-pointer place-items-center rounded-full hover:bg-black/10"
                aria-label={`Remove ${name}`}
                onClick={() => onChange(selected.filter((n) => n !== name))}
              >
                <XIcon />
              </button>
            </Badge>
          ))}
        </div>
      )}
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
