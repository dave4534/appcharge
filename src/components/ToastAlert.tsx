import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type ToastKind = 'success' | 'error' | 'warning' | 'info'

const ICONS = {
  success: { icon: CircleCheck, color: 'var(--positive-color)' },
  error: { icon: CircleAlert, color: 'var(--negative-color)' },
  warning: { icon: TriangleAlert, color: 'var(--warning-color)' },
  info: { icon: Info, color: 'var(--primary-color)' },
}

type ToastAlertProps = {
  kind?: ToastKind
  message: string
  onClose: () => void
  className?: string
}

// Every toast in the app: shadcn's basic Alert. Only the icon carries color, so a
// success is a green check on a plain card.
export function ToastAlert({ kind = 'success', message, onClose, className }: ToastAlertProps) {
  const { icon: Icon, color } = ICONS[kind]
  return (
    <Alert className={`toast-alert pr-10 shadow-lg ${className ?? ''}`} role="status">
      <Icon style={{ color }} aria-hidden="true" />
      <AlertTitle>{message}</AlertTitle>
      <AlertAction>
        <Button variant="ghost" size="icon-xs" aria-label="Dismiss" onClick={onClose}>
          <X />
        </Button>
      </AlertAction>
    </Alert>
  )
}
