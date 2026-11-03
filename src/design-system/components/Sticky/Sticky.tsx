import type { ButtonHTMLAttributes } from 'react';
import { Pin } from 'lucide-react';
import { cn } from '../_shared/cn';
import styles from './Sticky.module.css';

export interface StickyProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Figma: ↳ Is sticky */
  isSticky?: boolean;
  'aria-label'?: string;
}

export function Sticky({
  isSticky = true,
  className,
  disabled,
  'aria-label': ariaLabel = isSticky ? 'Unpin' : 'Pin',
  ...rest
}: StickyProps) {
  return (
    <button
      type="button"
      className={cn(
        styles.sticky,
        isSticky ? styles['sticky--active'] : styles['sticky--inactive'],
        disabled && styles['sticky--disabled'],
        className,
      )}
      aria-pressed={isSticky}
      aria-label={ariaLabel}
      disabled={disabled}
      {...rest}
    >
      <Pin size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
