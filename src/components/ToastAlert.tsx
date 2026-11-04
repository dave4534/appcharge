import { CheckCheck, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'warning' | 'info'

// A solid fill per kind, so a toast stands out from the page. Warning is yellow, so it
// takes dark text; the others take white.
const KINDS = {
  success: { icon: CheckCheck, tone: 'bg-[var(--positive-color)] text-white' },
  error: { icon: CircleAlert, tone: 'bg-[var(--negative-color)] text-white' },
  warning: { icon: TriangleAlert, tone: 'bg-[var(--warning-color)] text-[var(--primary-text-color)]' },
  info: { icon: Info, tone: 'bg-[var(--primary-color)] text-white' },
}

type ToastAlertProps = {
  kind?: ToastKind
  message: string
  description?: string
  // A ring in place of the icon that fills over this many seconds, until the toast goes.
  countdown?: number
  // A button on the right, such as Undo.
  action?: { label: string; onClick: () => void }
  onClose: () => void
  className?: string
}

// The ring is 16px across; its circumference sets the dash length that the animation drains.
const RING = 2 * Math.PI * 6.5

function CountdownRing({ seconds }: { seconds: number }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <circle
        cx="8"
        cy="8"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={RING}
        transform="rotate(-90 8 8)"
        style={{ animation: `toast-fill ${seconds}s linear forwards`, ['--ring' as string]: RING }}
      />
    </svg>
  )
}

// Every toast in the app: shadcn's Alert with a solid color, a title, an optional
// second line, an optional action and a dismiss button.
export function ToastAlert({ kind = 'success', message, description, countdown, action, onClose, className }: ToastAlertProps) {
  const { icon: Icon, tone } = KINDS[kind]
  return (
    <Alert
      role="status"
      className={cn(
        'toast-alert border-transparent py-3 pl-4 shadow-lg select-none *:data-[slot=alert-description]:text-current/85',
        action ? 'pr-32' : 'pr-12',
        tone,
        className,
      )}
    >
      {countdown ? <CountdownRing seconds={countdown} /> : <Icon aria-hidden="true" />}
      <AlertTitle>{message}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      <AlertAction className="top-2.5 right-2.5 flex items-center gap-1">
        {action && (
          <Button variant="ghost" size="sm" className="text-current underline hover:bg-black/15 hover:text-current" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        <Button variant="ghost" size="icon-xs" className="text-current hover:bg-black/15 hover:text-current" aria-label="Dismiss" onClick={onClose}>
          <X />
        </Button>
      </AlertAction>
    </Alert>
  )
}
