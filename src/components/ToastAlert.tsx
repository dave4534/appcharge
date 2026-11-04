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
  onClose: () => void
  className?: string
}

// Every toast in the app: shadcn's Alert with a solid color, a title, an optional
// second line and a dismiss button.
export function ToastAlert({ kind = 'success', message, description, onClose, className }: ToastAlertProps) {
  const { icon: Icon, tone } = KINDS[kind]
  return (
    <Alert
      role="status"
      className={cn(
        'toast-alert border-transparent py-3 pr-12 pl-4 shadow-lg *:data-[slot=alert-description]:text-current/85',
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" />
      <AlertTitle>{message}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      <AlertAction className="top-2.5 right-2.5">
        <Button variant="ghost" size="icon-xs" className="text-current hover:bg-black/15 hover:text-current" aria-label="Dismiss" onClick={onClose}>
          <X />
        </Button>
      </AlertAction>
    </Alert>
  )
}
