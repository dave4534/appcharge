import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Content the badge indicator wraps */
  children?: ReactNode;
  /** Show the indicator dot */
  show?: boolean;
}

export function Badge({ children, show = true, className, ...rest }: BadgeProps) {
  const classes = [styles.badge, className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
      {show ? <span className={styles.badge__indicator} aria-hidden="true" /> : null}
    </span>
  );
}
