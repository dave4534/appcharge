import { useEffect, useState } from 'react'
import loader from '@/assets/loader/appcharge-loader.svg'

// How long the animation plays before the screen fades away, and how long the fade takes.
const SHOW_MS = 2600
const FADE_MS = 400
// People who prefer less motion get a short, still frame instead.
const REDUCED_SHOW_MS = 800
// If the image cannot load, do not hold the app back.
const GIVE_UP_MS = 1500

const SEEN = 'appcharge-prototype:intro-seen'

// The loading screen is for the first thing a visitor sees, so it plays once per browser
// session. Add ?intro to the address to see it again.
const shouldPlay = () => {
  try {
    if (new URLSearchParams(window.location.search).has('intro')) return true
    return window.sessionStorage.getItem(SEEN) === null
  } catch {
    return true
  }
}

type Phase = 'show' | 'fade' | 'done'

// A white screen with the Appcharge loading animation (an SVG with its own CSS animation),
// shown for a couple of seconds on the first load and then dissolved into the app.
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>(() => (shouldPlay() ? 'show' : 'done'))
  // The timer starts when the image has loaded, so the whole animation is seen from its start.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (phase === 'done') return
    try {
      window.sessionStorage.setItem(SEEN, '1')
    } catch {
      // Private windows can refuse storage: the intro then simply plays again next time.
    }
  }, [phase])

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
        width={420}
        height={240}
        style={{ width: 'min(420px, 80vw)', height: 'auto' }}
        onLoad={() => setReady(true)}
        onError={() => setReady(false)}
      />
    </div>
  )
}
