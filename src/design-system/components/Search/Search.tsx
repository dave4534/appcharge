import { useState, type InputHTMLAttributes } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '../_shared/cn';
import controlStyles from '../_shared/inputControl.module.css';
import styles from './Search.module.css';

export type SearchSize = 'Small' | 'Medium' | 'Large';

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: SearchSize;
  showClearButton?: boolean;
  onClear?: () => void;
}

const sizeClass: Record<SearchSize, string> = {
  Small: controlStyles['control--size-small'],
  Medium: controlStyles['control--size-medium'],
  Large: controlStyles['control--size-large'],
};

const iconSize: Record<SearchSize, number> = {
  Small: 16,
  Medium: 18,
  Large: 20,
};

export function Search({
  size = 'Large',
  showClearButton = true,
  onClear,
  className,
  disabled,
  value,
  defaultValue,
  placeholder = 'Search',
  onChange,
  ...rest
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? ''));
  const currentValue = value !== undefined ? String(value) : internalValue;
  const hasValue = currentValue.length > 0;

  const controlClasses = cn(
    controlStyles.control,
    sizeClass[size],
    styles.search,
    disabled && controlStyles['control--disabled'],
    className,
  );

  return (
    <div className={controlClasses}>
      <span className={controlStyles.control__icon} aria-hidden="true">
        <SearchIcon size={iconSize[size]} />
      </span>
      <input
        type="search"
        className={controlStyles.control__input}
        disabled={disabled}
        value={value !== undefined ? value : internalValue}
        placeholder={placeholder}
        onChange={(event) => {
          if (value === undefined) {
            setInternalValue(event.target.value);
          }
          onChange?.(event);
        }}
        {...rest}
      />
      {showClearButton && hasValue && !disabled ? (
        <button
          type="button"
          className={cn(controlStyles.control__iconButton, styles.search__clear)}
          aria-label="Clear search"
          onClick={() => {
            if (value === undefined) {
              setInternalValue('');
            }
            onClear?.();
          }}
        >
          <X size={iconSize[size] - 2} />
        </button>
      ) : null}
    </div>
  );
}
