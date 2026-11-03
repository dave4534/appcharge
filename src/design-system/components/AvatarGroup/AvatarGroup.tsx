import { Avatar, type AvatarProps, type AvatarSize } from '../Avatar/Avatar';
import { cn } from '../_shared/cn';
import styles from './AvatarGroup.module.css';

export type AvatarGroupSize = AvatarSize;
export type AvatarGroupState = 'Default' | 'Disabled';

export interface AvatarGroupItem extends Omit<AvatarProps, 'size' | 'disabled'> {
  id: string;
}

export interface AvatarGroupProps {
  /** Figma: Size */
  size?: AvatarGroupSize;
  /** Figma: State */
  state?: AvatarGroupState;
  items: AvatarGroupItem[];
  /** Max avatars shown before counter */
  max?: number;
  /** Remaining count shown in counter badge */
  overflowCount?: number;
  className?: string;
}

const sizeClass: Record<AvatarGroupSize, string> = {
  Large: styles['avatarGroup--size-large'],
  Medium: styles['avatarGroup--size-medium'],
  Small: styles['avatarGroup--size-small'],
  XS: styles['avatarGroup--size-xs'],
};

const counterFontSize: Record<AvatarGroupSize, string> = {
  Large: '16px',
  Medium: '14px',
  Small: '12px',
  XS: '10px',
};

export function AvatarGroup({
  size = 'Medium',
  state = 'Default',
  items,
  max = 3,
  overflowCount,
  className,
}: AvatarGroupProps) {
  const isDisabled = state === 'Disabled';
  const visibleItems = items.slice(0, max);
  const remaining =
    overflowCount ?? Math.max(items.length - max, 0);

  return (
    <div
      className={cn(
        styles.avatarGroup,
        sizeClass[size],
        isDisabled && styles['avatarGroup--disabled'],
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      {visibleItems.map((item) => (
        <span key={item.id} className={styles.avatarGroup__item}>
          <Avatar {...item} size={size} disabled={isDisabled} />
        </span>
      ))}
      {remaining > 0 ? (
        <span className={styles.avatarGroup__counter} aria-label={`${remaining} more`}>
          <span
            className={styles.avatarGroup__counterText}
            style={{ fontSize: counterFontSize[size] }}
          >
            +{remaining}
          </span>
        </span>
      ) : null}
    </div>
  );
}
