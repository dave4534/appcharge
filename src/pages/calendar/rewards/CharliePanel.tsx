import { ArrowUp, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Accordion, Button, Icon, IconButton, Link, TextField } from '../../../design-system/components'
import type { Intent } from './charlie'

export type Message = {
  id: number
  role: 'user' | 'charlie'
  text: string
  // Quick replies Charlie offers after an answer.
  follow?: { label: string; intent: Intent }[]
}

type CharliePanelProps = {
  messages: Message[]
  // The first day inside the date range that has no reward yet, if any.
  nextEmpty: { week: number; day: number } | null
  onIntent: (intent: Intent, label: string) => void
  onSend: (text: string) => void
  onReset: () => void
  onClose: () => void
}

export function CharliePanel({ messages, nextEmpty, onIntent, onSend, onReset, onClose }: CharliePanelProps) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages])

  const send = () => {
    if (!draft.trim()) return
    onSend(draft.trim())
    setDraft('')
  }

  const ask = (intent: Intent, label: string, disabled = false) => (
    <Button key={label} kind="Secondary" size="Small" disabled={disabled} onClick={() => onIntent(intent, label)}>
      {label}
    </Button>
  )

  return (
    <aside className="charlie" aria-label="Charlie, your reward assistant">
      <header className="charlie-head">
        <h2>Charlie</h2>
        <IconButton kind="Tertiary" size="Small" aria-label="Close Charlie" iconElement={<Icon icon={X} size="Medium" color="secondary" />} onClick={onClose} />
      </header>

      <div className="charlie-body">
        {messages.length === 0 ? (
          <div className="charlie-start">
            <span className="charlie-spark" aria-hidden="true">
              <Icon icon={Sparkles} size="Large" color="primary" />
            </span>
            <h3>What is next?</h3>
            <Accordion
              items={[
                {
                  id: 'suggest',
                  title: 'Suggest rewards',
                  content: (
                    <div className="charlie-options">
                      {ask('suggest-day', nextEmpty ? `Suggest Week ${nextEmpty.week + 1}, Day ${nextEmpty.day + 1}` : 'Suggest the next empty day', !nextEmpty)}
                    </div>
                  ),
                },
                {
                  id: 'review',
                  title: 'Review my weeks',
                  content: <div className="charlie-options">{ask('review', 'Check for mistakes')}</div>,
                },
                {
                  id: 'explain',
                  title: 'Explain this calendar',
                  content: <div className="charlie-options">{ask('explain', 'Explain the rules and rewards')}</div>,
                },
              ]}
            />
          </div>
        ) : (
          <div className="charlie-chat" role="log" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`bubble bubble--${m.role}`}>
                <p>{m.text}</p>
                {m.follow && (
                  <div className="charlie-options">
                    {m.follow.map((f) => ask(f.intent, f.label))}
                  </div>
                )}
              </div>
            ))}
            <Link size="Small" href="#" onClick={(e) => { e.preventDefault(); onReset() }}>
              Back to options
            </Link>
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form
        className="charlie-input"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <TextField
          size="Large"
          label=""
          showHelper={false}
          showIconRight={false}
          placeholder="Ask for changes"
          aria-label="Ask Charlie for changes"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <IconButton kind="Primary" size="Medium" aria-label="Send" type="submit" disabled={!draft.trim()} iconElement={<Icon icon={ArrowUp} size="Medium" color="on-primary" />} />
      </form>
      <p className="charlie-note">Charlie follows your reward rules. Amounts are illustrative.</p>
    </aside>
  )
}
