import type { CSSProperties, ReactNode } from 'react';
import { User } from 'lucide-react';
import styles from './Avatar.module.css';

export type AvatarSize = 'Large' | 'Medium' | 'Small' | 'XS';
export type AvatarType = 'IMG' | 'Letter' | 'Initials' | 'Icon';

export interface AvatarProps {
  /** Figma: Size */
  size?: AvatarSize;
  /** Figma: Type */
  type?: AvatarType;
  /** Image URL for IMG type */
  src?: string;
  alt?: string;
  /** Letter or initials text */
  text?: string;
  /** Custom icon for Icon type */
  iconElement?: ReactNode;
  /** Background color for Letter type */
  letterColor?: string;
  /** Background color for Initials type */
  initialsColor?: string;
  disabled?: boolean;
  className?: string;
}

const sizeClass: Record<AvatarSize, string> = {
  Large: styles['avatar--size-large'],
  Medium: styles['avatar--size-medium'],
  Small: styles['avatar--size-small'],
  XS: styles['avatar--size-xs'],
};

const typeClass: Record<AvatarType, string> = {
  IMG: styles['avatar--type-img'],
  Letter: styles['avatar--type-letter'],
  Initials: styles['avatar--type-initials'],
  Icon: styles['avatar--type-icon'],
};

const iconSize: Record<AvatarSize, number> = {
  Large: 24,
  Medium: 16,
  Small: 14,
  XS: 12,
};

export function Avatar({
  size = 'Medium',
  type = 'IMG',
  src,
  alt = '',
  text,
  iconElement,
  letterColor,
  initialsColor,
  disabled = false,
  className,
}: AvatarProps) {
  const classes = [
    styles.avatar,
    sizeClass[size],
    typeClass[type],
    disabled ? styles['avatar--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style =
    type === 'Letter' && letterColor
      ? ({ '--avatar-letter-color': letterColor } as CSSProperties)
      : type === 'Initials' && initialsColor
        ? ({ '--avatar-initials-color': initialsColor } as CSSProperties)
        : undefined;

  let content: ReactNode = null;

  if (type === 'IMG') {
    content = src ? (
      <img className={styles.avatar__image} src={src} alt={alt} />
    ) : (
      <span className={styles.avatar__placeholder} aria-hidden="true" />
    );
  } else if (type === 'Letter' || type === 'Initials') {
    content = <span className={styles.avatar__text}>{text ?? (type === 'Letter' ? 'F' : 'RM')}</span>;
  } else {
    content = (
      <span className={styles.avatar__icon} aria-hidden="true">
        {iconElement ?? <User size={iconSize[size]} />}
      </span>
    );
  }

  return (
    <span className={classes} style={style} aria-disabled={disabled || undefined}>
      {content}
    </span>
  );
}
