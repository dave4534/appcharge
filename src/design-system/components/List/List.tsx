import type { ReactNode } from 'react';
import type { AvatarProps } from '../Avatar/Avatar';
import { cn } from '../_shared/cn';
import { ListItem } from './ListItem';
import styles from './List.module.css';

export type ListType = 'Regular';

export interface ListItemData {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  avatar?: Omit<AvatarProps, 'size'>;
  disabled?: boolean;
  selected?: boolean;
}

export interface ListProps {
  /** Figma: Type */
  type?: ListType;
  items: ListItemData[];
  onItemSelect?: (id: string) => void;
  className?: string;
  'aria-label'?: string;
}

export function List({
  type = 'Regular',
  items,
  onItemSelect,
  className,
  'aria-label': ariaLabel = 'List',
}: ListProps) {
  return (
    <ul
      className={cn(styles.list, styles[`list--type-${type.toLowerCase()}`], className)}
      role="listbox"
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <li key={item.id} role="presentation" className={styles.list__item}>
          <ListItem
            label={item.label}
            badge={item.badge}
            leftIcon={item.leftIcon}
            rightIcon={item.rightIcon}
            avatar={item.avatar}
            selected={item.selected}
            disabled={item.disabled}
            onClick={onItemSelect ? () => onItemSelect(item.id) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

export { ListItem } from './ListItem';
export type { ListItemProps, ListItemState } from './ListItem';
