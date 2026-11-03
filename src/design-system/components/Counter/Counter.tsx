import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Counter.module.css';

export type CounterSize = 'Small' | 'Large';
export type CounterColor = 'Primary' | 'Negative' | 'Dark' | 'Light';
export type CounterKind = 'Fill' | 'Line';

export interface CounterProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma: Size */
  size?: CounterSize;
  /** Figma: Color */
  color?: CounterColor;
  /** Figma: Kind */
  kind?: CounterKind;
  /** Figma: Number */
  children?: ReactNode;
}

const sizeClass: Record<CounterSize, string> = {
  Small: styles['counter--size-small'],
  Large: styles['counter--size-large'],
};

const colorClass: Record<CounterColor, string> = {
  Primary: styles['counter--color-primary'],
  Negative: styles['counter--color-negative'],
  Dark: styles['counter--color-dark'],
  Light: styles['counter--color-light'],
};

const kindClass: Record<CounterKind, string> = {
  Fill: styles['counter--kind-fill'],
  Line: styles['counter--kind-line'],
};

export function Counter({
  size = 'Large',
  color = 'Primary',
  kind = 'Fill',
  children = '5',
  className,
  ...rest
}: CounterProps) {
  const classes = [
    styles.counter,
    sizeClass[size],
    colorClass[color],
    kindClass[kind],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      <span className={styles.counter__value}>{children}</span>
    </span>
  );
}
