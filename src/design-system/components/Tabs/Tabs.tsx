import { useState, type ReactNode } from 'react';
import { cn } from '../_shared/cn';
import styles from './Tabs.module.css';

export type TabsType = 'normal' | 'counter';
export type TabsStretched = 'on' | 'off';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Figma: Type */
  type?: TabsType;
  /** Figma: Stretched */
  stretched?: TabsStretched;
  items: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  type = 'normal',
  stretched = 'off',
  items,
  activeId,
  defaultActiveId,
  onChange,
  className,
}: TabsProps) {
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? items[0]?.id ?? '',
  );

  const currentId = activeId ?? internalActiveId;

  function handleSelect(id: string) {
    if (!activeId) {
      setInternalActiveId(id);
    }
    onChange?.(id);
  }

  return (
    <div
      className={cn(
        styles.tabs,
        stretched === 'on' && styles['tabs--stretched'],
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const selected = item.id === currentId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={cn(
              styles.tabs__tab,
              selected && styles['tabs__tab--selected'],
            )}
            aria-selected={selected}
            disabled={item.disabled}
            onClick={() => handleSelect(item.id)}
          >
            <span className={styles.tabs__content}>
              {item.icon ? (
                <span className={styles.tabs__icon} aria-hidden="true">
                  {item.icon}
                </span>
              ) : null}
              <span className={styles.tabs__label}>{item.label}</span>
              {type === 'counter' && item.count !== undefined ? (
                <span className={styles.tabs__counter}>/ {item.count}</span>
              ) : null}
            </span>
            <span className={styles.tabs__underline} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
