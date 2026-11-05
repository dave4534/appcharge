import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { ArrowUpRight, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { walkthroughSteps, type WalkthroughBlock } from './steps'
import { Lightbox } from './Lightbox'
import type { PlaceId } from './places'
import './walkthrough.css'

// A guide from the designer. It stays out of the app's way: the app only hands it a way to
// open places in the prototype, and it can be dragged anywhere on screen.
const KEY = 'appcharge-prototype:walkthrough'

const AVATAR = 58 // circle size in px (1px stroke, 8px padding, 40px face)
const ABOVE_MCP = 32 // default gap between the face and the Get Appcharge MCP button
const MARGIN = 8 // keeps the circle off the window edge
const GAP = 16 // between the circle and the card
// If nobody has touched the face by then, the guide opens on its own.
const AUTO_OPEN_MS = 30_000

type Point = { x: number; y: number }
type Saved = { seen: boolean; step: number; pos: Point | null }

function load(): Saved {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as Partial<Saved> | null
    const step = typeof saved?.step === 'number' ? saved.step : 0
    const pos = saved?.pos && typeof saved.pos.x === 'number' && typeof saved.pos.y === 'number' ? saved.pos : null
    return { seen: saved?.seen === true, step: Math.min(Math.max(step, 0), walkthroughSteps.length - 1), pos }
  } catch {
    return { seen: false, step: 0, pos: null }
  }
}

function save(value: Saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    // Without storage the guide still works; it just won't remember.
  }
}

const clampToWindow = ({ x, y }: Point): Point => ({
  x: Math.min(Math.max(x, MARGIN), Math.max(MARGIN, window.innerWidth - AVATAR - MARGIN)),
  y: Math.min(Math.max(y, MARGIN), Math.max(MARGIN, window.innerHeight - AVATAR - MARGIN)),
})

const timeOfDay = () => {
  const hour = new Date().getHours()
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
}

// {carlton} marks where Carlton sits inline in the text, about four spaces after the smiley.
const withCarlton = (text: string) =>
  text.split('{carlton}').map((part, i, all) => (
    <Fragment key={i}>
      {part}
      {i < all.length - 1 && <img className="walkthrough-carlton" src="/walkthrough/carlton.gif" alt="" draggable={false} />}
    </Fragment>
  ))

// Plain text with [label](url) links; {timeOfDay} becomes morning, afternoon or evening.
// A link starting with image: opens that image in the lightbox instead of leaving the page.
function RichText({ text, onImage }: { text: string; onImage: (src: string) => void }) {
  const parts: Array<string | { label: string; href: string }> = []
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g
  const source = text.replace('{timeOfDay}', timeOfDay())
  let last = 0
  for (const m of source.matchAll(pattern)) {
    parts.push(source.slice(last, m.index), { label: m[1].trim(), href: m[2] })
    last = m.index + m[0].length
  }
  parts.push(source.slice(last))
  return (
    <>
      {parts.map((p, i) => {
        if (typeof p === 'string') return <Fragment key={i}>{withCarlton(p)}</Fragment>
        if (p.href.startsWith('image:')) {
          return (
            <button key={i} type="button" className="walkthrough-link" onClick={() => onImage(p.href.slice('image:'.length))}>
              {p.label}
            </button>
          )
        }
        return (
          <a key={i} href={p.href} target="_blank" rel="noreferrer">
            {p.label}
          </a>
        )
      })}
    </>
  )
}

// Paragraphs stay paragraphs; neighbouring bullets share one list, each with its 16px icon.
function Blocks({ blocks, onImage }: { blocks: WalkthroughBlock[]; onImage: (src: string) => void }) {
  const groups: Array<{ list: boolean; items: WalkthroughBlock[] }> = []
  for (const b of blocks) {
    const list = typeof b !== 'string'
    const tail = groups[groups.length - 1]
    if (tail && tail.list === list && list) tail.items.push(b)
    else groups.push({ list, items: [b] })
  }
  return (
    <>
      {groups.map((g, gi) =>
        g.list ? (
          <ul className="walkthrough-list" key={gi}>
            {g.items.map((b) => {
              const { icon: Icon, text } = b as Exclude<WalkthroughBlock, string>
              return (
                <li key={text}>
                  <Icon className="walkthrough-bullet" size={16} aria-hidden="true" />
                  <span>
                    <RichText text={text} onImage={onImage} />
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          g.items.map((b) => (
            <p key={b as string}>
              <RichText text={b as string} onImage={onImage} />
            </p>
          ))
        ),
      )}
    </>
  )
}

type WalkthroughProps = {
  // Opens a place in the prototype. The guide stays open and the reviewer stays in control.
  onShowPlace?: (id: PlaceId) => void
}

export function Walkthrough({ onShowPlace }: WalkthroughProps) {
  const [initial] = useState(load)
  const [seen, setSeen] = useState(initial.seen)
  // Every page load starts the guide on its first step.
  const [step, setStep] = useState(0)
  // Where the circle was dragged to. Null until then, so it keeps its default spot.
  const [pos, setPos] = useState<Point | null>(() => (initial.pos ? clampToWindow(initial.pos) : null))
  // The image open in the lightbox, if any.
  const [image, setImage] = useState<string | null>(null)
  // First visit: open once on the first step. After that the guide stays closed.
  const [open, setOpen] = useState(!initial.seen)
  // Which side of the circle the card sits on, and how tall it may be there.
  const [layout, setLayout] = useState<{ below: boolean; alignRight: boolean; maxHeight: number }>({ below: false, alignRight: false, maxHeight: 480 })

  // Where the face starts on landing: ABOVE_MCP px above the Get Appcharge MCP button.
  const [defaultTop, setDefaultTop] = useState<number | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  // The scrolling text of the current step, which starts again at the top on every step.
  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  // Any press on the face counts as the reviewer finding it, so the automatic opening is cancelled.
  const touchedFace = useRef(false)
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null)
  const justDragged = useRef(false)

  useEffect(() => save({ seen, step: 0, pos }), [seen, pos])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!touchedFace.current) setOpen(true)
    }, AUTO_OPEN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // Opening counts as seeing it, so the hint goes away and it won't auto-open again.
  useEffect(() => {
    if (open) setSeen(true)
  }, [open])

  // Keep the default spot tied to the MCP button, so it stays put as the window changes size.
  useLayoutEffect(() => {
    const place = () => {
      const mcp = document.querySelector<HTMLElement>('.mcp-cta')
      if (!mcp) return
      setDefaultTop(mcp.getBoundingClientRect().top - ABOVE_MCP - AVATAR)
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  // A smaller window can leave the circle out of view; pull it back in.
  useEffect(() => {
    const onResize = () => setPos((p) => (p ? clampToWindow(p) : p))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Put the card on whichever side of the circle has more room, and cap its height to fit.
  const place_ = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const r = root.getBoundingClientRect()
    const above = r.top - GAP - MARGIN
    const below = window.innerHeight - r.bottom - GAP - MARGIN
    const isBelow = below > above
    setLayout({
      below: isBelow,
      alignRight: r.left + 360 > window.innerWidth - MARGIN,
      maxHeight: Math.max(220, Math.min(isBelow ? below : above, 640)),
    })
  }, [])
  useLayoutEffect(() => {
    if (open) place_()
  }, [open, pos, place_])
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', place_)
    return () => window.removeEventListener('resize', place_)
  }, [open, place_])

  const close = useCallback(() => {
    setOpen(false)
    avatarRef.current?.focus()
  }, [])

  const last = walkthroughSteps.length - 1
  const goTo = useCallback(
    (i: number) => {
      setStep(Math.min(Math.max(i, 0), last))
    },
    [last],
  )

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
  }, [open, close, goTo, step])

  // Dragging the circle moves the card with it. A small movement still counts as a click.
  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    touchedFace.current = true
    if (e.button !== 0 || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    drag.current = { startX: e.clientX, startY: e.clientY, originX: rect.left, originY: rect.top, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved && Math.hypot(dx, dy) < 4) return
    d.moved = true
    setPos(clampToWindow({ x: d.originX + dx, y: d.originY + dy }))
  }
  const onPointerUp = () => {
    if (drag.current?.moved) justDragged.current = true
    drag.current = null
  }
  const onAvatarClick = () => {
    touchedFace.current = true
    if (justDragged.current) {
      justDragged.current = false
      return
    }
    if (open) close()
    else setOpen(true)
  }

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [step])

  const current = walkthroughSteps[step]

  return (
    <div
      className="walkthrough"
      ref={rootRef}
      style={
        pos
          ? { left: pos.x, top: pos.y, bottom: 'auto' }
          : defaultTop !== null
            ? { top: defaultTop, bottom: 'auto' }
            : undefined
      }
    >
      {open && (
        <div
          className="walkthrough-panel"
          role="dialog"
          aria-label="Designer’s walkthrough"
          data-below={layout.below}
          data-align={layout.alignRight ? 'right' : 'left'}
          style={{ maxHeight: layout.maxHeight }}
        >
          <div className="walkthrough-top">
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
            <Button variant="ghost" size="icon-sm" aria-label="Close walkthrough" onClick={close}>
              <X />
            </Button>
          </div>

          <h2 className="walkthrough-title">{current.title}</h2>

          <div className="walkthrough-scroll" ref={scrollRef} aria-live="polite">
            <div className="walkthrough-body">
              <Blocks blocks={current.body} onImage={setImage} />
            </div>

            {current.places && onShowPlace && (
              <div className="walkthrough-places">
                <div className="walkthrough-places-label">Where to see it</div>
                <div className="walkthrough-chips">
                  {current.places.map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      variant="outline"
                      className="rounded-full px-3 text-[15px]"
                      onClick={() => onShowPlace(p.id)}
                    >
                      {p.label}
                      <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="walkthrough-actions">
            <Button variant="ghost" size="lg" className="text-[15px]" disabled={step === 0} onClick={() => goTo(step - 1)}>
              Back
            </Button>
            <Button size="lg" className="text-[15px]" onClick={() => goTo(step === last ? 0 : step + 1)}>
              {step === last ? (
                <>
                  Start over
                  <RotateCcw data-icon="inline-end" aria-hidden="true" />
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      )}

      {image && <Lightbox src={image} onClose={() => setImage(null)} />}


      <div className="walkthrough-anchor">
        <button
          type="button"
          ref={avatarRef}
          className="walkthrough-avatar"
          aria-label={open ? 'Close the designer’s walkthrough' : 'Open the designer’s walkthrough'}
          aria-expanded={open}
          title="Drag to move"
          // While the guide is closed, a rainbow ring draws attention to the face. It stops while the guide is open.
          data-attention={open ? 'false' : 'true'}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={onAvatarClick}
        >
          <img src="/walkthrough/dave.svg" alt="" draggable={false} />
        </button>
        {!seen && !open && <span className="walkthrough-hint">Walk me through it</span>}
      </div>
    </div>
  )
}
