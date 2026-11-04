import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Icon-only buttons, mapped onto shadcn's Button:
//   kind  Primary -> default   Secondary -> outline   Tertiary -> ghost
//   size  XXS 20px, XS 24px (icon-xs), Small 28px (icon-sm), Medium 32px (icon), Large 36px (icon-lg)
// Hover, focus, pressed and disabled states come from the shadcn Button.
const VARIANT = { Primary: 'default', Secondary: 'outline', Tertiary: 'ghost' } as const
const SIZE = { XXS: 'icon-xs', XS: 'icon-xs', Small: 'icon-sm', Medium: 'icon', Large: 'icon-lg' } as const

type IconButtonProps = Omit<React.ComponentProps<typeof Button>, 'variant' | 'size' | 'children'> & {
  kind?: keyof typeof VARIANT
  size?: keyof typeof SIZE
  iconElement: ReactNode
  'aria-label': string
}

export function IconButton({ kind = 'Primary', size = 'Medium', iconElement, className, ...props }: IconButtonProps) {
  return (
    <Button variant={VARIANT[kind]} size={SIZE[size]} className={cn(size === 'XXS' && 'size-5', className)} {...props}>
      {iconElement}
    </Button>
  )
}
