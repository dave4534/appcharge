import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../_shared/cn';
import { FieldShell } from '../_shared/FieldShell';
import controlStyles from '../_shared/inputControl.module.css';
import styles from './TextArea.module.css';

export type TextAreaSize = 'Small' | 'Large';
export type TextAreaState = 'default' | 'error' | 'success' | 'disabled' | 'readonly';

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'readOnly'> {
  size?: TextAreaSize;
  state?: TextAreaState;
  label?: string;
  required?: boolean;
  helperText?: string;
  showHelper?: boolean;
  characterLimit?: string;
  showCharacterLimit?: boolean;
  showPlaceholder?: boolean;
}

const sizeClass: Record<TextAreaSize, string> = {
  Small: styles['textArea--size-small'],
  Large: styles['textArea--size-large'],
};

export function TextArea({
  size = 'Large',
  state = 'default',
  label = 'Label',
  required = false,
  helperText = 'Information text',
  showHelper = true,
  characterLimit = '0/200',
  showCharacterLimit = false,
  showPlaceholder = true,
  className,
  disabled,
  placeholder = 'Users can type here ',
  rows,
  ...rest
}: TextAreaProps) {
  const isDisabled = state === 'disabled' || disabled;
  const isReadonly = state === 'readonly';
  const validationState = state === 'error' ? 'error' : state === 'success' ? 'success' : 'default';

  const controlClasses = cn(
    controlStyles.control,
    styles.textArea,
    sizeClass[size],
    state === 'error' && controlStyles['control--error'],
    state === 'success' && controlStyles['control--success'],
    isDisabled && controlStyles['control--disabled'],
    isReadonly && controlStyles['control--readonly'],
    isReadonly && !label && controlStyles['control--readonlyNoLabel'],
    className,
  );

  return (
    <FieldShell
      label={label}
      required={required}
      helperText={helperText}
      showHelper={showHelper}
      characterLimit={showCharacterLimit ? characterLimit : undefined}
      validationState={validationState}
    >
      <div className={controlClasses}>
        <textarea
          className={styles.textArea__input}
          disabled={isDisabled}
          readOnly={isReadonly}
          placeholder={showPlaceholder ? placeholder : undefined}
          rows={rows ?? (size === 'Large' ? 4 : 3)}
          aria-invalid={state === 'error' || undefined}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}
