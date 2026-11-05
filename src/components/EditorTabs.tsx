import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type EditorTabsProps = {
  tabs: { id: string; title: string }[]
  value: string
  // Tabs that cannot be opened yet.
  disabled?: string[]
  onValueChange: (id: string) => void
}

// shadcn Studio's animated underline tabs (tabs-29). The list is as tall as the header and
// has no baseline, so the moving underline sits on the header's bottom edge.
export function EditorTabs({ tabs, value, disabled = [], onValueChange }: EditorTabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [line, setLine] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const el = refs.current[tabs.findIndex((t) => t.id === value)]
    if (el) setLine({ left: el.offsetLeft, width: el.offsetWidth })
  }, [value, tabs])

  return (
    <Tabs value={value} onValueChange={onValueChange} className="editor-tabs h-full gap-0">
      <TabsList className="relative h-full rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-full">
        {tabs.map((tab, index) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={disabled.includes(tab.id)}
            ref={(el: HTMLButtonElement | null) => {
              refs.current[index] = el
            }}
            className="relative z-10 h-full rounded-none border-0 bg-transparent! px-5 text-base data-active:shadow-none!"
          >
            {tab.title}
          </TabsTrigger>
        ))}
        <motion.div
          className="absolute -bottom-px h-0.5 bg-primary"
          animate={{ left: line.left, width: line.width }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        />
      </TabsList>
    </Tabs>
  )
}
