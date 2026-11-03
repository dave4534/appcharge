import type { ReactNode } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '../Button';
import styles from './AttentionBox.module.css';

export type AttentionBoxType = 'Primary' | 'Neutral' | 'Positive' | 'Warning' | 'Negative';

export interface AttentionBoxAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface AttentionBoxProps {
  /** Figma: Type */
  type?: AttentionBoxType;
  /** Figma: With title */
  title?: string;
  /** Body copy */
  children: ReactNode;
  /** Figma: Compact */
  compact?: boolean;
  /** Text link CTA */
  link?: AttentionBoxAction;
  /** Button CTA */
  actionButton?: AttentionBoxAction;
  /** Close handler — omit to hide close button */
  onClose?: () => void;
  /** Show info icon */
  showIcon?: boolean;
  className?: string;
}

const typeClass: Record<AttentionBoxType, string> = {
  Primary: styles['attention-box--type-primary'],
  Neutral: styles['attention-box--type-neutral'],
  Positive: styles['attention-box--type-positive'],
  Warning: styles['attention-box--type-warning'],
  Negative: styles['attention-box--type-negative'],
};

function TextLink({ action, className }: { action: AttentionBoxAction; className: string }) {
  if (action.href) {
    return (
      <a href={action.href} className={className} onClick={action.onClick}>
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={action.onClick}>
      {action.label}
    </button>
  );
}

export function AttentionBox({
  type = 'Primary',
  title,
  children,
  compact = false,
  link,
  actionButton,
  onClose,
  showIcon = true,
  className,
}: AttentionBoxProps) {
  const classes = [
    styles['attention-box'],
    typeClass[type],
    compact ? styles['attention-box--compact'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasCta = Boolean(link || actionButton);

  return (
    <div className={classes} role="note">
      {showIcon ? (
        <div className={styles['attention-box__icon']}>
          <Info size={20} strokeWidth={2} aria-hidden="true" />
        </div>
      ) : null}
      <div className={styles['attention-box__body']}>
        {title ? (
          <div className={styles['attention-box__header']}>
            <h3 className={styles['attention-box__title']}>{title}</h3>
            {onClose ? (
              <button
                type="button"
                className={styles['attention-box__close']}
                onClick={onClose}
                aria-label="Dismiss"
              >
                <X size={16} strokeWidth={2} />
              </button>
            ) : null}
          </div>
        ) : null}
        <p className={styles['attention-box__text']}>{children}</p>
        {hasCta ? (
          <div className={styles['attention-box__actions']}>
            {link ? <TextLink action={link} className={styles['attention-box__link']} /> : null}
            {actionButton ? (
              <Button kind="Secondary" size="Small" onClick={actionButton.onClick}>
                {actionButton.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
