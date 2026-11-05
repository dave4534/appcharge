import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { cn } from '@/lib/utils'

export type ComboboxOption = { value: string; label: string }

type SelectComboboxProps = {
  value: string
  options: ComboboxOption[]
  onChange: (value: string) => void
  placeholder?: string
  'aria-label': string
  id?: string
  invalid?: boolean
  className?: string
}

// Every dropdown in the app: shadcn's Combobox, with the options as { value, label } and
// the chosen value as a string, so it drops in where a plain select used to be.
export function SelectCombobox({ value, options, onChange, placeholder, invalid, className, ...props }: SelectComboboxProps) {
  const selected = options.find((o) => o.value === value) ?? null
  return (
    // Focusing selects the current label, so typing replaces it. A click is taken over so the
    // browser does not place the cursor after the press.
    <div
      className="contents"
      onMouseDown={(e) => {
        const input = e.target
        if (!(input instanceof HTMLInputElement) || document.activeElement === input) return
        e.preventDefault()
        input.focus()
        input.select()
      }}
      onFocus={(e) => {
        const input = e.target
        if (input instanceof HTMLInputElement) input.select()
      }}
    >
      {/* autoHighlight: typing narrows the list and Enter picks the first match. Leaving the field
          puts back the chosen label, so typed text never looks like a choice that did not apply. */}
      <Combobox
        autoHighlight
        items={options}
        value={selected}
        onValueChange={(option) => option && onChange(option.value)}
        isItemEqualToValue={(a, b) => a.value === b.value}
        itemToStringLabel={(option) => option.label}
      >
        <ComboboxInput
          placeholder={placeholder ?? 'Select'}
          id={props.id}
          aria-label={props['aria-label']}
          aria-invalid={invalid || undefined}
          className={cn('select-combobox', className)}
        />
        <ComboboxContent>
          <ComboboxEmpty>No results</ComboboxEmpty>
          <ComboboxList>
            {(option: ComboboxOption) => (
              <ComboboxItem key={option.value} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
