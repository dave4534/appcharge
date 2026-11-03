import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../Button';
import styles from './EmptyState.module.css';

export type EmptyStateVariant = 'default' | 'compact' | 'inline' | 'main';

export interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface EmptyStateProps {
  /** Figma: Use Cases */
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  /** Custom illustration slot */
  illustration?: ReactNode;
  mainAction?: EmptyStateAction;
  supportingAction?: EmptyStateAction;
  className?: string;
}

function TextLink({ action, className }: { action: EmptyStateAction; className: string }) {
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

export function EmptyState({
  variant = 'default',
  title,
  description,
  illustration,
  mainAction,
  supportingAction,
  className,
}: EmptyStateProps) {
  const classes = [
    styles['empty-state'],
    styles[`empty-state--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showIllustration = variant !== 'inline';

  return (
    <div className={classes}>
      <div className={styles['empty-state__content']}>
        {showIllustration ? (
          <div className={styles['empty-state__visual']} aria-hidden="true">
            {illustration ?? (
              <div className={styles['empty-state__illustrationFallback']}>
                <Inbox size={variant === 'compact' ? 64 : 96} strokeWidth={1.5} />
              </div>
            )}
          </div>
        ) : null}
        <div className={styles['empty-state__text']}>
          <h2 className={styles['empty-state__title']}>{title}</h2>
          {description ? <p className={styles['empty-state__description']}>{description}</p> : null}
        </div>
      </div>
      {(mainAction || supportingAction) && variant !== 'inline' ? (
        <div className={styles['empty-state__actions']}>
          {mainAction ? (
            <Button kind="Secondary" size="Medium" onClick={mainAction.onClick}>
              {mainAction.label}
            </Button>
          ) : null}
          {supportingAction ? (
            <TextLink action={supportingAction} className={styles['empty-state__link']} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
