import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import styles from './Icon.module.css';

export type IconSize = 'Small' | 'Medium' | 'Large' | number;

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'on-primary'
  | 'disabled'
  | 'negative'
  | 'positive'
  | 'warning'
  | 'current';

type IconBaseProps = {
  /** Lucide icon component (e.g. `import { Close } from 'lucide-react'`) */
  icon: LucideIcon;
  /** Pixel size or preset token */
  size?: IconSize;
  /** Semantic color role mapped to design tokens */
  color?: IconColor;
  /** Accessible name when the icon conveys meaning on its own */
  label?: string;
  strokeWidth?: number;
  className?: string;
};

export type IconProps = IconBaseProps &
  (
    | (Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & { onClick?: undefined })
    | (Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & { onClick: () => void })
  );

const sizeMap: Record<'Small' | 'Medium' | 'Large', number> = {
  Small: 16,
  Medium: 20,
  Large: 24,
};

const colorClass: Record<IconColor, string> = {
  primary: styles['icon--color-primary'],
  secondary: styles['icon--color-secondary'],
  'on-primary': styles['icon--color-on-primary'],
  disabled: styles['icon--color-disabled'],
  negative: styles['icon--color-negative'],
  positive: styles['icon--color-positive'],
  warning: styles['icon--color-warning'],
  current: styles['icon--color-current'],
};

function resolveSize(size: IconSize): number {
  return typeof size === 'number' ? size : sizeMap[size];
}

export function Icon(props: IconProps) {
  const {
    icon: LucideComponent,
    size = 'Medium',
    color = 'secondary',
    label,
    strokeWidth = 2,
    className,
    onClick,
    ...rest
  } = props;

  const pixelSize = resolveSize(size);
  const classes = [
    styles.icon,
    colorClass[color],
    onClick ? styles['icon--interactive'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const glyph = (
    <LucideComponent size={pixelSize} strokeWidth={strokeWidth} aria-hidden="true" />
  );

  if (onClick) {
    const { disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        {...buttonRest}
      >
        {glyph}
      </button>
    );
  }

  return (
    <span
      className={classes}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...(rest as HTMLAttributes<HTMLSpanElement>)}
    >
      {glyph}
    </span>
  );
}
