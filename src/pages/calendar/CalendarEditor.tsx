import { useEffect, useState } from 'react'
import { ArrowLeft, Cloud, CloudCheck, Monitor, Smartphone } from 'lucide-react'
import { Button, Icon, IconButton, Modal, MultiStepIndicator, Toast } from '../../design-system/components'
import type { Offer } from '../offers/data'
import { TODAY, dayDiff, formatUs } from '../offers/dates'
import { StatusPill } from '../offers/parts'
import type { Device } from './rewards/PreviewPanel'
import { RewardsStep } from './rewards/RewardsStep'
import { endDateFor, formatLength, weekCountFor, type Layout } from './rewards/plan'
import { emptyActiveDays, validatePlan, type RewardWeek } from './rewards/rules'
import { SettingsStep } from './SettingsStep'
import { audienceOf, emptySettings, validate, type CalendarSettings } from './settings'
import './calendar.css'

type CalendarEditorProps = {
  // The draft being reopened, or null for a new calendar.
  offer: Offer | null
  onSave: (offer: Offer) => void
  onPublish: (offer: Offer) => void
  onClose: () => void
  charlieOpen: boolean
  onCharlieClose: () => void
  // Lets the app know which step is showing, so Charlie only appears on Rewards.
  onStepChange: (step: number) => void
}

const steps = [{ label: 'Settings' }, { label: 'Rewards' }]

const settingsOf = (offer: Offer | null): CalendarSettings => {
  if (!offer) return emptySettings
  return (
    offer.settings ?? {
      ...emptySettings,
      name: offer.name,
      startDate: offer.start ?? '',
      endDate: offer.end ?? '',
    }
  )
}

export function CalendarEditor({ offer, onSave, onPublish, onClose, charlieOpen, onCharlieClose, onStepChange }: CalendarEditorProps) {
  const [settings, setSettings] = useState(() => settingsOf(offer))
  const [rewards, setRewards] = useState<RewardWeek[]>(() => offer?.rewards ?? [])
  const [offerId, setOfferId] = useState(offer?.id ?? null)
  // A calendar whose settings are already complete opens straight on its rewards.
  const [step, setStep] = useState(() => (offer && validate(settingsOf(offer)).valid ? 1 : 0))
  const [device, setDevice] = useState<Device>('desktop')
  const [toast, setToast] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)

  const snapshot = JSON.stringify({ settings, rewards })
  const [savedAs, setSavedAs] = useState(snapshot)

  const { errors, missing, valid } = validate(settings)
  const days = settings.startDate && settings.endDate ? Math.max(0, dayDiff(settings.startDate, settings.endDate) + 1) : 0

  useEffect(() => onStepChange(step), [step, onStepChange])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const update = (patch: Partial<CalendarSettings>) => setSettings((s) => ({ ...s, ...patch }))

  const build = (status: Offer['status']): Offer => ({
    ...offer,
    id: offerId ?? `calendar-${Date.now()}`,
    name: settings.name.trim() || 'Untitled calendar',
    type: 'reward-calendar',
    ...audienceOf(settings),
    start: settings.startDate || null,
    end: settings.endDate || null,
    status,
    settings,
    rewards,
  })

  // Published calendars keep their status; only drafts are drafts.
  const status = offer?.status ?? 'draft'
  const isDraft = status === 'draft'

  const persist = () => {
    const next = build(status)
    onSave(next)
    setOfferId(next.id)
    setSavedAs(snapshot)
  }

  // Everything is saved as a draft shortly after each change, so closing the page
  // never loses work. Nothing is created until something has actually been entered.
  useEffect(() => {
    if (snapshot === savedAs) return
    const t = setTimeout(persist, 600)
    return () => clearTimeout(t)
    // persist reads the latest state on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot])

  const saveDraft = () => {
    persist()
    setToast('Draft saved')
  }

  const close = () => {
    if (snapshot !== savedAs) persist()
    onClose()
  }

  // ----- Rewards step

  const onLayoutChange = ({ plan, days: nextDays }: Layout) => {
    setRewards(plan)
    update({ endDate: endDateFor(settings.startDate, nextDays) })
  }

  const issues = validatePlan(rewards, days)
  const blockers = [
    ...issues.filter((i) => i.severity === 'error').map((i) => `Week ${i.week + 1}, Day ${i.day + 1}: ${i.message}`),
    ...emptyActiveDays(
      Array.from({ length: weekCountFor(days) }, (_, i) => rewards[i] ?? Array.from({ length: 7 }, () => [])),
      days,
    ).map((d) => `Week ${d.week + 1}, Day ${d.day + 1} has no reward yet.`),
  ]
  const warnings = issues.filter((i) => i.severity === 'warning').length

  const publish = () => {
    onPublish(build(settings.startDate > TODAY ? 'scheduled' : 'live'))
  }

  return (
    <div className="editor">
      <header className="editor-bar">
        <div className="editor-title">
          <IconButton
            kind="Tertiary"
            size="Medium"
            aria-label="Back to offers"
            iconElement={<Icon icon={ArrowLeft} size="Medium" color="primary" />}
            onClick={close}
          />
          <h1>{settings.name.trim() || 'New Reward Calendar'}</h1>
          <StatusPill status={status} />
        </div>

        <div
          className={`stepper-wrap${step === 1 ? ' can-go-back' : ''}`}
          onClick={(e) => {
            const item = (e.target as HTMLElement).closest('li')
            if (step === 1 && item && item === e.currentTarget.querySelector('li')) setStep(0)
          }}
        >
          <MultiStepIndicator size="Regular" orientation="Horizontal" currentStep={step + 1} steps={steps} />
        </div>

        <div className="editor-actions">
          {/* An icon, not text, so the autosave state never changes the header's width. */}
          <span
            className="save-status"
            role="status"
            title={snapshot === savedAs ? 'All changes saved' : 'Saving…'}
            aria-label={snapshot === savedAs ? 'All changes saved' : 'Saving changes'}
          >
            {(snapshot !== savedAs || offerId) && (
              <Icon icon={snapshot === savedAs ? CloudCheck : Cloud} size="Medium" color={snapshot === savedAs ? 'positive' : 'secondary'} />
            )}
          </span>
          {step === 1 && (
            <div className="device-toggle" role="group" aria-label="Preview device">
              <button type="button" aria-label="Desktop preview" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
                <Icon icon={Monitor} size="Medium" color="current" />
              </button>
              <button type="button" aria-label="Mobile preview" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
                <Icon icon={Smartphone} size="Medium" color="current" />
              </button>
            </div>
          )}
          <Button kind="Secondary" size="Large" onClick={saveDraft}>
            {isDraft ? 'Save draft' : 'Save changes'}
          </Button>
          {step === 0 ? (
            <Button
              kind="Primary"
              size="Large"
              disabled={!valid}
              title={valid ? undefined : `Still needed: ${missing.join(', ')}`}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          ) : (
            isDraft && (
              <Button kind="Primary" size="Large" onClick={() => setPublishing(true)}>
                Publish
              </Button>
            )
          )}
        </div>
      </header>

      <div className={`editor-body${step === 1 ? ' editor-body--rewards' : ''}`}>
        {step === 0 ? (
          <SettingsStep settings={settings} errors={errors} missing={missing} onChange={update} />
        ) : (
          <RewardsStep
            settings={settings}
            plan={rewards}
            days={days}
            device={device}
            onPlanChange={setRewards}
            onLayoutChange={onLayoutChange}
            charlieOpen={charlieOpen}
            onCharlieClose={onCharlieClose}
            onEditSettings={() => setStep(0)}
          />
        )}
      </div>

      {publishing && (
        <Modal
          size="Medium"
          title={`Publish ${settings.name.trim() || 'this calendar'}?`}
          subtitle={blockers.length > 0 ? 'Fix these before publishing.' : 'Check the summary, then publish.'}
          onClose={() => setPublishing(false)}
          secondaryAction={{ label: blockers.length > 0 ? 'Back to rewards' : 'Cancel', onClick: () => setPublishing(false) }}
          primaryAction={{ label: 'Publish', disabled: blockers.length > 0, onClick: publish }}
        >
          {blockers.length > 0 ? (
            <ul className="publish-list publish-list--blockers">
              {blockers.slice(0, 8).map((b) => (
                <li key={b}>{b}</li>
              ))}
              {blockers.length > 8 && <li>and {blockers.length - 8} more.</li>}
            </ul>
          ) : (
            <ul className="publish-list">
              <li>
                Runs {formatUs(settings.startDate)} to {formatUs(endDateFor(settings.startDate, days))} ({formatLength(days)}), {settings.timezone}.
              </li>
              <li>Audience: {audienceOf(settings).audience}.</li>
              <li>
                {warnings === 0 ? 'No warnings.' : `${warnings} ${warnings === 1 ? 'warning' : 'warnings'} remain. You can still publish.`}
              </li>
              <li>{settings.startDate > TODAY ? 'It will be scheduled and go live on its start date.' : 'It goes live for players right away.'}</li>
            </ul>
          )}
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          <Toast type="Positive" onClose={() => setToast(null)}>
            {toast}
          </Toast>
        </div>
      )}
    </div>
  )
}
