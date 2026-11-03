import { dayDiff } from '../offers/dates'
import { DAYS_PER_WEEK, MAX_WEEKS } from './rewards/rules'

export type MissedDay = 'complete' | 'weekly'
export type AfterLast = 'restart' | 'end'
export type PopupTrigger = 'automatic' | 'click'
export type Collection = 'forced' | 'manual'
export type AudienceMode = 'all' | 'segments'

// Choices start as null so a new calendar has nothing pre-selected: the manager
// has to make each decision on purpose.
export type CalendarSettings = {
  name: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  timezone: string
  missedDay: MissedDay | null
  afterLast: AfterLast | null
  popupTrigger: PopupTrigger | null
  collection: Collection | null
  audienceMode: AudienceMode | null
  segments: string[]
}

export const emptySettings: CalendarSettings = {
  name: '',
  startDate: '',
  startTime: '00:00',
  endDate: '',
  endTime: '23:59',
  timezone: 'UTC',
  missedDay: null,
  afterLast: null,
  popupTrigger: null,
  collection: null,
  audienceMode: null,
  segments: [],
}

export const segmentOptions = [
  { name: 'High spenders', size: 4210 },
  { name: 'New players', size: 12880 },
  { name: 'Lapsed players', size: 6340 },
  { name: 'Payers', size: 18460 },
]

export const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'UTC+02:00', label: 'UTC+02:00 (Jerusalem)' },
  { value: 'UTC-05:00', label: 'UTC-05:00 (New York)' },
  { value: 'UTC-08:00', label: 'UTC-08:00 (Los Angeles)' },
]

// The effect examples use a four-week calendar as an illustration.
export const EXAMPLE_WEEKS = 4

export const segmentSize = (names: string[]) =>
  segmentOptions.filter((s) => names.includes(s.name)).reduce((sum, s) => sum + s.size, 0)

export function audienceOf(s: CalendarSettings): { audience: string; audienceSize?: number } {
  if (s.audienceMode === 'all') return { audience: 'All players' }
  if (s.audienceMode === 'segments' && s.segments.length > 0) {
    return { audience: s.segments.join(', '), audienceSize: segmentSize(s.segments) }
  }
  return { audience: 'Not set' }
}

export type Field = 'name' | 'startDate' | 'startTime' | 'endDate' | 'endTime' | 'segments'
export type FieldError = { message: string; required: boolean }

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export function validate(s: CalendarSettings) {
  const errors: Partial<Record<Field, FieldError>> = {}
  const missing: string[] = []

  if (!s.name.trim()) {
    errors.name = { message: 'Add a name so you can find this calendar in the offers list.', required: true }
    missing.push('a name')
  }
  if (!s.startDate) {
    errors.startDate = { message: 'Select a start date.', required: true }
    missing.push('a start date')
  }
  if (!s.endDate) {
    errors.endDate = { message: 'Select an end date.', required: true }
    missing.push('an end date')
  }
  if (!TIME.test(s.startTime)) errors.startTime = { message: 'Use 24-hour time, like 00:00.', required: false }
  if (!TIME.test(s.endTime)) errors.endTime = { message: 'Use 24-hour time, like 23:59.', required: false }

  if (
    s.startDate &&
    s.endDate &&
    TIME.test(s.startTime) &&
    TIME.test(s.endTime) &&
    `${s.endDate}T${s.endTime}` <= `${s.startDate}T${s.startTime}`
  ) {
    errors.endDate = { message: 'The end must come after the start.', required: false }
  } else if (s.startDate && s.endDate && dayDiff(s.startDate, s.endDate) + 1 > MAX_WEEKS * DAYS_PER_WEEK) {
    errors.endDate = { message: `A calendar runs at most ${MAX_WEEKS} weeks (${MAX_WEEKS * DAYS_PER_WEEK} days).`, required: false }
  }
  if (errors.startTime || errors.endTime || errors.endDate?.required === false) missing.push('valid dates and times')

  if (!s.missedDay) missing.push('what happens when a player misses a day')
  if (!s.afterLast) missing.push('what happens after the last week')
  if (!s.popupTrigger) missing.push('the popup trigger')
  if (!s.collection) missing.push('how players collect')
  if (!s.audienceMode) missing.push('an audience')
  else if (s.audienceMode === 'segments' && s.segments.length === 0) {
    errors.segments = { message: 'Pick at least one segment.', required: true }
    missing.push('at least one segment')
  }

  return { errors, missing, valid: missing.length === 0 }
}
