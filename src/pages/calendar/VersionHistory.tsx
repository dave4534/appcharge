import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Version } from '../offers/data'

const when = (savedAt: number) =>
  new Date(savedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

type VersionHistoryProps = {
  versions: Version[]
  saving: boolean
  onRestore: (version: Version) => void
  // Opens with the list showing, for a place the walkthrough sends people to.
  defaultOpen?: boolean
}

// "Auto saved to version 52": opens the autosave history. The last version is the current
// one; earlier ones can be restored, which saves them as a new version.
export function VersionHistory({ versions, saving, onRestore, defaultOpen = false }: VersionHistoryProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [expanded, setExpanded] = useState(true)

  const current = versions[versions.length - 1]
  const earlier = versions.slice(0, -1).reverse()

  if (!current) {
    return (
      <span className="version-label" role="status">
        {saving ? 'Saving…' : 'Changes save automatically'}
      </span>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="version-trigger" aria-label="Version history">
        <span role="status" className="version-link">
          {saving ? 'Saving…' : <><span className="version-long">Auto saved to version {current.n}</span><span className="version-short">v{current.n}</span></>}
        </span>
        <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="version-popover max-h-[400px] w-80 gap-0 overflow-y-auto p-3">
        <div className="flex items-center gap-3 py-2">
          <span className="grid size-7 flex-none place-items-center rounded-full bg-primary" aria-hidden="true">
            <span className="size-2.5 rounded-full border-2 border-white" />
          </span>
          <span className="flex-1 text-base font-semibold text-primary">Current version</span>
          <span className="text-muted-foreground">v{current.n}</span>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 py-2 text-left"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="grid size-7 flex-none place-items-center rounded-full bg-foreground text-background" aria-hidden="true">
            <ChevronDown size={16} className={cn('transition-transform', !expanded && '-rotate-90')} />
          </span>
          <span className="text-base font-semibold">
            {earlier.length} autosave {earlier.length === 1 ? 'version' : 'versions'}
          </span>
        </button>

        {expanded && (
          <ul className="version-list">
            {earlier.map((v) => (
              <li key={v.n} className="version-item group">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{when(v.savedAt)}</span>
                  <span className="text-muted-foreground">v{v.n}</span>
                </div>
                <div className="flex min-h-7 items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-5 rounded-full bg-[var(--ui-border-color)]" aria-hidden="true" />
                    {v.by}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                    onClick={() => {
                      onRestore(v)
                      setOpen(false)
                    }}
                  >
                    Restore
                  </Button>
                </div>
              </li>
            ))}
            {earlier.length === 0 && <li className="version-item text-muted-foreground">No earlier versions yet.</li>}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
