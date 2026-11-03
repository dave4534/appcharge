import type { ReactNode } from 'react';
import {
  Building2,
  ChevronRight,
  Folder,
  LayoutGrid,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import styles from './Breadcrumbs.module.css';

export type BreadcrumbName = 'Workspace' | 'Folder' | 'Group' | 'Board' | 'Children';
export type BreadcrumbState = 'Regular' | 'Current';

export interface BreadcrumbItemProps {
  /** Figma: Name */
  name?: BreadcrumbName;
  /** Figma: State */
  state?: BreadcrumbState;
  /** Override display label */
  label?: string;
  /** Custom icon override */
  icon?: ReactNode;
  /** Show trailing chevron separator */
  showSeparator?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const nameIcons: Record<BreadcrumbName, ReactNode> = {
  Workspace: <Building2 size={14} strokeWidth={2} />,
  Folder: <Folder size={14} strokeWidth={2} />,
  Group: <Users size={14} strokeWidth={2} />,
  Board: <LayoutGrid size={14} strokeWidth={2} />,
  Children: <MoreHorizontal size={14} strokeWidth={2} />,
};

const defaultLabels: Record<BreadcrumbName, string> = {
  Workspace: 'Workspace',
  Folder: 'Folder',
  Group: 'Group',
  Board: 'Board',
  Children: '...',
};

export function BreadcrumbItem({
  name = 'Board',
  state = 'Regular',
  label,
  icon,
  showSeparator = true,
  href,
  onClick,
  className,
}: BreadcrumbItemProps) {
  const displayLabel = label ?? defaultLabels[name];
  const isCurrent = state === 'Current';

  const itemClass = [
    styles['breadcrumb-item'],
    isCurrent ? styles['breadcrumb-item--current'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className={styles['breadcrumb-item__icon']} aria-hidden="true">
        {icon ?? nameIcons[name]}
      </span>
      <span className={styles['breadcrumb-item__label']}>{displayLabel}</span>
    </>
  );

  return (
    <span className={itemClass}>
      {href || onClick ? (
        <a
          href={href ?? '#'}
          className={styles['breadcrumb-item__link']}
          onClick={(e) => {
            if (!href) e.preventDefault();
            onClick?.();
          }}
          aria-current={isCurrent ? 'page' : undefined}
        >
          {content}
        </a>
      ) : (
        <span className={styles['breadcrumb-item__link']} aria-current={isCurrent ? 'page' : undefined}>
          {content}
        </span>
      )}
      {showSeparator ? (
        <ChevronRight className={styles['breadcrumb-item__separator']} size={14} strokeWidth={2} aria-hidden="true" />
      ) : null}
    </span>
  );
}

export interface BreadcrumbBarItem {
  name?: BreadcrumbName;
  label?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsBarProps {
  items: BreadcrumbBarItem[];
  className?: string;
}

export function BreadcrumbsBar({ items, className }: BreadcrumbsBarProps) {
  if (items.length === 0) return null;

  const rootClass = [styles['breadcrumbs-bar'], className].filter(Boolean).join(' ');

  return (
    <nav className={rootClass} aria-label="Breadcrumb">
      <ol className={styles['breadcrumbs-bar__list']}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label ?? item.name ?? index}-${index}`} className={styles['breadcrumbs-bar__item']}>
              <BreadcrumbItem
                name={item.name}
                label={item.label}
                icon={item.icon}
                state={isLast ? 'Current' : 'Regular'}
                showSeparator={!isLast}
                href={item.href}
                onClick={item.onClick}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
