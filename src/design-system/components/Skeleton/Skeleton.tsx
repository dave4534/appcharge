import type { HTMLAttributes } from 'react';
import styles from './Skeleton.module.css';

export type SkeletonType = 'Circle' | 'Rectangle' | 'H1 Text' | 'H2 Text' | 'Paragraph Text';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Type */
  type?: SkeletonType;
  /** Override width (CSS value) */
  width?: string | number;
  /** Override height (CSS value) */
  height?: string | number;
}

const typeClass: Record<SkeletonType, string> = {
  Circle: styles['skeleton--type-circle'],
  Rectangle: styles['skeleton--type-rectangle'],
  'H1 Text': styles['skeleton--type-h1'],
  'H2 Text': styles['skeleton--type-h2'],
  'Paragraph Text': styles['skeleton--type-paragraph'],
};

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
}

export function Skeleton({
  type = 'Rectangle',
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const classes = [styles.skeleton, typeClass[type], className].filter(Boolean).join(' ');

  const cssWidth = toCssSize(width);
  const cssHeight = toCssSize(height);

  return (
    <div
      className={classes}
      aria-hidden="true"
      style={{
        ...(cssWidth ? { width: cssWidth } : {}),
        ...(cssHeight ? { height: cssHeight } : {}),
        ...style,
      }}
      {...rest}
    />
  );
}
