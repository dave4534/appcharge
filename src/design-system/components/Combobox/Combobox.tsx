import { useMemo, useState } from 'react';
import { Button } from '../Button/Button';
import { List, type ListItemData } from '../List/List';
import { Search, type SearchSize } from '../Search/Search';
import { cn } from '../_shared/cn';
import styles from './Combobox.module.css';

export type ComboboxSize = 'Small' | 'Medium' | 'Large';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  size?: ComboboxSize;
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  showFooterButton?: boolean;
  footerButtonLabel?: string;
  onFooterButtonClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

const searchSizeMap: Record<ComboboxSize, SearchSize> = {
  Small: 'Small',
  Medium: 'Medium',
  Large: 'Large',
};

const sizeClass: Record<ComboboxSize, string> = {
  Small: styles['combobox--size-small'],
  Medium: styles['combobox--size-medium'],
  Large: styles['combobox--size-large'],
};

export function Combobox({
  size = 'Medium',
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Search',
  showFooterButton = true,
  footerButtonLabel = 'Add new',
  onFooterButtonClick,
  className,
  'aria-label': ariaLabel = 'Combobox',
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  const listItems: ListItemData[] = filteredOptions.map((option) => ({
    id: option.value,
    label: option.label,
    disabled: option.disabled,
    selected: option.value === selectedValue,
  }));

  function handleSelect(id: string) {
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  }

  return (
    <div
      className={cn(styles.combobox, sizeClass[size], className)}
      role="combobox"
      aria-label={ariaLabel}
      aria-expanded="true"
    >
      <div className={styles.combobox__search}>
        <Search
          size={searchSizeMap[size]}
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />
      </div>

      <List
        items={listItems}
        onItemSelect={handleSelect}
        className={styles.combobox__list}
      />

      {showFooterButton ? (
        <div className={styles.combobox__footer}>
          <Button
            kind="Tertiary"
            size={size === 'Large' ? 'Medium' : 'Small'}
            onClick={onFooterButtonClick}
          >
            {footerButtonLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
