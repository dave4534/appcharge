import { CircleAlert, Minus, Plus, Sparkles, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Dropdown,
  Icon,
  IconButton,
  Label,
  Modal,
  Search,
  TextField,
} from '../../../design-system/components'
import { ensureWeeks, setDay } from './plan'
import { RewardIcon } from './tiles'
import {
  PICKABLE,
  REWARD_DEFS,
  REWARD_TYPES,
  chipsOf,
  daySummary,
  formatChipsExact,
  formatQuantity,
  parseQuantity,
  suggestDay,
  validatePlan,
  type DayRewards,
  type RewardKind,
  type RewardWeek,
} from './rules'

type Selection = Partial<Record<RewardKind, number>>

const toSelection = (items: DayRewards): Selection => Object.fromEntries(items.map((i) => [i.kind, i.quantity]))
const toItems = (selection: Selection): DayRewards =>
  PICKABLE.filter((k) => selection[k] !== undefined).map((kind) => ({ kind, quantity: selection[kind] as number }))

const categories = [...new Set(PICKABLE.map((k) => REWARD_DEFS[k].category))]

const clamp = (kind: RewardKind, value: number) => {
  const def = REWARD_DEFS[kind]
  return Math.max(def.min, def.max ? Math.min(def.max, value) : value)
}

type RewardPickerProps = {
  week: number
  day: number
  plan: RewardWeek[]
  activeDays: number
  onClose: () => void
  onSave: (items: DayRewards) => void
}

export function RewardPicker({ week, day, plan, activeDays, onClose, onSave }: RewardPickerProps) {
  const current = plan[week]?.[day] ?? []
  const isNew = current.length === 0

  // An empty day starts with the suggestion already picked, so accepting it is one click.
  const suggestion = useMemo(() => suggestDay(plan, week, day), [plan, week, day])
  const [showSuggestion, setShowSuggestion] = useState(isNew)
  const [selection, setSelection] = useState<Selection>(() => toSelection(isNew ? suggestion.items : current))
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState<{ kind: RewardKind; text: string } | null>(null)
  const [invalid, setInvalid] = useState<RewardKind | null>(null)

  const rows = PICKABLE.filter((kind) => {
    const def = REWARD_DEFS[kind]
    const q = query.trim().toLowerCase()
    return (
      (type === 'all' || def.type === type) &&
      (category === 'all' || def.category === category) &&
      (!q || def.name.toLowerCase().includes(q) || def.sku.includes(q))
    )
  })

  const items = toItems(selection)
  // While the suggestion is neither accepted nor rejected, nothing can be added by accident.
  const suggestionPending = showSuggestion && isNew

  // Run the same guardrails the calendar uses, on the day as it would be saved.
  const issues = useMemo(() => {
    const preview = setDay(ensureWeeks(plan, week + 1), week, day, items)
    return validatePlan(preview, activeDays).filter((i) => i.week === week && i.day === day)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, week, day, activeDays, selection])
  const blocked = issues.some((i) => i.severity === 'error')

  const defaultQuantity = (kind: RewardKind) => {
    const suggested = suggestion.items.find((i) => i.kind === kind)
    if (suggested) return suggested.quantity
    if (kind === 'chips') return chipsOf(plan[week]?.[day - 1] ?? []) || 500_000_000
    return REWARD_DEFS[kind].step
  }

  const toggle = (kind: RewardKind) =>
    setSelection((s) => {
      const next = { ...s }
      if (next[kind] === undefined) next[kind] = defaultQuantity(kind)
      else delete next[kind]
      return next
    })

  const setQuantity = (kind: RewardKind, value: number) => setSelection((s) => ({ ...s, [kind]: clamp(kind, value) }))

  const step = (kind: RewardKind, direction: 1 | -1) => {
    const now = selection[kind]
    if (now === undefined) return
    setInvalid(null)
    setQuantity(kind, now + direction * REWARD_DEFS[kind].step)
  }

  const onType = (kind: RewardKind, text: string) => {
    setEditing({ kind, text })
    const parsed = parseQuantity(kind, text)
    if (parsed === null || parsed <= 0) setInvalid(kind)
    else {
      setInvalid(null)
      // Typed amounts are kept as entered (no clamping) so a wrong digit stays visible
      // and the guardrails can flag it.
      setSelection((s) => ({ ...s, [kind]: parsed }))
    }
  }

  const accept = () => onSave(suggestion.items)
  const reject = () => {
    setShowSuggestion(false)
    setSelection({})
  }

  return (
    <Modal
      size="Large"
      scroll
      title={`Select reward for Day ${day + 1}`}
      subtitle={`Week ${week + 1}. Amounts are illustrative.`}
      onClose={onClose}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{
        label: isNew ? `Add to Day ${day + 1}` : `Save Day ${day + 1}`,
        disabled: suggestionPending || items.length === 0 || blocked || invalid !== null,
        onClick: () => onSave(items),
      }}
    >
      <div className="picker">
        {suggestionPending && (
          <div className="suggest-banner">
            <span className="suggested-icon" aria-hidden="true">
              <Icon icon={Sparkles} size="Small" color="primary" />
            </span>
            <div className="suggested-text">
              <strong>
                Suggested for Day {day + 1}: {daySummary(suggestion.items)}
              </strong>
              <span>{suggestion.basis}</span>
            </div>
            <div className="suggested-actions">
              <Button kind="Secondary" size="Small" onClick={reject}>
                Reject
              </Button>
              <Button kind="Primary" size="Small" onClick={accept}>
                Accept
              </Button>
            </div>
          </div>
        )}

        <div className="picker-filters">
          <Search
            size="Medium"
            placeholder="Search by name or SKU"
            aria-label="Search rewards"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
          />
          <Dropdown
            size="Medium"
            aria-label="Type"
            value={type}
            onChange={setType}
            options={[{ value: 'all', label: 'All types' }, ...REWARD_TYPES.map((t) => ({ value: t, label: `Type: ${t}` }))]}
          />
          <Dropdown
            size="Medium"
            aria-label="Store category"
            value={category}
            onChange={setCategory}
            options={[{ value: 'all', label: 'Store category' }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
        </div>

        <p className="picker-count">{rows.length} items</p>

        <table className="picker-table">
          <thead>
            <tr>
              <th aria-label="Select" />
              <th>Name and SKU ID</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((kind) => {
              const def = REWARD_DEFS[kind]
              const quantity = selection[kind]
              const picked = quantity !== undefined
              const shownText =
                editing?.kind === kind ? editing.text : picked ? formatQuantity({ kind, quantity }) : ''
              return (
                <tr key={kind} className={picked ? 'is-picked' : undefined}>
                  <td className="picker-check">
                    <Checkbox
                      showLabel={false}
                      aria-label={`Select ${def.name}`}
                      checked={picked}
                      disabled={def.reserved}
                      onChange={() => toggle(kind)}
                    />
                  </td>
                  <td>
                    <div className="picker-name">
                      <RewardIcon item={{ kind, quantity: quantity ?? 1 }} size={36} />
                      <div>
                        <div className="picker-title">
                          {def.name}
                          {def.reserved && (
                            <Label color="Dark" kind="Line" size="Small">
                              Reserved
                            </Label>
                          )}
                        </div>
                        <div className="picker-sku">
                          {kind === 'chips' && picked ? formatChipsExact(quantity) : def.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`stepper${picked ? '' : ' is-off'}`}>
                      <IconButton
                        kind="Tertiary"
                        size="XS"
                        aria-label={`Decrease ${def.name}`}
                        disabled={!picked}
                        iconElement={<Icon icon={Minus} size="Small" color="current" />}
                        onClick={() => step(kind, -1)}
                      />
                      <TextField
                        size="Small"
                        label=""
                        showHelper={false}
                        showIconRight={false}
                        aria-label={`${def.name} quantity`}
                        placeholder="–"
                        disabled={!picked}
                        state={invalid === kind ? 'error' : 'default'}
                        value={shownText}
                        onFocus={() => picked && setEditing({ kind, text: formatQuantity({ kind, quantity }) })}
                        onChange={(e) => onType(kind, e.target.value)}
                        onBlur={() => {
                          setEditing(null)
                          setInvalid(null)
                        }}
                      />
                      <IconButton
                        kind="Tertiary"
                        size="XS"
                        aria-label={`Increase ${def.name}`}
                        disabled={!picked}
                        iconElement={<Icon icon={Plus} size="Small" color="current" />}
                        onClick={() => step(kind, 1)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length === 0 && <p className="picker-empty">No rewards match. Clear the search or filters.</p>}

        {invalid && (
          <p className="field-error">
            {invalid === 'chips' ? 'Enter chips like 1.5B, 500M or 1,500,000,000.' : 'Enter a whole number.'}
          </p>
        )}

        {issues.length > 0 && (
          <ul className="picker-issues" aria-label="Checks for this day">
            {issues.map((i) => (
              <li key={i.id} className={`issue issue--${i.severity}`}>
                <Icon icon={i.severity === 'error' ? CircleAlert : TriangleAlert} size="Small" color={i.severity === 'error' ? 'negative' : 'warning'} />
                <span>
                  {i.message}
                  {i.severity === 'error' && ' This blocks saving.'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="picker-selected">{items.length} selected</p>
      </div>
    </Modal>
  )
}
