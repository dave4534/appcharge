import { useId, useState } from 'react';
import { cn } from '../_shared/cn';
import { RadioButton } from './RadioButton';
import styles from './RadioGroup.module.css';

export type RadioGroupPositioning = 'vertical' | 'horizontal';

export interface RadioGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  positioning?: RadioGroupPositioning;
  error?: string;
  className?: string;
  'aria-label'?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  positioning = 'vertical',
  error,
  className,
  'aria-label': ariaLabel = 'Radio group',
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  function handleChange(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }

  return (
    <fieldset className={cn(styles.radioGroup, className)}>
      <div
        className={cn(
          styles.radioGroup__options,
          positioning === 'horizontal' && styles['radioGroup__options--horizontal'],
        )}
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const id = `${groupName}-${option.value}`;
          const isSelected = option.value === selectedValue;
          return (
            <RadioButton
              key={option.value}
              id={id}
              name={groupName}
              label={option.label}
              value={option.value}
              checked={isSelected}
              disabled={option.disabled}
              state={
                option.disabled ? 'disabled' : isSelected ? 'selected' : 'regular'
              }
              onChange={() => handleChange(option.value)}
            />
          );
        })}
      </div>
      {error ? <p className={styles.radioGroup__error}>{error}</p> : null}
    </fieldset>
  );
}

export { RadioButton } from './RadioButton';
export type { RadioButtonProps, RadioButtonState } from './RadioButton';
