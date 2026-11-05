import { useEffect, useState, type ReactNode } from 'react'
import { CalendarIcon, InfoIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card as UiCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { TODAY, formatLong } from '../offers/dates'
import { segmentOptions, type FieldError as FieldErrorInfo } from './settings'

// A section of the form: a shadcn Card with a title and a hint.
export function Card({ title, hint, children, id }: { title: string; hint: string; children: ReactNode; id?: string }) {
  return (
    <UiCard id={id}>
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

type DateRangeFieldProps = {
  start: string
  end: string
  startError?: FieldErrorInfo
  endError?: FieldErrorInfo
  // Days before this one are greyed out and can't be picked.
  minDate?: string
  onChange: (start: string, end: string) => void
  onBlur: () => void
}

// One date range: the start and end days are picked on the same calendar, which stays open
// until both are chosen.
export function DateRangeField({ start, end, startError, endError, minDate, onChange, onBlur }: DateRangeFieldProps) {
  const [open, setOpen] = useState(false)
  // The range being picked while the calendar is open. It is saved once both days are chosen,
  // or when the calendar closes, so the form never holds a half-picked range.
  const [picking, setPicking] = useState<DateRange | undefined>(undefined)
  const error = startError ?? endError
  const saved: DateRange | undefined = start ? { from: toDate(start), to: toDate(end || start) } : undefined
  const label = start && end ? `${formatLong(start)} – ${formatLong(end)}` : start ? formatLong(start) : 'Pick a date range'

  const commit = (range: DateRange | undefined) => {
    if (!range?.from) return
    const from = range.from
    const to = range.to ?? range.from
    // Keep the earlier day first, whichever order the calendar gave them in.
    const [first, last] = from <= to ? [from, to] : [to, from]
    onChange(fromDate(first), fromDate(last))
  }

  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel>Dates</FieldLabel>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) {
            setPicking(saved)
          } else {
            commit(picking)
            setPicking(undefined)
            onBlur()
          }
          setOpen(next)
        }}
      >
        <PopoverTrigger
          render={<Button variant="outline" className="w-full min-w-0 justify-start font-normal" aria-label="Dates" aria-invalid={!!error || undefined} />}
        >
          <CalendarIcon data-icon="inline-start" />
          {start ? label : <span className="text-muted-foreground">{label}</span>}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={picking}
            defaultMonth={picking?.from ?? toDate(minDate ?? '')}
            today={toDate(TODAY)}
            disabled={minDate ? { before: toDate(minDate)! } : undefined}
            onSelect={(next) => {
              setPicking(next)
              // A second, different day completes the range: save it and close.
              if (next?.from && next.to && next.to.getTime() !== next.from.getTime()) {
                commit(next)
                setOpen(false)
                setPicking(undefined)
                onBlur()
              }
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

// Reads what someone types as a time: 9, 930, 9:30, 9.30, 9:30pm, 9pm or 21:15. Returns
// "HH:MM" in 24-hour time, or null when it is not a time.
export function parseTime(text: string): string | null {
  const match = text.trim().toLowerCase().match(/^(\d{1,2})(?:[:.]?(\d{2}))?\s*(am|pm|a|p)?$/)
  if (!match) return null
  let hours = Number(match[1])
  const minutes = match[2] === undefined ? 0 : Number(match[2])
  const suffix = match[3]
  if (minutes > 59) return null
  if (suffix) {
    if (hours < 1 || hours > 12) return null
    if (suffix.startsWith('p') && hours !== 12) hours += 12
    if (suffix.startsWith('a') && hours === 12) hours = 0
  }
  if (hours > 23) return null
  return `${pad(hours)}:${pad(minutes)}`
}

type TimeFieldProps = {
  label: string
  value: string
  error?: FieldErrorInfo
  onChange: (value: string) => void
  onBlur: () => void
}

// A time of day. Pick a quarter hour from the list, or type any time. A typed time is saved as
// soon as it reads as a time, and text that is not a time leaves the saved value alone.
export function TimeField({ label, value, error, onChange, onBlur }: TimeFieldProps) {
  const [text, setText] = useState(value)
  // When the saved value changes from elsewhere (a pick from the list), show it. Typing that
  // the form has already saved is left as typed, so the field never jumps while typing.
  useEffect(() => {
    if (parseTime(text) !== value) setText(value)
    // Only a change to the saved value should reset the text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const times = QUARTER_HOURS.includes(value) || !value ? QUARTER_HOURS : [value, ...QUARTER_HOURS]
  return (
    <Field
      data-invalid={!!error || undefined}
      onBlur={onBlur}
      // A click selects the whole time, so a new one can be typed straight away. The browser
      // would place the cursor on click, so the first press is taken over here.
      onMouseDown={(e) => {
        const input = e.target
        if (!(input instanceof HTMLInputElement) || document.activeElement === input) return
        e.preventDefault()
        input.focus()
        input.select()
      }}
      onFocus={(e) => {
        const input = e.target
        if (input instanceof HTMLInputElement) input.select()
      }}
    >
      <FieldLabel>{label}</FieldLabel>
      <Combobox
        items={times}
        value={value}
        inputValue={text}
        onInputValueChange={(next) => {
          setText(next)
          const parsed = parseTime(next)
          if (parsed && parsed !== value) onChange(parsed)
        }}
        onValueChange={(next) => {
          if (next) onChange(next)
        }}
      >
        <ComboboxInput
          aria-label={label}
          aria-invalid={!!error || undefined}
          placeholder="hh:mm"
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No matching times</ComboboxEmpty>
          <ComboboxList>
            {(time: string) => (
              <ComboboxItem key={time} value={time}>
                {time}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
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
  // Shown when the choice was required and is still empty.
  error?: string
}

export function RadioSection<T extends string>({ legend, value, options, onChange, inline, hideLegend, impact, error }: RadioSectionProps<T>) {
  const name = legend.replace(/\W+/g, '-').toLowerCase()
  return (
    <FieldSet>
      <FieldLegend variant="label" className={hideLegend ? 'sr-only' : undefined}>
        {legend}
      </FieldLegend>
      <RadioGroup value={value ?? ''} onValueChange={(v) => onChange(v as T)} className={inline ? 'flex flex-wrap gap-6' : undefined} aria-label={legend} aria-invalid={!!error || undefined}>
        {options.map((o) => (
          <Field key={o.value} orientation="horizontal" className="w-auto">
            <RadioGroupItem id={`${name}-${o.value}`} value={o.value} />
            <FieldLabel htmlFor={`${name}-${o.value}`} className="font-normal">
              {o.label}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
      {error && <FieldError>{error}</FieldError>}
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

// The segments picker: a multiple combobox, with each chosen segment shown as a removable chip.
export function SegmentPicker({ selected, error, onChange }: SegmentPickerProps) {
  const anchor = useComboboxAnchor()
  const sizeOf = (name: string) => segmentOptions.find((s) => s.name === name)?.size ?? 0
  const names = segmentOptions.map((s) => s.name)

  return (
    <Field data-invalid={!!error || undefined}>
      <Combobox
        multiple
        autoHighlight
        items={names}
        value={selected}
        onValueChange={(values) => onChange(values as string[])}
      >
        <ComboboxChips ref={anchor} aria-invalid={!!error || undefined}>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((name) => (
                  <ComboboxChip key={name}>{name}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  aria-label="Add a segment"
                  placeholder={selected.length === 0 ? 'Select segments' : ''}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No segments found.</ComboboxEmpty>
          <ComboboxList>
            {(name: string) => (
              <ComboboxItem key={name} value={name}>
                {name} ({sizeOf(name).toLocaleString('en-US')})
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {error && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
