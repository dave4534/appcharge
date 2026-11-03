import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button, Icon, IconButton, MultiStepIndicator, Toast } from '../../design-system/components'
import type { Offer } from '../offers/data'
import { StatusPill } from '../offers/parts'
import { SettingsStep } from './SettingsStep'
import { audienceOf, emptySettings, validate, type CalendarSettings } from './settings'
import './calendar.css'

type CalendarEditorProps = {
  // The draft being reopened, or null for a new calendar.
  offer: Offer | null
  onSave: (offer: Offer) => void
  onClose: () => void
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

export function CalendarEditor({ offer, onSave, onClose }: CalendarEditorProps) {
  const [settings, setSettings] = useState(() => settingsOf(offer))
  const [savedAs, setSavedAs] = useState(() => JSON.stringify(settingsOf(offer)))
  const [offerId, setOfferId] = useState(offer?.id ?? null)
  const [step, setStep] = useState(0)
  const [toast, setToast] = useState(false)

  const { errors, missing, valid } = validate(settings)
  const dirty = JSON.stringify(settings) !== savedAs

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(false), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const update = (patch: Partial<CalendarSettings>) => setSettings((s) => ({ ...s, ...patch }))

  const saveDraft = () => {
    const id = offerId ?? `calendar-${Date.now()}`
    onSave({
      ...offer,
      id,
      name: settings.name.trim() || 'Untitled calendar',
      type: 'reward-calendar',
      ...audienceOf(settings),
      start: settings.startDate || null,
      end: settings.endDate || null,
      status: 'draft',
      settings,
    })
    setOfferId(id)
    setSavedAs(JSON.stringify(settings))
    setToast(true)
  }

  const close = () => {
    if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return
    onClose()
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
          <StatusPill status="draft" />
        </div>

        <MultiStepIndicator size="Regular" orientation="Horizontal" currentStep={step + 1} steps={steps} />

        <div className="editor-actions">
          <Button kind="Secondary" size="Large" onClick={saveDraft}>
            Save draft
          </Button>
          {step === 0 && (
            <Button
              kind="Primary"
              size="Large"
              disabled={!valid}
              title={valid ? undefined : `Still needed: ${missing.join(', ')}`}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          )}
        </div>
      </header>

      <div className="editor-body">
        {step === 0 ? (
          <SettingsStep settings={settings} errors={errors} missing={missing} onChange={update} />
        ) : (
          <div className="form">
            <section className="card">
              <h2>Rewards</h2>
              <p className="card-hint">The Rewards step is the next wireframe. Your settings are saved with the draft.</p>
              <Button kind="Secondary" size="Medium" onClick={() => setStep(0)}>
                Back to settings
              </Button>
            </section>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast" role="status">
          <Toast type="Positive" onClose={() => setToast(false)}>
            Draft saved
          </Toast>
        </div>
      )}
    </div>
  )
}
