import { useEffect, useState } from 'react'
import { ArrowLeft, Monitor, Pause, Play, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconButton } from '@/components/IconButton'
import { ToastAlert } from '@/components/ToastAlert'
import { PauseDialog } from '@/components/PauseDialog'
import { ReadinessPopover } from '@/components/ReadinessPopover'
import { SubmitRequestButton } from '@/components/SubmitRequestButton'
import { EditorTabs } from '@/components/EditorTabs'
import { ToastHost } from '@/components/ToastHost'
import {
  Stepper,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  StepperIndicator,
} from '@/components/ui/stepper'
import { hasPlayers, type Offer, type Version } from '../offers/data'
import { TODAY, dayDiff, formatDay } from '../offers/dates'
import { StatusPill } from '../offers/parts'
import type { Device } from './rewards/PreviewPanel'
import { RewardsStep } from './rewards/RewardsStep'
import { endDateFor, removeEmptyDays, type Layout } from './rewards/plan'
import { LIVE_PLAYER_TOTAL, type RewardWeek } from './rewards/rules'
import { overlapsOf, readinessOf } from './readiness'
import { SettingsStep } from './SettingsStep'
import type { EditorScene } from '../../components/walkthrough/places'
import type { PriorityItem } from './PrioritySection'
import { VersionHistory } from './VersionHistory'
import { audienceOf, emptySettings, validate, type CalendarSettings } from './settings'
import './calendar.css'

// Stands in for a calendar that has no id yet in the priority list.
const NEW_ID = '__new__'

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
  onSave: (offer: Offer, rank?: number) => void
  // Saves the calendar and returns to the offers list, which shows `message` in a toast.
  onFinish: (offer: Offer, message: string, rank?: number, description?: string) => void
  // Puts the reward calendars in a new priority order (highest first).
  onReorder: (ids: string[]) => void
  onClose: () => void
  // What to have showing on open, when the walkthrough sends someone here.
  scene?: EditorScene
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

export function CalendarEditor({ offer, offers, onSave, onFinish, onReorder, onClose, scene }: CalendarEditorProps) {
  const [settings, setSettings] = useState(() => ({ ...settingsOf(offer), ...scene?.prefill }))
  const [rewards, setRewards] = useState<RewardWeek[]>(() => offer?.rewards ?? [])
  const [offerId, setOfferId] = useState(offer?.id ?? null)
  // A calendar whose settings are already complete opens straight on its rewards.
  const [step, setStep] = useState<number>(() => scene?.step ?? (offer && validate(settingsOf(offer)).valid ? 1 : 0))
  const [device, setDevice] = useState<Device>('desktop')
  const [toast, setToast] = useState<{ message: string; description?: string; kind: 'success' | 'info'; undo?: boolean; seconds?: number } | null>(null)
  // Undo and redo for the Rewards step: each change to the plan or the length is a step.
  type Snap = { rewards: RewardWeek[]; endDate: string }
  const [past, setPast] = useState<Snap[]>([])
  const [future, setFuture] = useState<Snap[]>([])
  const [readinessOpen, setReadinessOpen] = useState(!!scene?.readiness)
  const [pausing, setPausing] = useState(false)
  // Where a calendar that is not saved yet will rank once it is. Saved ones use the offers order.
  const [rank, setRank] = useState<number | null>(null)
  // Problems are only called out once the user has tried to publish.
  const [attempted, setAttempted] = useState(false)
  // Set when Next is clicked while Settings is incomplete, which shows every problem at once.
  const [triedNext, setTriedNext] = useState(scene?.validate ? 1 : 0)
  // A scheduled or live calendar with complete Settings is already set up, so its two
  // sections are tabs rather than steps. Decided when it opens, so editing never swaps them.
  const [tabbed] = useState(() => !!offer && offer.status !== 'draft' && validate(settingsOf(offer)).valid)
  // A calendar opened without history starts at version 1, as it looked when opened.
  const [versions, setVersions] = useState<Version[]>(() =>
    offer?.versions ?? (offer ? [{ n: 1, savedAt: Date.now(), by: 'Dave', settings: settingsOf(offer), rewards: offer.rewards ?? [] }] : []),
  )

  const snapshot = JSON.stringify({ settings, rewards })
  const [savedAs, setSavedAs] = useState(snapshot)

  // Live and paused calendars have already started, so only the others are held to a future start date.
  const started = !!offer && hasPlayers(offer)
  const { errors, missing, valid } = validate(settings, started ? undefined : TODAY)
  const days = settings.startDate && settings.endDate ? Math.max(0, dayDiff(settings.startDate, settings.endDate) + 1) : 0


  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), (toast.seconds ?? 2.5) * 1000)
    return () => clearTimeout(t)
  }, [toast])

  // A place that sits further down the page scrolls into view once the editor has appeared.
  useEffect(() => {
    if (!scene?.scrollTo) return
    const t = setTimeout(() => document.getElementById(scene.scrollTo!)?.scrollIntoView({ block: 'center' }), 250)
    return () => clearTimeout(t)
  }, [scene])

  // Continuing is always possible. If Settings is incomplete, this shows what is missing
  // instead of leaving a disabled button that gives no reason.
  const goToRewards = () => {
    if (valid) return setStep(1)
    setTriedNext((n) => n + 1)
  }
  useEffect(() => {
    if (triedNext === 0) return
    // Wait for the errors to render, then bring the first one into view.
    const t = setTimeout(() => {
      const first = document.querySelector<HTMLElement>('.editor-body [aria-invalid="true"]')
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(t)
  }, [triedNext])

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
    onSave(next, rank ?? undefined)
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
    onFinish(persist(), 'Draft saved', rank ?? undefined)
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

  const readiness = readinessOf(settings, rewards, days, { offers, selfId: offerId, livePlayers: started ? LIVE_PLAYER_TOTAL : undefined })
  // Nothing can go to players until at least one day has a reward.
  const noRewards = readiness.filledDays === 0
  const noRewardsHint = noRewards ? 'Add a reward to at least one day first.' : undefined

  // ----- Priority

  const overlapIds = new Set(overlapsOf(settings, { offers, selfId: offerId }).map((o) => o.id))
  const spanOf = (start: string | null, end: string | null) => (start && end ? `${formatDay(start)} to ${formatDay(end)}` : 'No dates yet')
  const priority: PriorityItem[] = offers
    .filter((o) => o.type === 'reward-calendar')
    .map((o) =>
      o.id === offerId
        ? { id: o.id, name: settings.name.trim() || o.name, status: o.status, audience: audienceOf(settings).audience, dates: spanOf(settings.startDate, settings.endDate), self: true, overlapsSelf: false }
        : { id: o.id, name: o.name, status: o.status, audience: o.audience, dates: spanOf(o.start, o.end), self: false, overlapsSelf: overlapIds.has(o.id) },
    )
  if (!offerId) {
    priority.splice(Math.min(rank ?? priority.length, priority.length), 0, {
      id: NEW_ID,
      name: settings.name.trim() || 'New Reward Calendar',
      status: 'draft',
      audience: audienceOf(settings).audience,
      dates: spanOf(settings.startDate, settings.endDate),
      self: true,
      overlapsSelf: false,
    })
  }

  const movePriority = (ids: string[]) => {
    if (!offerId) setRank(ids.indexOf(NEW_ID))
    onReorder(ids.filter((id) => id !== NEW_ID))
  }

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
    onFinish(next, `${next.name} is ${next.status === 'live' ? 'live' : 'scheduled'}.`, rank ?? undefined)
  }

  const saveChanges = () => {
    const next = build(status)
    onFinish(next, `Changes to ${next.name} are saved.`, rank ?? undefined)
  }

  // Changes to a calendar players are on go to a manager for approval in Slack.
  const submitRequest = () => {
    const next = build(status)
    onFinish(next, 'Change request submitted', rank ?? undefined, `Your manager can approve the changes to ${next.name} in Slack.`)
  }

  const setPaused = (paused: boolean) => {
    const next = build(paused ? 'paused' : 'live')
    setPausing(false)
    onFinish(next, paused ? `${next.name} paused` : `${next.name} resumed`, rank ?? undefined)
  }

  return (
    <div className="editor">
      <header className="editor-bar">
        <div className="editor-title">
          <IconButton
            kind="Tertiary"
            size="Medium"
            aria-label="Back to offers"
            iconElement={<ArrowLeft className="size-4 text-primary" />}
            onClick={close}
          />
          <h1>{settings.name.trim() || 'New Reward Calendar'}</h1>
          <StatusPill status={status} />
        </div>

        {tabbed ? (
          <div className="editor-steps editor-steps--tabs">
            <EditorTabs tabs={EDITOR_STEPS} value={EDITOR_STEPS[step].id} onValueChange={(id) => setStep(id === 'rewards' ? 1 : 0)} />
          </div>
        ) : (
          <Stepper
            steps={EDITOR_STEPS}
            defaultValue={EDITOR_STEPS[step].id}
            value={EDITOR_STEPS[step].id}
            onValueChange={(id) => (id === 'rewards' ? goToRewards() : setStep(0))}
            className="editor-steps"
          >
            <StepperNav className="flex items-center gap-2">
              {EDITOR_STEPS.map((s, i) => (
                <StepperItem key={s.id} stepId={s.id}>
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
          <VersionHistory versions={versions} saving={snapshot !== savedAs} onRestore={restoreVersion} defaultOpen={scene?.history} />
          {step === 1 && (
            <Tabs className="device-toggle" value={device} onValueChange={(v) => setDevice(v as Device)}>
              <TabsList aria-label="Preview device">
                <TabsTrigger value="desktop" aria-label="Desktop preview">
                  <Monitor />
                </TabsTrigger>
                <TabsTrigger value="mobile" aria-label="Mobile preview">
                  <Smartphone />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          {isDraft ? (
            <Button variant="outline" size="lg" onClick={saveDraft}>
              Save draft
            </Button>
          ) : started ? (
            <>
              {status === 'live' ? (
                <Button variant="outline" size="lg" onClick={() => setPausing(true)}>
                  <Pause data-icon="inline-start" />
                  Pause
                </Button>
              ) : (
                <Button variant="outline" size="lg" onClick={() => setPaused(false)}>
                  <Play data-icon="inline-start" />
                  Resume
                </Button>
              )}
              <SubmitRequestButton
                disabled={noRewards}
                title={noRewardsHint}
                onClick={step === 1 ? () => attempt(submitRequest) : submitRequest}
              />
            </>
          ) : (
            <Button size="lg" disabled={noRewards} title={noRewardsHint} onClick={step === 1 ? () => attempt(saveChanges) : saveChanges}>
              Save changes
            </Button>
          )}
          {step === 0 ? (
            !tabbed && (
            <Button size="lg" onClick={goToRewards}>
              Next
            </Button>
            )
          ) : (
            isDraft && (
              <Button size="lg" disabled={noRewards} title={noRewardsHint} onClick={() => attempt(publish)}>
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
              live={started}
              onSubmitRequest={submitRequest}
              blocked={noRewards}
            />
          )}
        </div>
      </header>

      <div className={`editor-body${step === 1 ? ' editor-body--rewards' : ''}`}>
        {step === 0 ? (
          <SettingsStep settings={settings} errors={errors} missing={missing} overlaps={overlapsOf(settings, { offers, selfId: offerId })} priority={priority} live={started} showAll={triedNext > 0} onPriorityChange={movePriority} onChange={update} />
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
            live={started}
            initialPicker={scene?.picker}
            showIssues={attempted}
          />
        )}
      </div>

      {pausing && (
        <PauseDialog name={settings.name.trim() || 'This calendar'} players={LIVE_PLAYER_TOTAL} onClose={() => setPausing(false)} onConfirm={() => setPaused(true)} />
      )}

      <ToastHost toast={toast} className="toast">
        {(t) => (
          <ToastAlert
            kind={t.kind}
            message={t.message}
            description={t.description}
            countdown={t.undo ? t.seconds : undefined}
            action={
              t.undo
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
        )}
      </ToastHost>
    </div>
  )
}
