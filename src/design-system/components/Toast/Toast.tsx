import type { ReactNode } from 'react';
import { Info, Loader2, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'Primary' | 'Negative' | 'Positive' | 'Warning';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface ToastProps {
  /** Figma: Type */
  type?: ToastType;
  /** Toast message */
  children: ReactNode;
  /** Optional inline link */
  link?: ToastAction;
  /** Optional action button */
  actionButton?: ToastAction;
  /** Figma: Loader */
  loading?: boolean;
  /** Close handler */
  onClose?: () => void;
  className?: string;
}

const typeClass: Record<ToastType, string> = {
  Primary: styles['toast--type-primary'],
  Negative: styles['toast--type-negative'],
  Positive: styles['toast--type-positive'],
  Warning: styles['toast--type-warning'],
};

function ActionLink({ action, className }: { action: ToastAction; className: string }) {
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

export function Toast({
  type = 'Primary',
  children,
  link,
  actionButton,
  loading = false,
  onClose,
  className,
}: ToastProps) {
  const classes = [styles.toast, typeClass[type], className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" aria-live="polite">
      <div className={styles.toast__row}>
        <div className={styles.toast__content}>
          <div className={styles.toast__titleRow}>
            {loading ? (
              <Loader2 className={styles.toast__loader} size={20} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Info className={styles.toast__icon} size={20} strokeWidth={2} aria-hidden="true" />
            )}
            <span className={styles.toast__message}>{children}</span>
          </div>
          {link ? <ActionLink action={link} className={styles.toast__link} /> : null}
        </div>
        <div className={styles.toast__actions}>
          {actionButton ? (
            <ActionLink action={actionButton} className={styles.toast__button} />
          ) : null}
          {onClose ? (
            <button
              type="button"
              className={styles.toast__close}
              onClick={onClose}
              aria-label="Dismiss toast"
            >
              <X size={16} strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
