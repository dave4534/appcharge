import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '../_shared/cn';
import styles from './Steps.module.css';

export type StepsType = 'Gallery' | 'Numbers' | 'GalleryOnly';
export type StepsOnColor = 'On White' | 'On Primary';

export interface StepsProps {
  /** Figma: Type */
  type?: StepsType;
  /** Figma: On color */
  onColor?: StepsOnColor;
  currentStep?: number;
  totalSteps?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export function Steps({
  type = 'Gallery',
  onColor = 'On White',
  currentStep = 1,
  totalSteps = 3,
  onPrevious,
  onNext,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  className,
}: StepsProps) {
  const isOnPrimary = onColor === 'On Primary';
  const safeCurrent = Math.min(Math.max(currentStep, 1), totalSteps);

  const buttonKind = isOnPrimary ? 'Tertiary' : 'Secondary';

  const dots = (
    <div className={styles.steps__dots} aria-hidden="true">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === safeCurrent;
        return (
          <span
            key={stepNumber}
            className={cn(
              styles.steps__dot,
              isActive && styles['steps__dot--active'],
              isOnPrimary && styles['steps__dot--on-primary'],
            )}
          />
        );
      })}
    </div>
  );

  if (type === 'GalleryOnly') {
    return (
      <div
        className={cn(
          styles.steps,
          isOnPrimary && styles['steps--on-primary'],
          className,
        )}
        aria-label={`Step ${safeCurrent} of ${totalSteps}`}
      >
        {dots}
      </div>
    );
  }

  return (
    <div
      className={cn(
        styles.steps,
        isOnPrimary && styles['steps--on-primary'],
        className,
      )}
      aria-label={`Step ${safeCurrent} of ${totalSteps}`}
    >
      <Button
        kind={buttonKind}
        size="Small"
        icon="Left"
        iconElement={<ChevronLeft size={16} />}
        onClick={onPrevious}
        disabled={safeCurrent <= 1}
      >
        {previousLabel}
      </Button>

      {type === 'Numbers' ? (
        <span className={styles.steps__counter}>
          {safeCurrent}/{totalSteps}
        </span>
      ) : (
        dots
      )}

      <Button
        kind={buttonKind}
        size="Small"
        icon="Right"
        iconElement={<ChevronRight size={16} />}
        onClick={onNext}
        disabled={safeCurrent >= totalSteps}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
