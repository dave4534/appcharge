import { useEffect, useState } from 'react'
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react'
import { Button, Icon, IconButton } from '../../design-system/components'
import { ToastAlert } from '@/components/ToastAlert'
import { ReadinessPopover } from '@/components/ReadinessPopover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Stepper,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  StepperIndicator,
} from '@/components/ui/stepper'
import type { Offer, Version } from '../offers/data'
import { TODAY, dayDiff } from '../offers/dates'
import { StatusPill } from '../offers/parts'
import type { Device } from './rewards/PreviewPanel'
import { RewardsStep } from './rewards/RewardsStep'
import { endDateFor, removeEmptyDays, type Layout } from './rewards/plan'
import type { RewardWeek } from './rewards/rules'
import { readinessOf } from './readiness'
import { SettingsStep } from './SettingsStep'
import { VersionHistory } from './VersionHistory'
import { audienceOf, emptySettings, validate, type CalendarSettings } from './settings'
import './calendar.css'

// The current version plus 50 earlier autosaves.
const MAX_VERSIONS = 51

// How long a removal can be undone from its toast.
const UNDO_SECONDS = 5

// Stable reference: the Stepper defines its steps once.
const EDITOR_STEPS = [
  { id: 'settings', title: 'Settings' },
  { id: 'rewards', title: 'Rewards' },
]

type CalendarEditorProps = {
  // Every offer, so Readiness can spot calendars that overlap this one.
  offers: Offer[]
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

export function CalendarEditor({ offer, offers, onSave, onFinish, onClose }: CalendarEditorProps) {
  const [settings, setSettings] = useState(() => settingsOf(offer))
  const [rewards, setRewards] = useState<RewardWeek[]>(() => offer?.rewards ?? [])
  const [offerId, setOfferId] = useState(offer?.id ?? null)
  // A calendar whose settings are already complete opens straight on its rewards.
  const [step, setStep] = useState(() => (offer && validate(settingsOf(offer)).valid ? 1 : 0))
  const [device, setDevice] = useState<Device>('desktop')
  const [toast, setToast] = useState<{ message: string; description?: string; kind: 'success' | 'info'; undo?: boolean; seconds?: number } | null>(null)
  // Undo and redo for the Rewards step: each change to the plan or the length is a step.
  type Snap = { rewards: RewardWeek[]; endDate: string }
  const [past, setPast] = useState<Snap[]>([])
  const [future, setFuture] = useState<Snap[]>([])
  const [readinessOpen, setReadinessOpen] = useState(false)
  // Problems are only called out once the user has tried to publish.
  const [attempted, setAttempted] = useState(false)
  // A scheduled or live calendar with complete Settings is already set up, so its two
  // sections are tabs rather than steps. Decided when it opens, so editing never swaps them.
  const [tabbed] = useState(() => !!offer && offer.status !== 'draft' && validate(settingsOf(offer)).valid)
  // A calendar opened without history starts at version 1, as it looked when opened.
  const [versions, setVersions] = useState<Version[]>(() =>
    offer?.versions ?? (offer ? [{ n: 1, savedAt: Date.now(), by: 'Dave', settings: settingsOf(offer), rewards: offer.rewards ?? [] }] : []),
  )

  const snapshot = JSON.stringify({ settings, rewards })
  const [savedAs, setSavedAs] = useState(snapshot)

  const { errors, missing, valid } = validate(settings)
  const days = settings.startDate && settings.endDate ? Math.max(0, dayDiff(settings.startDate, settings.endDate) + 1) : 0


  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), (toast.seconds ?? 2.5) * 1000)
    return () => clearTimeout(t)
  }, [toast])

  const update = (patch: Partial<CalendarSettings>) => setSettings((s) => ({ ...s, ...patch }))

  const build = (status: Offer['status'], history: Version[] = versions): Offer => ({
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
    versions: history,
  })

  // Published calendars keep their status; only drafts are drafts.
  const status = offer?.status ?? 'draft'
  const isDraft = status === 'draft'

  const persist = () => {
    // Every autosave that changed something becomes a new version, newest last.
    let history = versions
    if (snapshot !== savedAs) {
      const n = (history[history.length - 1]?.n ?? 0) + 1
      history = [...history, { n, savedAt: Date.now(), by: 'Dave', settings, rewards }].slice(-MAX_VERSIONS)
      setVersions(history)
    }
    const next = build(status, history)
    onSave(next)
    setOfferId(next.id)
    setSavedAs(snapshot)
    return next
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

  // Saving a draft takes the user back to the offers list.
  const saveDraft = () => {
    onFinish(persist(), 'Draft saved')
  }

  const close = () => {
    if (snapshot !== savedAs) persist()
    onClose()
  }

  // ----- Rewards step

  const here = (): Snap => ({ rewards, endDate: settings.endDate })
  const record = () => {
    // Problems are called out when Publish is clicked, and clear as soon as the user edits.
    setAttempted(false)
    setPast((p) => [...p.slice(-49), here()])
    setFuture([])
  }
  const restore = (snap: Snap) => {
    setRewards(snap.rewards)
    update({ endDate: snap.endDate })
  }

  const changePlan = (plan: RewardWeek[]) => {
    record()
    setRewards(plan)
  }

  const onLayoutChange = ({ plan, days: nextDays }: Layout) => {
    record()
    setRewards(plan)
    update({ endDate: endDateFor(settings.startDate, nextDays) })
  }

  // Restoring brings an old version back as the current one; the next autosave
  // keeps it as a new version, so nothing in the history is lost.
  const restoreVersion = (v: Version) => {
    record()
    setSettings(v.settings)
    setRewards(v.rewards)
    setToast({ message: `Restored version ${v.n}`, description: 'It will be saved as a new version.', kind: 'success' })
  }

  const undo = () => {
    const last = past[past.length - 1]
    if (!last) return setToast({ message: 'Nothing to undo.', kind: 'info' })
    setAttempted(false)
    setPast(past.slice(0, -1))
    setFuture((f) => [...f, here()])
    restore(last)
  }

  const redo = () => {
    const next = future[future.length - 1]
    if (!next) return setToast({ message: 'Nothing to redo.', kind: 'info' })
    setAttempted(false)
    setFuture(future.slice(0, -1))
    setPast((p) => [...p, here()])
    restore(next)
  }

  const readiness = readinessOf(settings, rewards, days, { offers, selfId: offerId })

  // Publishing is never blocked by open items, but below 100% the readiness checklist
  // opens first so the risk is clear. "Publish anyway" in it carries on.
  const attempt = (go: () => void) => {
    if (readiness.percent < 100) {
      setAttempted(true)
      setReadinessOpen(true)
    }
    else go()
  }

  // Takes the empty days out and offers a few seconds to undo it.
  const removeEmpty = () => {
    const layout = removeEmptyDays(rewards, days)
    if (!layout) return
    const removed = days - layout.days
    setReadinessOpen(false)
    onLayoutChange(layout)
    setToast({
      message: `Removed ${removed} empty ${removed === 1 ? 'day' : 'days'}`,
      description: `The calendar is now ${layout.days} ${layout.days === 1 ? 'day' : 'days'} long.`,
      kind: 'info',
      undo: true,
      seconds: UNDO_SECONDS,
    })
  }

  const publish = () => {
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

        {tabbed ? (
          <Tabs
            value={EDITOR_STEPS[step].id}
            onValueChange={(id) => setStep(id === 'rewards' ? 1 : 0)}
            className="editor-steps"
          >
            <TabsList variant="line" className="h-10 rounded-none border-b p-0">
              {EDITOR_STEPS.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className="border-0 px-5 text-base group-data-horizontal/tabs:after:-bottom-[0.5px]">
                  {s.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : (
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
        )}

        <div className="editor-actions">
          <VersionHistory versions={versions} saving={snapshot !== savedAs} onRestore={restoreVersion} />
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
            <Button kind="Primary" size="Large" onClick={step === 1 ? () => attempt(saveChanges) : saveChanges}>
              Save changes
            </Button>
          )}
          {step === 0 ? (
            !tabbed && (
            <Button
              kind="Primary"
              size="Large"
              disabled={!valid}
              title={valid ? undefined : `Still needed: ${missing.join(', ')}`}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
            )
          ) : (
            isDraft && (
              <Button kind="Primary" size="Large" onClick={() => attempt(publish)}>
                Publish
              </Button>
            )
          )}
          {step === 1 && (
            <ReadinessPopover
              readiness={readiness}
              open={readinessOpen}
              onOpenChange={setReadinessOpen}
              confirmLabel={isDraft ? 'Publish anyway' : 'Save anyway'}
              onConfirm={isDraft ? publish : saveChanges}
              onRemoveEmpty={removeEmpty}
            />
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
            onPlanChange={changePlan}
            onUndo={undo}
            onRedo={redo}
            onNotify={(message, description) => setToast({ message, description, kind: 'info' })}
            onLayoutChange={onLayoutChange}
            onEditSettings={() => setStep(0)}
            live={status === 'live'}
            showIssues={attempted}
          />
        )}
      </div>

      {toast && (
        <div className="toast">
          <ToastAlert
            kind={toast.kind}
            message={toast.message}
            description={toast.description}
            countdown={toast.undo ? toast.seconds : undefined}
            action={
              toast.undo
                ? {
                    label: 'Undo',
                    onClick: () => {
                      undo()
                      setToast(null)
                    },
                  }
                : undefined
            }
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}
