import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonKind = 'Primary' | 'Secondary' | 'Tertiary';
export type IconButtonSize = 'XXS' | 'XS' | 'Small' | 'Medium' | 'Large';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma: Kind */
  kind?: IconButtonKind;
  /** Figma: Size */
  size?: IconButtonSize;
  /** Icon slot — maps to Figma Icon INSTANCE_SWAP */
  iconElement?: ReactNode;
  'aria-label': string;
}

const kindClass: Record<IconButtonKind, string> = {
  Primary: styles['icon-button--kind-primary'],
  Secondary: styles['icon-button--kind-secondary'],
  Tertiary: styles['icon-button--kind-tertiary'],
};

const sizeClass: Record<IconButtonSize, string> = {
  XXS: styles['icon-button--size-xxs'],
  XS: styles['icon-button--size-xs'],
  Small: styles['icon-button--size-small'],
  Medium: styles['icon-button--size-medium'],
  Large: styles['icon-button--size-large'],
};

export function IconButton({
  kind = 'Primary',
  size = 'Medium',
  iconElement,
  className,
  disabled,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = [
    styles['icon-button'],
    kindClass[kind],
    sizeClass[size],
    disabled ? styles['icon-button--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      <span className={styles['icon-button__icon']} aria-hidden="true">
        {iconElement}
      </span>
    </button>
  );
}
