import type { ReactNode } from 'react';
import { Avatar, type AvatarProps } from '../Avatar/Avatar';
import { Label } from '../Label/Label';
import { cn } from '../_shared/cn';
import styles from './ListItem.module.css';

export type ListItemState = 'Default' | 'Hover' | 'Selected' | 'Disabled';

export interface ListItemProps {
  /** Primary text */
  label: ReactNode;
  /** Optional secondary label badge */
  badge?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  avatar?: Omit<AvatarProps, 'size'>;
  state?: ListItemState;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const stateClass: Record<ListItemState, string> = {
  Default: '',
  Hover: styles['listItem--hover'],
  Selected: styles['listItem--selected'],
  Disabled: styles['listItem--disabled'],
};

export function ListItem({
  label,
  badge,
  leftIcon,
  rightIcon,
  avatar,
  state = 'Default',
  selected = false,
  disabled = false,
  onClick,
  className,
}: ListItemProps) {
  const isDisabled = disabled || state === 'Disabled';
  const isSelected = selected || state === 'Selected';
  const isInteractive = Boolean(onClick) && !isDisabled;

  const classes = cn(
    styles.listItem,
    stateClass[state],
    isSelected && styles['listItem--selected'],
    isDisabled && styles['listItem--disabled'],
    isInteractive && styles['listItem--interactive'],
    className,
  );

  const content = (
    <>
      <span className={styles.listItem__left}>
        {avatar ? (
          <span className={styles.listItem__avatar} aria-hidden="true">
            <Avatar size="Small" {...avatar} />
          </span>
        ) : null}
        {leftIcon ? (
          <span className={styles.listItem__icon} aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        <span className={styles.listItem__text}>{label}</span>
        {badge ? (
          <Label size="Small" color="Primary" kind="Fill">
            {badge}
          </Label>
        ) : null}
      </span>
      {rightIcon ? (
        <span className={styles.listItem__right} aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </>
  );

  if (isInteractive) {
    return (
      <button type="button" className={classes} disabled={isDisabled} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={classes} aria-disabled={isDisabled || undefined}>{content}</div>;
}
