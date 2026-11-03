import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './Chips.module.css';

export type ChipType = 'Primary' | 'Positive' | 'Negative' | 'Warning';
export type ChipIcon = 'None' | 'Left' | 'Right';

export interface ChipsProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** Figma: Type */
  type?: ChipType;
  /** Figma: Chip Text */
  children?: ReactNode;
  /** Figma: Icon */
  icon?: ChipIcon;
  /** Icon slot — maps to Figma Icon type INSTANCE_SWAP */
  iconElement?: ReactNode;
  /** Figma: Show close button */
  showCloseButton?: boolean;
  onClose?: () => void;
}

const typeClass: Record<ChipType, string> = {
  Primary: styles['chips--type-primary'],
  Positive: styles['chips--type-positive'],
  Negative: styles['chips--type-negative'],
  Warning: styles['chips--type-warning'],
};

export function Chips({
  type = 'Primary',
  children = 'This is a chip',
  icon = 'None',
  iconElement,
  showCloseButton = false,
  onClose,
  className,
  disabled,
  ...rest
}: ChipsProps) {
  const classes = [
    styles.chips,
    typeClass[type],
    icon === 'Left' ? styles['chips--icon-left'] : '',
    icon === 'Right' ? styles['chips--icon-right'] : '',
    showCloseButton ? styles['chips--with-close'] : '',
    disabled ? styles['chips--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconNode = iconElement ? (
    <span className={styles.chips__icon} aria-hidden="true">
      {iconElement}
    </span>
  ) : null;

  return (
    <span className={classes}>
      <button type="button" className={styles.chips__main} disabled={disabled} {...rest}>
        {icon === 'Left' && iconNode}
        <span className={styles.chips__label}>{children}</span>
        {icon === 'Right' && iconNode}
      </button>
      {showCloseButton ? (
        <button
          type="button"
          className={styles.chips__close}
          disabled={disabled}
          aria-label="Remove chip"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <X size={12} strokeWidth={2} />
        </button>
      ) : null}
    </span>
  );
}
