import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { Check, Minus } from 'lucide-react';
import styles from './Checkbox.module.css';

export type CheckboxState = 'regular' | 'selected' | 'disabled' | 'indeterminate';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  /** Figma: Checkbox text */
  label?: ReactNode;
  /** Show label beside the control */
  showLabel?: boolean;
  /** Visual state — mirrors Figma State variants */
  state?: CheckboxState;
}

const stateClass: Record<CheckboxState, string> = {
  regular: '',
  selected: styles['checkbox--selected'],
  disabled: styles['checkbox--disabled'],
  indeterminate: styles['checkbox--indeterminate'],
};

export function Checkbox({
  label = 'Regular',
  showLabel = true,
  state = 'regular',
  className,
  disabled,
  checked,
  id: idProp,
  'aria-label': ariaLabel,
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const isDisabled = disabled || state === 'disabled';
  const isChecked = state === 'selected' || checked === true;
  const isIndeterminate = state === 'indeterminate';

  const classes = [
    styles.checkbox,
    stateClass[state],
    isDisabled ? styles['checkbox--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={classes} htmlFor={id}>
      <span className={styles.checkbox__control}>
        <input
          type="checkbox"
          id={id}
          className={styles.checkbox__input}
          disabled={isDisabled}
          checked={isChecked}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          aria-checked={isIndeterminate ? 'mixed' : isChecked}
          aria-label={!showLabel ? ariaLabel : undefined}
          {...rest}
        />
        <span className={styles.checkbox__box} aria-hidden="true">
          {isIndeterminate ? (
            <Minus className={styles.checkbox__mark} size={12} strokeWidth={2.5} />
          ) : isChecked ? (
            <Check className={styles.checkbox__mark} size={12} strokeWidth={2.5} />
          ) : null}
        </span>
      </span>
      {showLabel && label ? <span className={styles.checkbox__label}>{label}</span> : null}
    </label>
  );
}
