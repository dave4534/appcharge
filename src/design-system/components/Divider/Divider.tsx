import type { HTMLAttributes } from 'react';
import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  /** Figma: Orientation */
  orientation?: DividerOrientation;
}

const orientationClass: Record<DividerOrientation, string> = {
  horizontal: styles['divider--horizontal'],
  vertical: styles['divider--vertical'],
};

export function Divider({
  orientation = 'horizontal',
  className,
  ...rest
}: DividerProps) {
  const classes = [styles.divider, orientationClass[orientation], className]
    .filter(Boolean)
    .join(' ');

  return <hr className={classes} {...rest} />;
}
