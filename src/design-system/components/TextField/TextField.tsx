import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../_shared/cn';
import { FieldShell } from '../_shared/FieldShell';
import controlStyles from '../_shared/inputControl.module.css';
import styles from './TextField.module.css';

export type TextFieldSize = 'Small' | 'Medium' | 'Large';
export type TextFieldState = 'default' | 'error' | 'success' | 'disabled' | 'readonly';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'readOnly'> {
  /** Figma: Size */
  size?: TextFieldSize;
  /** Visual validation / interaction state */
  state?: TextFieldState;
  /** Figma: Label text */
  label?: string;
  /** Figma: Required */
  required?: boolean;
  /** Figma: Information text */
  helperText?: string;
  /** Figma: Information text visibility */
  showHelper?: boolean;
  /** Figma: Character limit */
  characterLimit?: string;
  showCharacterLimit?: boolean;
  /** Figma: Show icon left */
  showIconLeft?: boolean;
  /** Figma: Show icon right */
  showIconRight?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const sizeClass: Record<TextFieldSize, string> = {
  Small: controlStyles['control--size-small'],
  Medium: controlStyles['control--size-medium'],
  Large: controlStyles['control--size-large'],
};

export function TextField({
  size = 'Large',
  state = 'default',
  label = 'Label',
  required = false,
  helperText = 'Information text',
  showHelper = true,
  characterLimit = '0/200',
  showCharacterLimit = false,
  showIconLeft = false,
  showIconRight = true,
  iconLeft,
  iconRight,
  className,
  disabled,
  placeholder = 'Placeholder text here',
  ...rest
}: TextFieldProps) {
  const inputId = useId();
  const helperId = useId();
  const isDisabled = state === 'disabled' || disabled;
  const isReadonly = state === 'readonly';
  const validationState = state === 'error' ? 'error' : state === 'success' ? 'success' : 'default';

  const controlClasses = cn(
    controlStyles.control,
    sizeClass[size],
    state === 'error' && controlStyles['control--error'],
    state === 'success' && controlStyles['control--success'],
    isDisabled && controlStyles['control--disabled'],
    isReadonly && controlStyles['control--readonly'],
    isReadonly && !label && controlStyles['control--readonlyNoLabel'],
    styles.textField__control,
    className,
  );

  const leftIcon = showIconLeft ? (
    <span className={controlStyles.control__icon} aria-hidden="true">
      {iconLeft}
    </span>
  ) : null;

  const rightIcon = showIconRight ? (
    <span className={controlStyles.control__icon} aria-hidden="true">
      {iconRight ?? <Info size={16} />}
    </span>
  ) : null;

  return (
    <FieldShell
      label={label}
      required={required}
      helperText={helperText}
      showHelper={showHelper}
      characterLimit={showCharacterLimit ? characterLimit : undefined}
      validationState={validationState}
      inputId={inputId}
      helperId={helperId}
    >
      <div className={controlClasses}>
        {leftIcon}
        <input
          id={inputId}
          className={controlStyles.control__input}
          disabled={isDisabled}
          readOnly={isReadonly}
          placeholder={placeholder}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={showHelper ? helperId : undefined}
          {...rest}
        />
        {rightIcon}
      </div>
    </FieldShell>
  );
}
