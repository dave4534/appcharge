import { Ellipsis, type LucideIcon } from 'lucide-react'
import { IconButton } from '@/components/IconButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type MenuButtonProps = {
  label: string
  items: { id: string; label: string; icon: LucideIcon; disabled?: boolean; destructive?: boolean }[]
  onSelect: (id: string) => void
}

// A "..." button that opens a shadcn dropdown menu. Destructive actions read in red.
export function MenuButton({ label, items, onSelect }: MenuButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<IconButton kind="Tertiary" size="Small" aria-label={label} iconElement={<Ellipsis className="size-4" />} />}
      />
      <DropdownMenuContent align="end" className="w-44" aria-label={label}>
        {items.map(({ id, label, icon: ItemIcon, disabled, destructive }) => (
          <DropdownMenuItem key={id} disabled={disabled} variant={destructive ? 'destructive' : 'default'} onClick={() => onSelect(id)}>
            <ItemIcon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
