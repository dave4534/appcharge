import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../_shared/cn';
import styles from './SplitButton.module.css';

export type SplitButtonKind = 'Primary' | 'Secondary' | 'Tertiary';
export type SplitButtonSize = 'Small' | 'Medium' | 'Large';

export interface SplitButtonOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SplitButtonProps {
  /** Figma: Kind — simplified to primary split; all kinds supported */
  kind?: SplitButtonKind;
  /** Figma: Size */
  size?: SplitButtonSize;
  /** Figma: Button text */
  children?: string;
  iconElement?: ReactNode;
  options?: SplitButtonOption[];
  disabled?: boolean;
  onPrimaryClick?: () => void;
  onOptionSelect?: (value: string) => void;
  className?: string;
}

const kindClass: Record<SplitButtonKind, string> = {
  Primary: styles['split-button--kind-primary'],
  Secondary: styles['split-button--kind-secondary'],
  Tertiary: styles['split-button--kind-tertiary'],
};

const sizeClass: Record<SplitButtonSize, string> = {
  Small: styles['split-button--size-small'],
  Medium: styles['split-button--size-medium'],
  Large: styles['split-button--size-large'],
};

const defaultOptions: SplitButtonOption[] = [
  { value: 'option-1', label: 'Option 1' },
  { value: 'option-2', label: 'Option 2' },
  { value: 'option-3', label: 'Option 3' },
];

export function SplitButton({
  kind = 'Primary',
  size = 'Medium',
  children = 'Button',
  iconElement,
  options = defaultOptions,
  disabled = false,
  onPrimaryClick,
  onOptionSelect,
  className,
}: SplitButtonProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const classes = cn(
    styles['split-button'],
    kindClass[kind],
    sizeClass[size],
    disabled && styles['split-button--disabled'],
    className,
  );

  return (
    <div className={classes} ref={rootRef}>
      <button
        type="button"
        className={styles['split-button__primary']}
        disabled={disabled}
        onClick={onPrimaryClick}
      >
        {iconElement ? (
          <span className={styles['split-button__icon']} aria-hidden="true">
            {iconElement}
          </span>
        ) : null}
        <span className={styles['split-button__label']}>{children}</span>
      </button>
      <span className={styles['split-button__divider']} aria-hidden="true" />
      <button
        type="button"
        className={styles['split-button__menuTrigger']}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${children} menu`}
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown size={16} strokeWidth={2} />
      </button>

      {open && !disabled ? (
        <ul id={menuId} className={styles['split-button__menu']} role="menu">
          {options.map((option) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="menuitem"
                className={styles['split-button__menuItem']}
                disabled={option.disabled}
                onClick={() => {
                  onOptionSelect?.(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
