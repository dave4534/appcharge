import { useEffect, useState, type ReactNode } from 'react'

const FADE_IN_MS = 200
const FADE_OUT_MS = 300

type ToastHostProps<T> = {
  // The toast to show, or null for none.
  toast: T | null
  className?: string
  children: (toast: T) => ReactNode
}

// Holds a toast on screen long enough to dissolve: 200ms in, 300ms out.
export function ToastHost<T>({ toast, className, children }: ToastHostProps<T>) {
  const [shown, setShown] = useState<T | null>(toast)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (toast) {
      setShown(toast)
      // A moment later, so the first paint is transparent and the fade has somewhere to go.
      const start = setTimeout(() => setVisible(true), 20)
      return () => clearTimeout(start)
    }
    setVisible(false)
    const gone = setTimeout(() => setShown(null), FADE_OUT_MS)
    return () => clearTimeout(gone)
  }, [toast])

  if (!shown) return null
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? undefined : 'none',
        transition: `opacity ${visible ? FADE_IN_MS : FADE_OUT_MS}ms ${visible ? 'ease-out' : 'ease-in'}`,
      }}
    >
      {children(shown)}
    </div>
  )
}
