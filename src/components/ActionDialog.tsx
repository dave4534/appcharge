import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type Action = {
  label: ReactNode
  onClick?: () => void
  disabled?: boolean
  // Delete and clear actions use the Negative (destructive) color.
  destructive?: boolean
}

type ActionDialogProps = {
  size?: 'sm' | 'md' | 'lg'
  title: string
  description?: string
  children?: ReactNode
  primaryAction: Action
  secondaryAction?: Action
  onClose: () => void
  className?: string
}

const WIDTH = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-4xl' }

// The app's one dialog: shadcn's Dialog with a title, a description, a body that scrolls
// and the two actions in the footer. Every modal in the app goes through it.
export function ActionDialog({
  size = 'sm',
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  onClose,
  className,
}: ActionDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn('flex max-h-[85vh] flex-col', WIDTH[size], className)}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>

        {children && <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>}

        <DialogFooter>
          {secondaryAction && (
            <Button variant="outline" size="lg" disabled={secondaryAction.disabled} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          <Button
            size="lg"
            className={cn(primaryAction.destructive && 'bg-destructive text-white hover:bg-destructive/90')}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
