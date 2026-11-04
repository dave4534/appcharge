import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button, Icon, IconButton } from '../../design-system/components'
import { walkthroughSteps } from './steps'
import type { PlaceId } from './places'
import './walkthrough.css'

// A guide from the designer. It is self-contained on purpose: it takes no props and
// does not touch the rest of the app, so it can be moved or removed in one line.
const KEY = 'appcharge-prototype:walkthrough'

type Saved = { seen: boolean; step: number }

function load(): Saved {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as Partial<Saved> | null
    const step = typeof saved?.step === 'number' ? saved.step : 0
    return { seen: saved?.seen === true, step: Math.min(Math.max(step, 0), walkthroughSteps.length - 1) }
  } catch {
    return { seen: false, step: 0 }
  }
}

function save(value: Saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Without storage the guide still works; it just won't remember.
  }
}

type WalkthroughProps = {
  // Opens a place in the prototype. The guide stays open and the reviewer stays in control.
  onShowPlace?: (id: PlaceId) => void
}

export function Walkthrough({ onShowPlace }: WalkthroughProps) {
  const [initial] = useState(load)
  const [seen, setSeen] = useState(initial.seen)
  const [step, setStep] = useState(initial.step)
  // The place the reviewer last opened from this step, so its note can show.
  const [place, setPlace] = useState<PlaceId | null>(null)
  // First visit: open once on the first step. After that the guide stays closed.
  const [open, setOpen] = useState(!initial.seen)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => save({ seen, step }), [seen, step])

  // Opening counts as seeing it, so the hint goes away and it won't auto-open again.
  useEffect(() => {
    if (open) setSeen(true)
  }, [open])

  const close = useCallback(() => {
    setOpen(false)
    avatarRef.current?.focus()
  }, [])

  const last = walkthroughSteps.length - 1
  const goTo = (i: number) => {
    setPlace(null)
    setStep(Math.min(Math.max(i, 0), last))
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      // Arrow keys step through the guide unless the person is typing somewhere.
      if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight') goTo(step + 1)
      if (e.key === 'ArrowLeft') goTo(step - 1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // goTo only uses state setters and constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close, last, step])

  const current = walkthroughSteps[step]
  const activePlace = current.places?.find((p) => p.id === place)

  return (
    <div className="walkthrough">
      {open && (
        <div className="walkthrough-panel" role="dialog" aria-label="Designer’s walkthrough" ref={panelRef}>
          <div className="walkthrough-close">
            <IconButton
              kind="Tertiary"
              size="Small"
              aria-label="Close walkthrough"
              onClick={close}
              iconElement={<Icon icon={X} size="Small" color="secondary" />}
            />
          </div>

          <ol className="walkthrough-steps" aria-label="Steps">
            {walkthroughSteps.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  className="walkthrough-dash"
                  data-active={i === step ? 'true' : 'false'}
                  aria-label={`Step ${i + 1}: ${s.title}`}
                  aria-current={i === step ? 'step' : undefined}
                  onClick={() => goTo(i)}
                />
              </li>
            ))}
          </ol>

          <div className="walkthrough-count">
            {step + 1} of {walkthroughSteps.length}
          </div>
          <h2 className="walkthrough-title">{current.title}</h2>
          <div className="walkthrough-body" aria-live="polite">
            {current.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          {current.places && onShowPlace && (
            <div className="walkthrough-places">
              <div className="walkthrough-places-label">Where to see it</div>
              <div className="walkthrough-chips">
                {current.places.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="walkthrough-chip"
                    data-active={p.id === place ? 'true' : 'false'}
                    aria-pressed={p.id === place}
                    onClick={() => {
                      setPlace(p.id)
                      onShowPlace(p.id)
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {activePlace && <p className="walkthrough-place-note">{activePlace.note}</p>}
            </div>
          )}

          <div className="walkthrough-actions">
            <Button kind="Tertiary" size="Medium" disabled={step === 0} onClick={() => goTo(step - 1)}>
              Back
            </Button>
            <Button kind="Primary" size="Medium" onClick={() => (step === last ? close() : goTo(step + 1))}>
              {step === last ? 'Done' : 'Next'}
            </Button>
          </div>
        </div>
      )}

      <div className="walkthrough-anchor">
        <button
          type="button"
          ref={avatarRef}
          className="walkthrough-avatar"
          aria-label={open ? 'Close the designer’s walkthrough' : 'Open the designer’s walkthrough'}
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
        >
          <img src="/walkthrough/dave.svg" alt="" width={56} height={56} />
        </button>
        {!seen && !open && <span className="walkthrough-hint">Walk me through it</span>}
      </div>
    </div>
  )
}
