import { useState } from 'react'
import { CircleAlertIcon, XIcon } from 'lucide-react'
import { SelectCombobox } from '@/components/SelectCombobox'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field as FormField, FieldError as FormError, FieldLabel as FormLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TODAY, formatDay } from '../offers/dates'
import type { Offer } from '../offers/data'
import { Card, DateRangeField, RadioSection, SegmentPicker, TimeField } from './fields'
import { PrioritySection, type PriorityItem } from './PrioritySection'
import {
  EXAMPLE_WEEKS,
  segmentSize,
  timezoneOptions,
  type CalendarSettings,
  type Field,
  type FieldError,
} from './settings'

type SettingsStepProps = {
  settings: CalendarSettings
  errors: Partial<Record<Field, FieldError>>
  missing: string[]
  // Other calendars for the same audience that run at the same time as these dates.
  overlaps: Offer[]
  // Every reward calendar in priority order, with this one marked.
  priority: PriorityItem[]
  live: boolean
  // Set once the user has tried to continue: every problem shows, even in fields not visited yet.
  showAll?: boolean
  onPriorityChange: (ids: string[]) => void
  onChange: (patch: Partial<CalendarSettings>) => void
}

const W = EXAMPLE_WEEKS

export function SettingsStep({ settings: s, errors, missing, overlaps, priority, live, showAll, onPriorityChange, onChange }: SettingsStepProps) {
  // Required-field errors wait until the field has been visited; wrong values show at once.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [changingZone, setChangingZone] = useState(false)
  // Closing the overlap notice hides it until the overlap itself changes.
  const [dismissed, setDismissed] = useState('')
  const overlapKey = overlaps.map((o) => `${o.id}:${s.startDate}:${s.endDate}`).join('|')

  const touch = (f: Field) => setTouched((t) => ({ ...t, [f]: true }))
  const errorFor = (f: Field) => {
    const e = errors[f]
    return e && (!e.required || touched[f] || showAll) ? e : undefined
  }

  const zone = timezoneOptions.find((z) => z.value === s.timezone)

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5">
      <Card title="Basics" hint="Name the calendar so you can find it in the offers list.">
        <FormField data-invalid={!!errorFor('name') || undefined}>
          <FormLabel htmlFor="calendar-name">Name</FormLabel>
          <Input
            id="calendar-name"
            placeholder="Name this calendar"
            value={s.name}
            aria-invalid={!!errorFor('name') || undefined}
            onChange={(e) => onChange({ name: e.target.value })}
            onBlur={() => touch('name')}
          />
          {errorFor('name') && <FormError>{errorFor('name')?.message}</FormError>}
        </FormField>
      </Card>

      <Card
        title="Schedule"
        hint="When the calendar is available to players. Its length follows these dates and can be adjusted on the Rewards step."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <DateRangeField
              start={s.startDate}
              end={s.endDate}
              startError={errorFor('startDate')}
              endError={errorFor('endDate')}
              minDate={live ? undefined : TODAY}
              onChange={(startDate, endDate) => onChange({ startDate, endDate })}
              onBlur={() => {
                touch('startDate')
                touch('endDate')
              }}
            />
          </div>
          <TimeField
            label="Start time"
            value={s.startTime}
            error={errorFor('startTime')}
            onChange={(startTime) => onChange({ startTime })}
            onBlur={() => touch('startTime')}
          />
          <TimeField
            label="End time"
            value={s.endTime}
            error={errorFor('endTime')}
            onChange={(endTime) => onChange({ endTime })}
            onBlur={() => touch('endTime')}
          />
        </div>

        {overlaps.length > 0 && dismissed !== overlapKey && (
          <Alert className="overlap-alert">
            <CircleAlertIcon style={{ color: 'var(--content-color-working-orange)' }} />
            <AlertTitle>These dates overlap another calendar</AlertTitle>
            <AlertDescription>
              {overlaps
                .map((o) => `${o.name} runs ${formatDay(o.start!)} to ${formatDay(o.end!)} for ${o.audience}`)
                .join('. ')}
              . Players in this audience would see both.
            </AlertDescription>
            <AlertAction>
              <button type="button" className="cursor-pointer" onClick={() => setDismissed(overlapKey)}>
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </button>
            </AlertAction>
          </Alert>
        )}

        <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground">
          Timezone: {zone?.label ?? s.timezone}. The daily reset happens at 00:00 in this timezone.{' '}
          {changingZone ? (
            <span className="min-w-56">
              <SelectCombobox
                aria-label="Timezone"
                value={s.timezone}
                options={timezoneOptions}
                onChange={(timezone) => {
                  onChange({ timezone })
                  setChangingZone(false)
                }}
              />
            </span>
          ) : (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => setChangingZone(true)}
            >
              Change
            </Button>
          )}
        </p>
      </Card>

      <Card title="Rules" hint="What happens when a player misses a day or finishes the calendar.">
        <RadioSection
          legend="When a player misses a day"
          error={errorFor('missedDay')?.message}
          value={s.missedDay}
          onChange={(missedDay) => onChange({ missedDay })}
          options={[
            { value: 'complete', label: 'Complete reset: back to Week 1, Day 1' },
            { value: 'weekly', label: 'Weekly reset: back to Day 1 of the current week' },
          ]}
          impact={
            s.missedDay === 'complete'
              ? 'Impact: a player on Week 3, Day 5 who misses a day goes back to Week 1, Day 1.'
              : s.missedDay === 'weekly'
                ? 'Impact: a player on Week 3, Day 5 who misses a day goes back to Week 3, Day 1.'
                : null
          }
        />
        <RadioSection
          legend="After the last week"
          error={errorFor('afterLast')?.message}
          value={s.afterLast}
          onChange={(afterLast) => onChange({ afterLast })}
          options={[
            { value: 'restart', label: 'Restart from Week 1' },
            { value: 'end', label: 'End the calendar for that player' },
          ]}
          impact={
            s.afterLast === 'restart'
              ? `Impact: after Week ${W}, Day 7 a player starts again at Week 1, Day 1.`
              : s.afterLast === 'end'
                ? `Impact: after Week ${W}, Day 7 the calendar ends for that player and no more rewards show.`
                : null
          }
        />
      </Card>

      <Card title="Popup and collection" hint="When players see the popup and whether they must collect.">
        <RadioSection
          legend="Popup trigger"
          error={errorFor('popupTrigger')?.message}
          value={s.popupTrigger}
          onChange={(popupTrigger) => onChange({ popupTrigger })}
          options={[
            { value: 'automatic', label: 'Automatic when a reward is ready' },
            { value: 'click', label: 'On click, from the badge only' },
          ]}
        />
        <RadioSection
          legend="Collection"
          error={errorFor('collection')?.message}
          value={s.collection}
          onChange={(collection) => onChange({ collection })}
          options={[
            { value: 'forced', label: "Forced: the popup can't be closed until they collect" },
            { value: 'manual', label: 'Manual: they can close it and collect later that day' },
          ]}
        />
      </Card>

      <Card id="settings-audience" title="Audience" hint="Who sees this calendar.">
        <RadioSection
          legend="Audience"
          error={errorFor('audienceMode')?.message}
          inline
          hideLegend
          value={s.audienceMode}
          onChange={(audienceMode) => onChange({ audienceMode })}
          options={[
            { value: 'all', label: 'All players' },
            { value: 'segments', label: 'Specific segments' },
          ]}
        />
        {s.audienceMode === 'segments' && (
          <>
            <SegmentPicker
              selected={s.segments}
              error={errorFor('segments')}
              onChange={(segments) => {
                touch('segments')
                onChange({ segments })
              }}
            />
            {s.segments.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {segmentSize(s.segments).toLocaleString('en-US')} players selected
                {s.segments.length > 1 && ' (segments can overlap)'}
              </p>
            )}
          </>
        )}
      </Card>

      {priority.length > 1 && <PrioritySection items={priority} live={live} onChange={onPriorityChange} />}

      {missing.length > 0 && <p className="text-center text-sm text-muted-foreground">To continue, set: {missing.join(', ')}.</p>}
    </div>
  )
}
