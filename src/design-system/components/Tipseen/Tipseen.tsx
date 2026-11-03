import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../_shared/cn';
import styles from './Tipseen.module.css';

export type TipseenType = 'Inverted' | 'Primary';
export type TipseenTipPosition = 'No' | 'Bottom' | 'Left' | 'Right' | 'Top';

export interface TipseenAction {
  label: string;
  onClick?: () => void;
}

export interface TipseenProps {
  /** Figma: Type */
  type?: TipseenType;
  /** Figma: Tip position */
  tipPosition?: TipseenTipPosition;
  /** Figma: With image */
  withImage?: boolean;
  /** Figma: Close button */
  showCloseButton?: boolean;
  title?: string;
  message?: string;
  image?: ReactNode;
  primaryAction?: TipseenAction;
  secondaryAction?: TipseenAction;
  /** Optional step indicator e.g. "1/3" */
  stepLabel?: string;
  onClose?: () => void;
  className?: string;
}

const typeClass: Record<TipseenType, string> = {
  Inverted: styles['tipseen--type-inverted'],
  Primary: styles['tipseen--type-primary'],
};

const positionClass: Record<Exclude<TipseenTipPosition, 'No'>, string> = {
  Bottom: styles['tipseen--tip-bottom'],
  Left: styles['tipseen--tip-left'],
  Right: styles['tipseen--tip-right'],
  Top: styles['tipseen--tip-top'],
};

export function Tipseen({
  type = 'Inverted',
  tipPosition = 'No',
  withImage = false,
  showCloseButton = true,
  title = 'This is a title',
  message = 'Message will appear here, to give more information about the feature. Read more',
  image,
  primaryAction = { label: 'Next' },
  secondaryAction = { label: 'Back' },
  stepLabel,
  onClose,
  className,
}: TipseenProps) {
  return (
    <div
      className={cn(
        styles.tipseen,
        typeClass[type],
        tipPosition !== 'No' ? positionClass[tipPosition] : '',
        className,
      )}
      role="dialog"
      aria-labelledby="tipseen-title"
    >
      {showCloseButton && onClose ? (
        <button type="button" className={styles.tipseen__close} onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>
      ) : null}

      {withImage ? (
        <div className={styles.tipseen__image}>
          {image ?? <div className={styles.tipseen__imagePlaceholder} aria-hidden="true" />}
        </div>
      ) : null}

      <div className={styles.tipseen__content}>
        <h3 id="tipseen-title" className={styles.tipseen__title}>
          {title}
        </h3>
        <p className={styles.tipseen__message}>{message}</p>
      </div>

      <footer className={styles.tipseen__footer}>
        {secondaryAction ? (
          <Button kind="Tertiary" size="Small" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        ) : null}
        {stepLabel ? <span className={styles.tipseen__steps}>{stepLabel}</span> : null}
        {primaryAction ? (
          <Button
            kind={type === 'Inverted' ? 'Primary' : 'Primary'}
            size="Small"
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </Button>
        ) : null}
      </footer>
    </div>
  );
}
