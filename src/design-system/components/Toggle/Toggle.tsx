import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';
import styles from './Toggle.module.css';

export type ToggleSize = 'Medium' | 'Small';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Figma: State — whether the toggle is on */
  checked?: boolean;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Size */
  size?: ToggleSize;
  /** Figma: Left label text */
  leftLabel?: ReactNode;
  /** Figma: Right label text */
  rightLabel?: ReactNode;
  /** Show left label */
  showLeftLabel?: boolean;
  /** Show right label */
  showRightLabel?: boolean;
  onChange?: (checked: boolean) => void;
}

const sizeClass: Record<ToggleSize, string> = {
  Medium: styles['toggle--size-medium'],
  Small: styles['toggle--size-small'],
};

export function Toggle({
  checked = false,
  disabled = false,
  size = 'Medium',
  leftLabel = 'Off',
  rightLabel = 'On',
  showLeftLabel = true,
  showRightLabel = true,
  onChange,
  className,
  type = 'button',
  'aria-label': ariaLabel,
  ...rest
}: ToggleProps) {
  const switchId = useId();
  const leftLabelId = useId();
  const rightLabelId = useId();
  const hasVisibleLabels = showLeftLabel || showRightLabel;

  const classes = [
    styles.toggle,
    sizeClass[size],
    checked ? styles['toggle--checked'] : '',
    disabled ? styles['toggle--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {showLeftLabel ? (
        <span id={leftLabelId} className={styles.toggle__label}>
          {leftLabel}
        </span>
      ) : null}
      <button
        id={switchId}
        type={type}
        className={styles.toggle__control}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        aria-label={!hasVisibleLabels ? ariaLabel ?? 'Toggle' : undefined}
        aria-labelledby={
          hasVisibleLabels
            ? [showLeftLabel ? leftLabelId : '', showRightLabel ? rightLabelId : '']
                .filter(Boolean)
                .join(' ') || undefined
            : undefined
        }
        onClick={() => onChange?.(!checked)}
        {...rest}
      >
        <span className={styles.toggle__track}>
          <span className={styles.toggle__knob} />
        </span>
      </button>
      {showRightLabel ? (
        <span id={rightLabelId} className={styles.toggle__label}>
          {rightLabel}
        </span>
      ) : null}
    </div>
  );
}
