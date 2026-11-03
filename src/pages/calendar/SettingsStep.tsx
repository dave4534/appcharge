import { useState } from 'react'
import { Card, DateField, RadioGroup, SegmentPicker, TextField } from './fields'
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
  onChange: (patch: Partial<CalendarSettings>) => void
}

const W = EXAMPLE_WEEKS

export function SettingsStep({ settings: s, errors, missing, onChange }: SettingsStepProps) {
  // Required-field errors wait until the field has been visited; wrong values show at once.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [changingZone, setChangingZone] = useState(false)

  const touch = (f: Field) => setTouched((t) => ({ ...t, [f]: true }))
  const errorFor = (f: Field) => {
    const e = errors[f]
    return e && (!e.required || touched[f]) ? e : undefined
  }

  const zone = timezoneOptions.find((z) => z.value === s.timezone)

  return (
    <div className="form">
      <Card title="Basics" hint="Name the calendar so you can find it in the offers list.">
        <TextField
          id="calendar-name"
          label="Name"
          value={s.name}
          placeholder="Name this calendar"
          error={errorFor('name')}
          onChange={(name) => onChange({ name })}
          onBlur={() => touch('name')}
        />
      </Card>

      <Card
        title="Schedule"
        hint="When the calendar is available to players. Its length (1 to 10 weeks) is set on the Rewards step."
      >
        <div className="schedule-grid">
          <DateField
            id="start-date"
            label="Start date"
            value={s.startDate}
            error={errorFor('startDate')}
            onChange={(startDate) => onChange({ startDate })}
            onBlur={() => touch('startDate')}
          />
          <TextField
            id="start-time"
            label="Start time"
            value={s.startTime}
            error={errorFor('startTime')}
            onChange={(startTime) => onChange({ startTime })}
            onBlur={() => touch('startTime')}
          />
          <DateField
            id="end-date"
            label="End date"
            value={s.endDate}
            error={errorFor('endDate')}
            onChange={(endDate) => onChange({ endDate })}
            onBlur={() => touch('endDate')}
          />
          <TextField
            id="end-time"
            label="End time"
            value={s.endTime}
            error={errorFor('endTime')}
            onChange={(endTime) => onChange({ endTime })}
            onBlur={() => touch('endTime')}
          />
        </div>

        <p className="zone-line">
          Timezone: {zone?.label ?? s.timezone}. The daily reset happens at 00:00 in this timezone.{' '}
          {changingZone ? (
            <select
              className="zone-select"
              aria-label="Timezone"
              value={s.timezone}
              onChange={(e) => {
                onChange({ timezone: e.target.value })
                setChangingZone(false)
              }}
            >
              {timezoneOptions.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          ) : (
            <button type="button" className="link" onClick={() => setChangingZone(true)}>
              Change
            </button>
          )}
        </p>
      </Card>

      <Card title="Rules" hint="What happens when a player misses a day or finishes the calendar.">
        <RadioGroup
          legend="When a player misses a day"
          name="missed-day"
          value={s.missedDay}
          onChange={(missedDay) => onChange({ missedDay })}
          options={[
            { value: 'complete', label: 'Complete reset: back to Week 1, Day 1' },
            { value: 'weekly', label: 'Weekly reset: back to Day 1 of the current week' },
          ]}
          effect={
            s.missedDay === 'complete'
              ? 'Effect: a player on Week 3, Day 5 who misses a day goes back to Week 1, Day 1.'
              : s.missedDay === 'weekly'
                ? 'Effect: a player on Week 3, Day 5 who misses a day goes back to Week 3, Day 1.'
                : null
          }
        />
        <RadioGroup
          legend="After the last week"
          name="after-last"
          value={s.afterLast}
          onChange={(afterLast) => onChange({ afterLast })}
          options={[
            { value: 'restart', label: 'Restart from Week 1' },
            { value: 'end', label: 'End the calendar for that player' },
          ]}
          effect={
            s.afterLast === 'restart'
              ? `Effect: after Week ${W}, Day 7 a player starts again at Week 1, Day 1.`
              : s.afterLast === 'end'
                ? `Effect: after Week ${W}, Day 7 the calendar ends for that player and no more rewards show.`
                : null
          }
        />
      </Card>

      <Card title="Popup and collection" hint="When players see the popup and whether they must collect.">
        <RadioGroup
          legend="Popup trigger"
          name="popup-trigger"
          value={s.popupTrigger}
          onChange={(popupTrigger) => onChange({ popupTrigger })}
          options={[
            { value: 'automatic', label: 'Automatic when a reward is ready' },
            { value: 'click', label: 'On click, from the badge only' },
          ]}
        />
        <RadioGroup
          legend="Collection"
          name="collection"
          value={s.collection}
          onChange={(collection) => onChange({ collection })}
          options={[
            { value: 'forced', label: "Forced: the popup can't be closed until they collect" },
            { value: 'manual', label: 'Manual: they can close it and collect later that day' },
          ]}
        />
      </Card>

      <Card title="Audience" hint="Who sees this calendar.">
        <RadioGroup
          legend="Audience"
          name="audience"
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
              <p className="count">
                {segmentSize(s.segments).toLocaleString('en-US')} players selected
                {s.segments.length > 1 && ' (segments can overlap)'}
              </p>
            )}
          </>
        )}
      </Card>

      {missing.length > 0 && <p className="missing">To continue, set: {missing.join(', ')}.</p>}
    </div>
  )
}
