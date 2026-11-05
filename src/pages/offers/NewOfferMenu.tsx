import { ChevronDown } from 'lucide-react'
import { navSections } from '@/components/nav'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// The offer types are the Offers section of the left nav, in the same order. Only reward
// calendars can be created so far; the rest do nothing, as they do in the nav.
const offerTypes = navSections.find((s) => s.id === 'offers')!.items

export function NewOfferMenu({ onNewCalendar }: { onNewCalendar: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="lg" />}>
        New offer
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" aria-label="Offer types">
        {offerTypes.map((type) => (
          <DropdownMenuItem
            key={type.id}
            disabled={type.id !== 'reward-calendars'}
            onClick={() => type.id === 'reward-calendars' && onNewCalendar()}
          >
            <type.icon />
            {type.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
