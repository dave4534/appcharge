import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// "New offer" opens a menu of offer types. Only reward calendars are built so far.
export function NewOfferMenu({ onNewCalendar }: { onNewCalendar: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="lg" />}>
        New offer
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" aria-label="Offer types">
        <DropdownMenuItem onClick={onNewCalendar}>Reward Calendar</DropdownMenuItem>
        <DropdownMenuItem disabled>Bundle</DropdownMenuItem>
        <DropdownMenuItem disabled>Promotion</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
