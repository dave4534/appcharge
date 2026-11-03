import { useState, type DragEvent, type KeyboardEvent } from 'react'

type Drop = { id: string; after: boolean } | null

// Drag-and-drop (and arrow-key) reordering shared by the list and timeline views.
// `move` places `id` before or after `targetId`; the page decides what that means
// for the full priority order.
export function useReorder(
  ids: string[],
  enabled: boolean,
  move: (id: string, targetId: string, after: boolean) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [drop, setDrop] = useState<Drop>(null)

  const reset = () => {
    setDragId(null)
    setDrop(null)
  }

  const rowClass = (id: string) => {
    if (id === dragId) return 'is-dragging'
    if (drop?.id === id) return drop.after ? 'drop-after' : 'drop-before'
    return ''
  }

  const rowProps = (id: string) => ({
    'data-row': true,
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!dragId) return
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const after = e.clientY > rect.top + rect.height / 2
      setDrop((d) => (d?.id === id && d.after === after ? d : { id, after }))
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      if (!dragId || !drop) return
      e.preventDefault()
      if (drop.id !== dragId) move(dragId, drop.id, drop.after)
      reset()
    },
  })

  const handleProps = (id: string) => ({
    draggable: enabled,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      setDragId(id)
      e.dataTransfer.effectAllowed = 'move'
      const row = e.currentTarget.closest('[data-row]')
      if (row) e.dataTransfer.setDragImage(row, 24, 24)
    },
    onDragEnd: reset,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const i = ids.indexOf(id)
      if (e.key === 'ArrowUp' && i > 0) {
        e.preventDefault()
        move(id, ids[i - 1], false)
      } else if (e.key === 'ArrowDown' && i < ids.length - 1) {
        e.preventDefault()
        move(id, ids[i + 1], true)
      }
    },
  })

  return { rowClass, rowProps, handleProps }
}
