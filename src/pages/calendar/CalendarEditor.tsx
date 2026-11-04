import { useEffect, useState } from 'react'
import { ArrowLeft, Cloud, CloudCheck, Monitor, Smartphone } from 'lucide-react'
import { Button, Icon, IconButton, Modal, Toast } from '../../design-system/components'
import {
  Stepper,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  StepperIndicator,
} from '@/components/ui/stepper'
import type { Offer } from '../offers/data'
import { TODAY, dayDiff } from '../offers/dates'
import { StatusPill } from '../offers/parts'
import type { Device } from './rewards/PreviewPanel'
import { RewardsStep } from './rewards/RewardsStep'
import { endDateFor, weekCountFor, type Layout } from './rewards/plan'
import { emptyActiveDays, validatePlan, type RewardWeek } from './rewards/rules'
import { SettingsStep } from './SettingsStep'
import { audienceOf, emptySettings, validate, type CalendarSettings } from './settings'
import './calendar.css'

// Stable reference: the Stepper defines its steps once.
const EDITOR_STEPS = [
  { id: 'settings', title: 'Settings' },
  { id: 'rewards', title: 'Rewards' },
]

type CalendarEditorProps = {
  // The draft being reopened, or null for a new calendar.
  offer: Offer | null
  onSave: (offer: Offer) => void
  // Saves the calendar and returns to the offers list, which shows `message` in a toast.
  onFinish: (offer: Offer, message: string) => void
  onClose: () => void
}

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

export function CalendarEditor({ offer, onSave, onFinish, onClose }: CalendarEditorProps) {
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

  // Publishing goes straight back to the list. Only blockers stop it, with a dialog.
  const publish = () => {
    if (blockers.length > 0) {
      setPublishing(true)
      return
    }
    const next = build(settings.startDate > TODAY ? 'scheduled' : 'live')
    onFinish(next, `${next.name} is ${next.status === 'live' ? 'live' : 'scheduled'}.`)
  }

  const saveChanges = () => {
    const next = build(status)
    onFinish(next, `Changes to ${next.name} are saved.`)
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

        <Stepper
          steps={EDITOR_STEPS}
          defaultValue={EDITOR_STEPS[step].id}
          value={EDITOR_STEPS[step].id}
          onValueChange={(id) => setStep(id === 'rewards' ? 1 : 0)}
          className="editor-steps"
        >
          <StepperNav className="flex items-center gap-2">
            {EDITOR_STEPS.map((s, i) => (
              <StepperItem key={s.id} stepId={s.id} disabled={i === 1 && !valid}>
                <StepperTrigger>
                  <StepperIndicator>{i + 1}</StepperIndicator>
                  <StepperTitle>{s.title}</StepperTitle>
                </StepperTrigger>
                {i === 0 && <StepperSeparator className="w-8 flex-none" />}
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>

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
          {isDraft ? (
            <Button kind="Secondary" size="Large" onClick={saveDraft}>
              Save draft
            </Button>
          ) : (
            <Button kind="Primary" size="Large" onClick={saveChanges}>
              Save changes
            </Button>
          )}
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
              <Button kind="Primary" size="Large" onClick={publish}>
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
            onEditSettings={() => setStep(0)}
          />
        )}
      </div>

      {publishing && (
        <Modal
          size="Medium"
          title="Fix these before publishing"
          subtitle="These need attention first."
          onClose={() => setPublishing(false)}
          secondaryAction={{ label: 'Cancel', onClick: () => setPublishing(false) }}
          primaryAction={{ label: 'Back to rewards', onClick: () => setPublishing(false) }}
        >
          <ul className="publish-list publish-list--blockers">
            {blockers.slice(0, 8).map((b) => (
              <li key={b}>{b}</li>
            ))}
            {blockers.length > 8 && <li>and {blockers.length - 8} more.</li>}
          </ul>
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
