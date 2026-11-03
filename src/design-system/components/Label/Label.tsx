import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Label.module.css';

export type LabelColor = 'Primary' | 'Dark' | 'Positive' | 'Negative';
export type LabelKind = 'Fill' | 'Line';
export type LabelState = 'Default' | 'Hover' | 'Active';
export type LabelSize = 'Medium' | 'Small';

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma: Color */
  color?: LabelColor;
  /** Figma: Kind */
  kind?: LabelKind;
  /** Figma: State */
  state?: LabelState;
  /** Figma: Size */
  size?: LabelSize;
  /** Figma: Text */
  children?: ReactNode;
}

const colorClass: Record<LabelColor, string> = {
  Primary: styles['label--color-primary'],
  Dark: styles['label--color-dark'],
  Positive: styles['label--color-positive'],
  Negative: styles['label--color-negative'],
};

const kindClass: Record<LabelKind, string> = {
  Fill: styles['label--kind-fill'],
  Line: styles['label--kind-line'],
};

const stateClass: Record<LabelState, string> = {
  Default: '',
  Hover: styles['label--state-hover'],
  Active: styles['label--state-active'],
};

const sizeClass: Record<LabelSize, string> = {
  Medium: styles['label--size-medium'],
  Small: styles['label--size-small'],
};

export function Label({
  color = 'Primary',
  kind = 'Fill',
  state = 'Default',
  size = 'Medium',
  children = 'Label',
  className,
  ...rest
}: LabelProps) {
  const classes = [
    styles.label,
    colorClass[color],
    kindClass[kind],
    stateClass[state],
    sizeClass[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      <span className={styles.label__text}>{children}</span>
    </span>
  );
}
