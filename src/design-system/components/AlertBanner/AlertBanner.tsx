import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import styles from './AlertBanner.module.css';

export type AlertBannerType = 'primary' | 'positive' | 'negative' | 'dark' | 'warning';

export interface AlertBannerAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface AlertBannerProps {
  /** Figma: Types */
  type?: AlertBannerType;
  /** Banner message */
  children: ReactNode;
  /** Optional text link CTA */
  link?: AlertBannerAction;
  /** Optional action button */
  actionButton?: AlertBannerAction;
  /** Close handler — omit to hide close button */
  onClose?: () => void;
  className?: string;
}

const typeClass: Record<AlertBannerType, string> = {
  primary: styles['alert-banner--type-primary'],
  positive: styles['alert-banner--type-positive'],
  negative: styles['alert-banner--type-negative'],
  dark: styles['alert-banner--type-dark'],
  warning: styles['alert-banner--type-warning'],
};

function ActionLink({ action, className }: { action: AlertBannerAction; className: string }) {
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

export function AlertBanner({
  type = 'primary',
  children,
  link,
  actionButton,
  onClose,
  className,
}: AlertBannerProps) {
  const classes = [styles['alert-banner'], typeClass[type], className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status">
      <div className={styles['alert-banner__content']}>
        <span className={styles['alert-banner__message']}>{children}</span>
        {link ? <ActionLink action={link} className={styles['alert-banner__link']} /> : null}
        {actionButton ? (
          <ActionLink action={actionButton} className={styles['alert-banner__button']} />
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          className={styles['alert-banner__close']}
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <X size={16} strokeWidth={2} />
        </button>
      ) : null}
    </div>
  );
}
