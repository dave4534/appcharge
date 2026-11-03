import type { ReactNode } from 'react';
import { cn } from './cn';
import styles from './fieldShell.module.css';

export type FieldValidationState = 'default' | 'error' | 'success';

export interface FieldShellProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  characterLimit?: string;
  showHelper?: boolean;
  validationState?: FieldValidationState;
  inputId?: string;
  helperId?: string;
  children: ReactNode;
  className?: string;
}

export function FieldShell({
  label,
  required = false,
  helperText = 'Information text',
  characterLimit,
  showHelper = true,
  validationState = 'default',
  inputId,
  helperId,
  children,
  className,
}: FieldShellProps) {
  const showBottom = showHelper || Boolean(characterLimit);

  return (
    <div className={cn(styles.field, className)}>
      {label ? (
        <div className={styles.field__labelRow}>
          <label className={styles.field__label} htmlFor={inputId}>
            {label}
            {required ? <span className={styles.field__required}> *</span> : null}
          </label>
        </div>
      ) : null}
      {children}
      {showBottom ? (
        <div className={styles.field__bottomRow}>
          {showHelper ? (
            <span
              id={helperId}
              className={cn(
                styles.field__helper,
                validationState === 'error' && styles['field__helper--error'],
                validationState === 'success' && styles['field__helper--success'],
              )}
            >
              {helperText}
            </span>
          ) : (
            <span />
          )}
          {characterLimit ? <span className={styles.field__limit}>{characterLimit}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
