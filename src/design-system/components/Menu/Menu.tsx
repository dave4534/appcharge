import type { ReactNode } from 'react';
import { List, type ListItemData } from '../List/List';
import { cn } from '../_shared/cn';
import styles from './Menu.module.css';

export type MenuSize = 'Small' | 'Medium' | 'Large';

export interface MenuItem extends ListItemData {
  caption?: boolean;
  dividerAfter?: boolean;
}

export interface MenuProps {
  size?: MenuSize;
  items: MenuItem[];
  caption?: ReactNode;
  onItemSelect?: (id: string) => void;
  className?: string;
  'aria-label'?: string;
}

const sizeClass: Record<MenuSize, string> = {
  Small: styles['menu--size-small'],
  Medium: styles['menu--size-medium'],
  Large: styles['menu--size-large'],
};

export function Menu({
  size = 'Small',
  items,
  caption,
  onItemSelect,
  className,
  'aria-label': ariaLabel = 'Menu',
}: MenuProps) {
  const listItems: ListItemData[] = items.map(({ caption: _c, dividerAfter: _d, ...item }) => item);

  return (
    <nav className={cn(styles.menu, sizeClass[size], className)} aria-label={ariaLabel}>
      {caption ? <div className={styles.menu__caption}>{caption}</div> : null}
      <List items={listItems} onItemSelect={onItemSelect} className={styles.menu__list} />
    </nav>
  );
}
