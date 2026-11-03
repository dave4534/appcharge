import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonKind = 'Primary' | 'Secondary' | 'Tertiary' | 'Brand';
export type ButtonSize = 'XS' | 'Small' | 'Medium' | 'Large';
export type ButtonIcon = 'Default' | 'Left' | 'Right';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: Kind */
  kind?: ButtonKind;
  /** Figma: Size */
  size?: ButtonSize;
  /** Figma: Icon */
  icon?: ButtonIcon;
  /** Figma: Button text */
  children?: ReactNode;
  /** Icon slot — maps to Figma Icon type INSTANCE_SWAP */
  iconElement?: ReactNode;
  /** Shows a spinner and blocks interaction while an action is in progress */
  loading?: boolean;
}

const kindClass: Record<ButtonKind, string> = {
  Primary: styles['button--kind-primary'],
  Secondary: styles['button--kind-secondary'],
  Tertiary: styles['button--kind-tertiary'],
  Brand: styles['button--kind-brand'],
};

const sizeClass: Record<ButtonSize, string> = {
  XS: styles['button--size-xs'],
  Small: styles['button--size-small'],
  Medium: styles['button--size-medium'],
  Large: styles['button--size-large'],
};

export function Button({
  kind = 'Primary',
  size = 'Medium',
  icon = 'Default',
  children = 'Button',
  iconElement,
  className,
  disabled,
  loading = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    styles.button,
    kindClass[kind],
    sizeClass[size],
    icon === 'Left' ? styles['button--icon-left'] : '',
    icon === 'Right' ? styles['button--icon-right'] : '',
    isDisabled && !loading ? styles['button--disabled'] : '',
    loading ? styles['button--loading'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconNode = iconElement ? (
    <span className={styles.button__icon} aria-hidden="true">
      {iconElement}
    </span>
  ) : null;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.button__loader} aria-hidden="true" /> : null}
      {!loading && icon === 'Left' && iconNode}
      <span className={styles.button__label}>{children}</span>
      {!loading && icon === 'Right' && iconNode}
    </button>
  );
}
