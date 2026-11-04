import { ArrowUpRight } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { SlackIcon } from '@/components/SlackIcon'

// Changes to a live calendar reach players, so a manager approves them in Slack first.
// The same button is the primary action in the editor header and a secondary one in the
// readiness checklist.
export function SubmitRequestButton({ label = 'Submit Request', ...props }: { label?: string } & Omit<ComponentProps<typeof Button>, 'children'>) {
  return (
    <Button size="lg" {...props}>
      <SlackIcon />
      {label}
      <ArrowUpRight />
    </Button>
  )
}
