import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../_shared/cn';
import styles from './RadioButton.module.css';

export type RadioButtonState = 'regular' | 'selected' | 'disabled';

export interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label?: ReactNode;
  showLabel?: boolean;
  state?: RadioButtonState;
}

const stateClass: Record<RadioButtonState, string> = {
  regular: '',
  selected: styles['radioButton--selected'],
  disabled: styles['radioButton--disabled'],
};

export function RadioButton({
  label = 'Regular',
  showLabel = true,
  state = 'regular',
  className,
  disabled,
  checked,
  id,
  ...rest
}: RadioButtonProps) {
  const isDisabled = disabled || state === 'disabled';
  const isChecked = state === 'selected' || checked === true;

  const classes = cn(
    styles.radioButton,
    stateClass[state],
    isDisabled && styles['radioButton--disabled'],
    className,
  );

  return (
    <label className={classes} htmlFor={id}>
      <span className={styles.radioButton__control}>
        <input
          type="radio"
          id={id}
          className={styles.radioButton__input}
          disabled={isDisabled}
          checked={isChecked}
          {...rest}
        />
        <span className={styles.radioButton__circle} aria-hidden="true">
          {isChecked ? <span className={styles.radioButton__dot} /> : null}
        </span>
      </span>
      {showLabel && label ? <span className={styles.radioButton__label}>{label}</span> : null}
    </label>
  );
}
