import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
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

const steps = ['Settings', 'Rewards']

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
          <button type="button" className="icon-button" aria-label="Back to offers" onClick={close}>
            <Icon name="arrowLeft" size={18} />
          </button>
          <h1>{settings.name.trim() || 'New Reward Calendar'}</h1>
          <StatusPill status="draft" />
        </div>

        <ol className="stepper" aria-label="Steps">
          {steps.map((label, i) => (
            <li key={label} aria-current={i === step ? 'step' : undefined} className={i === step ? 'is-current' : ''}>
              <span className="step-number">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <div className="editor-actions">
          <button type="button" className="btn-secondary" onClick={saveDraft}>
            Save draft
          </button>
          {step === 0 && (
            <button
              type="button"
              className="btn-primary"
              disabled={!valid}
              title={valid ? undefined : `Still needed: ${missing.join(', ')}`}
              onClick={() => setStep(1)}
            >
              Next
            </button>
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
              <button type="button" className="btn-secondary" onClick={() => setStep(0)}>
                Back to settings
              </button>
            </section>
          </div>
        )}
      </div>

      {toast && (
        <div className="toast" role="status">
          Draft saved
        </div>
      )}
    </div>
  )
}
