import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '../_shared/cn';
import styles from './Modal.module.css';

export type ModalSize = 'Small' | 'Medium' | 'Large';

export interface ModalAction {
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface ModalProps {
  /** Figma: Size */
  size?: ModalSize;
  /** Figma: Scroll */
  scroll?: boolean;
  open?: boolean;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  onClose?: () => void;
  className?: string;
}

const sizeClass: Record<ModalSize, string> = {
  Small: styles['modal__dialog--size-small'],
  Medium: styles['modal__dialog--size-medium'],
  Large: styles['modal__dialog--size-large'],
};

export function Modal({
  size = 'Small',
  scroll = false,
  open = true,
  title = 'Modal title',
  subtitle = 'Modal subtitle, can come with icon and link.',
  children,
  primaryAction = { label: 'Primary' },
  secondaryAction = { label: 'Secondary' },
  onClose,
  className,
}: ModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.modal} role="presentation">
      <button
        type="button"
        className={styles.modal__backdrop}
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className={cn(styles.modal__dialog, sizeClass[size], className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
      >
        <header className={styles.modal__header}>
          <div className={styles.modal__heading}>
            <h2 id={titleId} className={styles.modal__title}>
              {title}
            </h2>
            {subtitle ? (
              <p id={subtitleId} className={styles.modal__subtitle}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {onClose ? (
            <button
              type="button"
              className={styles.modal__close}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} strokeWidth={2} />
            </button>
          ) : null}
        </header>

        <div
          className={cn(styles.modal__body, scroll && styles['modal__body--scroll'])}
        >
          {children}
        </div>

        <footer className={styles.modal__footer}>
          {secondaryAction ? (
            <Button
              kind="Secondary"
              size="Medium"
              onClick={secondaryAction.onClick}
              loading={secondaryAction.loading}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
          {primaryAction ? (
            <Button
              kind="Primary"
              size="Medium"
              onClick={primaryAction.onClick}
              loading={primaryAction.loading}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
