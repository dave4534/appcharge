import { CircleAlert, Minus, Plus, Sparkles, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Dropdown,
  Icon,
  IconButton,
  Modal,
  Search,
  TextField,
} from '../../../design-system/components'
import { PRODUCTS, offeredOn, type Product } from './catalog'
import { ensureWeeks, setDay } from './plan'
import { RewardIcon } from './tiles'
import {
  REWARD_DEFS,
  chipsOf,
  dayNumber,
  daySummary,
  formatChipsExact,
  formatQuantity,
  makeItem,
  parseQuantity,
  suggestDay,
  validatePlan,
  type DayRewards,
  type RewardWeek,
} from './rules'

// What is picked, by product SKU, with its quantity.
type Selection = Record<string, number>

const toSelection = (items: DayRewards): Selection => Object.fromEntries(items.map((i) => [i.sku, i.quantity]))

const toItems = (selection: Selection): DayRewards =>
  PRODUCTS.filter((p) => selection[p.sku] !== undefined).map((p) => makeItem(p.kind, selection[p.sku], p.sku))

const clamp = (kind: Product['kind'], value: number) => {
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
  const [category, setCategory] = useState('all')
  const [editing, setEditing] = useState<{ sku: string; text: string } | null>(null)
  const [invalid, setInvalid] = useState<string | null>(null)

  // Only products this day can offer are listed. The rules for that live in catalog.ts.
  const offered = useMemo(() => offeredOn(day), [day])
  const categories = [...new Set(offered.map((p) => p.category))]
  const rows = offered.filter((p) => {
    const q = query.trim().toLowerCase()
    return (category === 'all' || p.category === category) && (!q || p.name.toLowerCase().includes(q) || p.sku.includes(q))
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

  const defaultQuantity = (p: Product) => {
    const suggested = suggestion.items.find((i) => i.sku === p.sku)
    if (suggested) return suggested.quantity
    if (p.kind === 'chips') return chipsOf(plan[week]?.[day - 1] ?? []) || 500_000_000
    return REWARD_DEFS[p.kind].step
  }

  const toggle = (p: Product) =>
    setSelection((s) => {
      const next = { ...s }
      if (next[p.sku] === undefined) next[p.sku] = defaultQuantity(p)
      else delete next[p.sku]
      return next
    })

  const pickedCount = rows.filter((p) => selection[p.sku] !== undefined).length
  const allPicked = rows.length > 0 && pickedCount === rows.length

  // The header checkbox picks or clears everything currently listed.
  const toggleAll = () =>
    setSelection((s) => {
      const next = { ...s }
      rows.forEach((p) => {
        if (allPicked) delete next[p.sku]
        else if (next[p.sku] === undefined) next[p.sku] = defaultQuantity(p)
      })
      return next
    })

  const step = (p: Product, direction: 1 | -1) => {
    const now = selection[p.sku]
    if (now === undefined) return
    setInvalid(null)
    setSelection((s) => ({ ...s, [p.sku]: clamp(p.kind, now + direction * REWARD_DEFS[p.kind].step) }))
  }

  const onType = (p: Product, text: string) => {
    setEditing({ sku: p.sku, text })
    const parsed = parseQuantity(p.kind, text)
    if (parsed === null || parsed <= 0) setInvalid(p.sku)
    else {
      setInvalid(null)
      // Typed amounts are kept as entered (no clamping) so a wrong digit stays visible
      // and the guardrails can flag it.
      setSelection((s) => ({ ...s, [p.sku]: parsed }))
    }
  }

  // Accepting keeps the dialog open: the suggestion is already picked, so this only
  // dismisses the banner and enables the primary button.
  const accept = () => setShowSuggestion(false)
  const reject = () => {
    setShowSuggestion(false)
    setSelection({})
  }

  return (
    <Modal
      size="Large"
      scroll
      className="modal--picker"
      title={`Select reward for Day ${dayNumber(week, day)}`}
      subtitle={`Week ${week + 1}. Amounts are illustrative.`}
      onClose={onClose}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
      primaryAction={{
        label: isNew ? `Add to Day ${dayNumber(week, day)}` : 'Save changes',
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
                Suggested for Day {dayNumber(week, day)}: {daySummary(suggestion.items)}
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
            aria-label="Search the product bank"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
          />
          <Dropdown
            size="Medium"
            aria-label="Store category"
            value={category}
            onChange={setCategory}
            options={[{ value: 'all', label: 'Store category' }, ...categories.map((c) => ({ value: c, label: c }))]}
          />
        </div>

        <table className="picker-table">
          <thead>
            <tr>
              <th className="picker-check">
                <Checkbox
                  showLabel={false}
                  aria-label="Select everything listed"
                  state={allPicked ? 'selected' : pickedCount > 0 ? 'indeterminate' : 'regular'}
                  checked={allPicked}
                  disabled={rows.length === 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Name and SKU ID</th>
              <th>Store category</th>
              <th>Price</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const quantity = selection[p.sku]
              const picked = quantity !== undefined
              const shownText = editing?.sku === p.sku ? editing.text : picked ? formatQuantity(makeItem(p.kind, quantity, p.sku)) : ''
              return (
                <tr key={p.sku} className={picked ? 'is-picked' : undefined}>
                  <td className="picker-check">
                    <Checkbox showLabel={false} aria-label={`Select ${p.name}`} checked={picked} onChange={() => toggle(p)} />
                  </td>
                  <td>
                    <div className="picker-name">
                      <RewardIcon item={makeItem(p.kind, quantity ?? 1, p.sku)} size={36} />
                      <div>
                        <div className="picker-title">{p.name}</div>
                        <div className="picker-sku">{p.kind === 'chips' && picked ? formatChipsExact(quantity) : p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="picker-muted">{p.category}</td>
                  <td className="picker-muted">{p.price}</td>
                  <td>
                    <div className={`stepper${picked ? '' : ' is-off'}`}>
                      <IconButton
                        kind="Tertiary"
                        size="XS"
                        aria-label={`Decrease ${p.name}`}
                        disabled={!picked}
                        iconElement={<Icon icon={Minus} size="Small" color="current" />}
                        onClick={() => step(p, -1)}
                      />
                      <TextField
                        size="Small"
                        label=""
                        showHelper={false}
                        showIconRight={false}
                        aria-label={`${p.name} quantity`}
                        placeholder="–"
                        disabled={!picked}
                        state={invalid === p.sku ? 'error' : 'default'}
                        value={shownText}
                        onFocus={() => picked && setEditing({ sku: p.sku, text: formatQuantity(makeItem(p.kind, quantity, p.sku)) })}
                        onChange={(e) => onType(p, e.target.value)}
                        onBlur={() => {
                          setEditing(null)
                          setInvalid(null)
                        }}
                      />
                      <IconButton
                        kind="Tertiary"
                        size="XS"
                        aria-label={`Increase ${p.name}`}
                        disabled={!picked}
                        iconElement={<Icon icon={Plus} size="Small" color="current" />}
                        onClick={() => step(p, 1)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length === 0 && <p className="picker-empty">Nothing matches. Clear the search or the category.</p>}

        {invalid && (
          <p className="field-error">
            {PRODUCTS.find((p) => p.sku === invalid)?.kind === 'chips'
              ? 'Enter chips like 1.5B, 500M or 1,500,000,000.'
              : 'Enter a whole number.'}
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
