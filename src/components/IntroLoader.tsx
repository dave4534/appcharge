import { useEffect, useState } from 'react'
import loader from '@/assets/loader/appcharge-loader.svg'

// How long the animation plays before the screen fades away, and how long the fade takes.
// The animation loops every 5.2s and the wordmark is whole again by about 4.65s, so we hold
// until just after that and the whole thing is always seen.
const SHOW_MS = 4900
const FADE_MS = 400
// People who prefer less motion get a short, still frame instead.
const REDUCED_SHOW_MS = 800
// If the image cannot load, do not hold the app back.
const GIVE_UP_MS = 4000

type Phase = 'show' | 'fade' | 'done'

// A white screen with the Appcharge loading animation (an SVG with its own CSS animation),
// shown for a couple of seconds on every load and refresh, then dissolved into the app.
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>('show')
  // The timer starts after the image has loaded, decoded and painted, because the animation
  // inside the SVG only begins at its first paint, not at the load event.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (phase !== 'show') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wait = ready ? (reduced ? REDUCED_SHOW_MS : SHOW_MS) : GIVE_UP_MS
    const t = setTimeout(() => setPhase('fade'), wait)
    return () => clearTimeout(t)
  }, [phase, ready])

  useEffect(() => {
    if (phase !== 'fade') return
    const t = setTimeout(() => setPhase('done'), FADE_MS)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      role="status"
      aria-label="Loading Appcharge"
      className="fixed inset-0 z-[100] grid place-items-center bg-white"
      style={{
        opacity: phase === 'fade' ? 0 : 1,
        pointerEvents: phase === 'fade' ? 'none' : undefined,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <img
        src={loader}
        alt=""
        width={360}
        height={206}
        style={{ width: 'min(360px, 75vw)', height: 'auto' }}
        onLoad={(e) => {
          const img = e.currentTarget
          const start = () => requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
          img.decode().then(start, start)
        }}
        onError={() => setReady(false)}
      />
    </div>
  )
}
