import { useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../_shared/cn';
import styles from './Slider.module.css';

export type SliderType = 'Primary' | 'Positive' | 'Negative';
export type SliderSize = 'Large' | 'Medium' | 'Small';

export interface SliderProps {
  /** Figma: type */
  type?: SliderType;
  /** Figma: Size */
  size?: SliderSize;
  /** Figma: Range slider */
  range?: boolean;
  /** Figma: Label */
  showLabel?: boolean;
  label?: string;
  /** Figma: Icon */
  showIcon?: boolean;
  icon?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  rangeValue?: [number, number];
  defaultRangeValue?: [number, number];
  disabled?: boolean;
  onChange?: (value: number) => void;
  onRangeChange?: (value: [number, number]) => void;
  className?: string;
}

const typeClass: Record<SliderType, string> = {
  Primary: styles['slider--type-primary'],
  Positive: styles['slider--type-positive'],
  Negative: styles['slider--type-negative'],
};

const sizeClass: Record<SliderSize, string> = {
  Large: styles['slider--size-large'],
  Medium: styles['slider--size-medium'],
  Small: styles['slider--size-small'],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Slider({
  type = 'Primary',
  size = 'Large',
  range = true,
  showLabel = false,
  label = 'Label',
  showIcon = false,
  icon,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = 40,
  rangeValue,
  defaultRangeValue = [20, 70],
  disabled = false,
  onChange,
  onRangeChange,
  className,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalRange, setInternalRange] = useState(defaultRangeValue);

  const currentValue = value ?? internalValue;
  const currentRange = rangeValue ?? internalRange;
  const [rangeStart, rangeEnd] = currentRange;

  const percent = ((currentValue - min) / (max - min)) * 100;
  const startPercent = ((rangeStart - min) / (max - min)) * 100;
  const endPercent = ((rangeEnd - min) / (max - min)) * 100;

  function handleSingleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  }

  function handleRangeStartChange(event: ChangeEvent<HTMLInputElement>) {
    const nextStart = clamp(Number(event.target.value), min, rangeEnd - step);
    const next: [number, number] = [nextStart, rangeEnd];
    if (rangeValue === undefined) {
      setInternalRange(next);
    }
    onRangeChange?.(next);
  }

  function handleRangeEndChange(event: ChangeEvent<HTMLInputElement>) {
    const nextEnd = clamp(Number(event.target.value), rangeStart + step, max);
    const next: [number, number] = [rangeStart, nextEnd];
    if (rangeValue === undefined) {
      setInternalRange(next);
    }
    onRangeChange?.(next);
  }

  const trackStyle = range
    ? ({ '--slider-start': `${startPercent}%`, '--slider-end': `${endPercent}%` } as CSSProperties)
    : ({ '--slider-value': `${percent}%` } as CSSProperties);

  return (
    <div
      className={cn(
        styles.slider,
        typeClass[type],
        sizeClass[size],
        disabled && styles['slider--disabled'],
        className,
      )}
    >
      {showLabel ? <span className={styles.slider__label}>{label}</span> : null}
      <div className={styles.slider__row}>
        {showIcon && icon ? (
          <span className={styles.slider__icon} aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className={styles.slider__trackWrap} style={trackStyle}>
          <div className={styles.slider__track} aria-hidden="true">
            <div className={styles.slider__fill} />
          </div>
          {range ? (
            <>
              <input
                type="range"
                className={cn(styles.slider__input, styles['slider__input--start'])}
                min={min}
                max={max}
                step={step}
                value={rangeStart}
                disabled={disabled}
                aria-label={`${label} minimum`}
                onChange={handleRangeStartChange}
              />
              <input
                type="range"
                className={cn(styles.slider__input, styles['slider__input--end'])}
                min={min}
                max={max}
                step={step}
                value={rangeEnd}
                disabled={disabled}
                aria-label={`${label} maximum`}
                onChange={handleRangeEndChange}
              />
            </>
          ) : (
            <input
              type="range"
              className={styles.slider__input}
              min={min}
              max={max}
              step={step}
              value={currentValue}
              disabled={disabled}
              aria-label={label}
              onChange={handleSingleChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
