import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

export interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
  /** Optional leading icon — Figma: Icon=On */
  icon?: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Allow multiple panels open at once */
  allowMultiple?: boolean;
  /** Initially expanded item ids */
  defaultExpanded?: string[];
  /** Figma: Icon=On — show icon slot on each item */
  showItemIcon?: boolean;
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  showItemIcon = false,
  className,
}: AccordionProps) {
  const baseId = useId();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (!allowMultiple) {
        next.clear();
      }
      next.add(id);
      return next;
    });
  };

  const rootClass = [styles.accordion, className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {items.map((item) => {
        const isOpen = expanded.has(item.id);
        const triggerId = `${baseId}-${item.id}-trigger`;
        const panelId = `${baseId}-${item.id}-panel`;

        return (
          <div key={item.id} className={styles.accordion__item}>
            <button
              type="button"
              id={triggerId}
              className={styles.accordion__trigger}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
            >
              {showItemIcon ? (
                <span className={styles.accordion__itemIcon} aria-hidden="true">
                  {item.icon ?? <span className={styles.accordion__iconPlaceholder} />}
                </span>
              ) : null}
              <span className={styles.accordion__title}>{item.title}</span>
              <ChevronDown
                className={[styles.accordion__chevron, isOpen ? styles['accordion__chevron--open'] : '']
                  .filter(Boolean)
                  .join(' ')}
                size={20}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={[styles.accordion__panel, isOpen ? styles['accordion__panel--open'] : '']
                .filter(Boolean)
                .join(' ')}
              hidden={!isOpen}
            >
              <div className={styles.accordion__panelInner}>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
