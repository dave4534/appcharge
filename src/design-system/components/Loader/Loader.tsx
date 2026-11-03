import type { HTMLAttributes } from 'react';
import styles from './Loader.module.css';

export type LoaderSize = 'XS' | 'S' | 'M' | 'L';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: SIze */
  size?: LoaderSize;
  /** Accessible label for the loading indicator */
  label?: string;
}

const sizeClass: Record<LoaderSize, string> = {
  XS: styles['loader--size-xs'],
  S: styles['loader--size-s'],
  M: styles['loader--size-m'],
  L: styles['loader--size-l'],
};

export function Loader({
  size = 'M',
  label = 'Loading',
  className,
  ...rest
}: LoaderProps) {
  const classes = [styles.loader, sizeClass[size], className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" aria-label={label} {...rest}>
      <span className={styles.loader__track} aria-hidden="true" />
      <span className={styles.loader__spinner} aria-hidden="true" />
    </div>
  );
}
