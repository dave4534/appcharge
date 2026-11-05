import { useEffect, useState } from 'react'
import loaderSvg from '@/assets/loader/appcharge-loader-inline.svg?raw'

// The animation is a 5.2s loop: wordmark, then it collapses into a bouncing coin, then (from
// about 4.0s) the wordmark comes back. We want it to play once and end on the coin, so we hold
// until the coin has settled (about 3.1s), then freeze it and dissolve, well before the wordmark returns.
const SHOW_MS = 3100
const FADE_MS = 400
// People who prefer less motion get a short, still frame instead.
const REDUCED_SHOW_MS = 800

type Phase = 'wait' | 'show' | 'fade' | 'done'

// A white screen with the Appcharge loading animation, shown on every load and refresh, then
// dissolved into the app. The SVG is inline (not an <img>) and starts paused on its first frame.
// An image's animation clock starts when the file loads and cannot be restarted, so it could
// begin before it was ever painted or stutter while the app boots. Here the animation is released
// after the first paint, so it always runs from frame one, and the hold timer starts with it.
export function IntroLoader() {
  const [phase, setPhase] = useState<Phase>('wait')

  useEffect(() => {
    if (phase !== 'wait') return
    let id2 = 0
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setPhase('show'))
    })
    return () => {
      cancelAnimationFrame(id1)
      cancelAnimationFrame(id2)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'show') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setPhase('fade'), reduced ? REDUCED_SHOW_MS : SHOW_MS)
    return () => clearTimeout(t)
  }, [phase])

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
      <div
        className={`acl [&>svg]:h-auto [&>svg]:w-[min(360px,75vw)] ${phase === 'wait' ? '' : 'acl-run'} ${phase === 'fade' ? 'acl-hold' : ''}`}
        dangerouslySetInnerHTML={{ __html: loaderSvg }}
      />
    </div>
  )
}
