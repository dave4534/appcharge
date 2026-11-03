import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../_shared/cn';
import controlStyles from '../_shared/inputControl.module.css';
import styles from './Dropdown.module.css';

export type DropdownSize = 'Small' | 'Medium' | 'Large';
export type DropdownState = 'default' | 'error' | 'disabled' | 'readonly';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  size?: DropdownSize;
  state?: DropdownState;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  options: DropdownOption[];
  onChange?: (value: string) => void;
  hasIcon?: boolean;
  icon?: ReactNode;
  className?: string;
  'aria-label'?: string;
}

const sizeClass: Record<DropdownSize, string> = {
  Small: controlStyles['control--size-small'],
  Medium: controlStyles['control--size-medium'],
  Large: controlStyles['control--size-large'],
};

export function Dropdown({
  size = 'Medium',
  state = 'default',
  placeholder = 'Placeholder text here ',
  value,
  defaultValue,
  options,
  onChange,
  hasIcon = false,
  icon,
  className,
  'aria-label': ariaLabel = 'Dropdown',
}: DropdownProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);
  const isDisabled = state === 'disabled';
  const isReadonly = state === 'readonly';

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function selectOption(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (isDisabled || isReadonly) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((current) => !current);
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }

    if (event.key === 'ArrowDown' && !open) {
      event.preventDefault();
      setOpen(true);
    }
  }

  const triggerClasses = cn(
    controlStyles.control,
    sizeClass[size],
    styles.dropdown__trigger,
    open && styles['dropdown__trigger--open'],
    state === 'error' && controlStyles['control--error'],
    isDisabled && controlStyles['control--disabled'],
    isReadonly && controlStyles['control--readonly'],
    isReadonly && controlStyles['control--readonlyNoLabel'],
    className,
  );

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        type="button"
        className={triggerClasses}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled && !isReadonly) {
            setOpen((current) => !current);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        {hasIcon && icon ? (
          <span className={controlStyles.control__icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span
          className={cn(
            styles.dropdown__value,
            !selectedOption && styles['dropdown__value--placeholder'],
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <span className={styles.dropdown__chevron} aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </button>

      {open && !isDisabled && !isReadonly ? (
        <ul id={listId} className={styles.dropdown__menu} role="listbox">
          {options.length === 0 ? (
            <li className={styles.dropdown__empty}>No results</li>
          ) : (
            options.map((option) => (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  className={cn(
                    styles.dropdown__option,
                    option.value === selectedValue && styles['dropdown__option--selected'],
                  )}
                  aria-selected={option.value === selectedValue}
                  disabled={option.disabled}
                  onClick={() => selectOption(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
