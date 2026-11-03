import type { HTMLAttributes } from 'react';
import { cn } from '../_shared/cn';
import styles from './LinearProgressBar.module.css';

export type LinearProgressBarType = 'Primary' | 'Positive' | 'Negative' | 'Multi';
export type LinearProgressBarSize = 'Small';
export type LinearProgressBarLabel = 'On' | 'Off';

export interface LinearProgressBarSegment {
  value: number;
  type?: Exclude<LinearProgressBarType, 'Multi'>;
}

export interface LinearProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Type */
  type?: LinearProgressBarType;
  /** Figma: Size */
  size?: LinearProgressBarSize;
  /** Figma: Label */
  label?: LinearProgressBarLabel;
  /** Progress value 0–100 */
  value?: number;
  /** Segments for Multi type */
  segments?: LinearProgressBarSegment[];
}

const typeClass: Record<Exclude<LinearProgressBarType, 'Multi'>, string> = {
  Primary: styles['linearProgressBar__fill--primary'],
  Positive: styles['linearProgressBar__fill--positive'],
  Negative: styles['linearProgressBar__fill--negative'],
};

export function LinearProgressBar({
  type = 'Primary',
  size = 'Small',
  label = 'Off',
  value = 30,
  segments,
  className,
  ...rest
}: LinearProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const displayLabel = `${clampedValue}%`;

  const multiSegments =
    type === 'Multi'
      ? (segments ?? [
          { value: 33, type: 'Primary' },
          { value: 33, type: 'Positive' },
          { value: 34, type: 'Negative' },
        ])
      : null;

  return (
    <div
      className={cn(
        styles.linearProgressBar,
        styles[`linearProgressBar--size-${size.toLowerCase()}`],
        label === 'On' && styles['linearProgressBar--label-on'],
        className,
      )}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={displayLabel}
      {...rest}
    >
      <div className={styles.linearProgressBar__track}>
        {type === 'Multi' && multiSegments ? (
          multiSegments.map((segment, index) => (
            <span
              key={`${segment.type ?? 'Primary'}-${index}`}
              className={cn(
                styles.linearProgressBar__fill,
                typeClass[segment.type ?? 'Primary'],
              )}
              style={{ width: `${segment.value}%` }}
            />
          ))
        ) : (
          <span
            className={cn(
              styles.linearProgressBar__fill,
              typeClass[type as Exclude<LinearProgressBarType, 'Multi'>],
            )}
            style={{ width: `${clampedValue}%` }}
          />
        )}
      </div>
      {label === 'On' ? (
        <span className={styles.linearProgressBar__label}>{displayLabel}</span>
      ) : null}
    </div>
  );
}
