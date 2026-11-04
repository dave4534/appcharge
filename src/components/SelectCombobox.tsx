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
  invalid?: boolean
  className?: string
}

// Every dropdown in the app: shadcn's Combobox, with the options as { value, label } and
// the chosen value as a string, so it drops in where a plain select used to be.
export function SelectCombobox({ value, options, onChange, placeholder, invalid, className, ...props }: SelectComboboxProps) {
  const selected = options.find((o) => o.value === value) ?? null
  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option) => option && onChange(option.value)}
      isItemEqualToValue={(a, b) => a.value === b.value}
      itemToStringLabel={(option) => option.label}
    >
      <ComboboxInput
        placeholder={placeholder ?? 'Select'}
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
  )
}
