import { Check } from 'lucide-react';
import { cn } from '../_shared/cn';
import styles from './MultiStepIndicator.module.css';

export type MultiStepIndicatorSize = 'Regular' | 'Compact';
export type MultiStepIndicatorType = 'Primary' | 'Success' | 'Negative' | 'Dark';
export type MultiStepIndicatorOrientation = 'Vertical' | 'Horizontal';

export interface MultiStepIndicatorStep {
  label: string;
  subtitle?: string;
}

export interface MultiStepIndicatorProps {
  /** Figma: Size */
  size?: MultiStepIndicatorSize;
  /** Figma: Type */
  type?: MultiStepIndicatorType;
  /** Figma: Text */
  orientation?: MultiStepIndicatorOrientation;
  /** Figma: Step — 1-based active step index */
  currentStep?: number;
  steps?: MultiStepIndicatorStep[];
  className?: string;
}

const sizeClass: Record<MultiStepIndicatorSize, string> = {
  Regular: styles['multi-step-indicator--size-regular'],
  Compact: styles['multi-step-indicator--size-compact'],
};

const typeClass: Record<MultiStepIndicatorType, string> = {
  Primary: styles['multi-step-indicator--type-primary'],
  Success: styles['multi-step-indicator--type-success'],
  Negative: styles['multi-step-indicator--type-negative'],
  Dark: styles['multi-step-indicator--type-dark'],
};

const defaultSteps: MultiStepIndicatorStep[] = [
  { label: 'Step title', subtitle: 'Step subtitle' },
  { label: 'Step title', subtitle: 'Step subtitle' },
  { label: 'Step title', subtitle: 'Step subtitle' },
  { label: 'Step title', subtitle: 'Step subtitle' },
  { label: 'Step title', subtitle: 'Step subtitle' },
];

function getStepState(index: number, currentStep: number): 'complete' | 'active' | 'upcoming' {
  const stepNumber = index + 1;
  if (stepNumber < currentStep) return 'complete';
  if (stepNumber === currentStep) return 'active';
  return 'upcoming';
}

export function MultiStepIndicator({
  size = 'Regular',
  type = 'Primary',
  orientation = 'Horizontal',
  currentStep = 1,
  steps = defaultSteps,
  className,
}: MultiStepIndicatorProps) {
  return (
    <ol
      className={cn(
        styles['multi-step-indicator'],
        sizeClass[size],
        typeClass[type],
        orientation === 'Vertical'
          ? styles['multi-step-indicator--vertical']
          : styles['multi-step-indicator--horizontal'],
        className,
      )}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const state = getStepState(index, currentStep);
        const isLast = index === steps.length - 1;

        return (
          <li
            key={`${step.label}-${index}`}
            className={cn(
              styles['multi-step-indicator__item'],
              styles[`multi-step-indicator__item--${state}`],
            )}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <div className={styles['multi-step-indicator__markerRow']}>
              <span className={styles['multi-step-indicator__marker']} aria-hidden="true">
                {state === 'complete' ? (
                  <Check size={size === 'Compact' ? 12 : 14} strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    styles['multi-step-indicator__connector'],
                    state === 'complete' && styles['multi-step-indicator__connector--complete'],
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className={styles['multi-step-indicator__text']}>
              <span className={styles['multi-step-indicator__label']}>{step.label}</span>
              {step.subtitle && size === 'Regular' ? (
                <span className={styles['multi-step-indicator__subtitle']}>{step.subtitle}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
