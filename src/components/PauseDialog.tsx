import { ActionDialog } from '@/components/ActionDialog'

type PauseDialogProps = {
  name: string
  // How many players are on the calendar right now.
  players: number
  onConfirm: () => void
  onClose: () => void
}

// Pausing stops a calendar from reaching new players. Players already on it keep going,
// so the dialog says exactly who is and is not affected before it happens.
export function PauseDialog({ name, players, onConfirm, onClose }: PauseDialogProps) {
  return (
    <ActionDialog
      size="sm"
      title={`Pause ${name}?`}
      description={`${name} will stay live for the ${players.toLocaleString('en-US')} players already on it, but it won't be shown to new players. You can resume it at any time.`}
      onClose={onClose}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{ label: 'Pause calendar', onClick: onConfirm }}
    />
  )
}
