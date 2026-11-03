import type { ReactNode } from 'react';
import { cn } from '../_shared/cn';
import styles from './Tooltip.module.css';

export type TooltipArrowPosition = 'Top' | 'Bottom' | 'Left' | 'Right';
export type TooltipWidth = 'max' | 'custom';

export interface TooltipProps {
  /** Trigger element */
  children: ReactNode;
  /** Figma: Text */
  content?: string;
  /** Figma: Tooltip title */
  title?: string;
  showTitle?: boolean;
  /** Figma: Arrow position */
  arrowPosition?: TooltipArrowPosition;
  /** Figma: State — max width 240px vs custom */
  widthMode?: TooltipWidth;
  maxWidth?: number;
  className?: string;
}

const positionClass: Record<TooltipArrowPosition, string> = {
  Top: styles['tooltip--arrow-top'],
  Bottom: styles['tooltip--arrow-bottom'],
  Left: styles['tooltip--arrow-left'],
  Right: styles['tooltip--arrow-right'],
};

export function Tooltip({
  children,
  content = 'Tooltip label',
  title = 'Tooltip title',
  showTitle = false,
  arrowPosition = 'Bottom',
  widthMode = 'max',
  maxWidth = 240,
  className,
}: TooltipProps) {
  const bubbleStyle = widthMode === 'custom' ? { maxWidth: `${maxWidth}px` } : undefined;

  return (
    <span className={cn(styles.tooltip, className)}>
      {children}
      <span
        className={cn(styles.tooltip__bubble, positionClass[arrowPosition])}
        style={bubbleStyle}
        role="tooltip"
      >
        {showTitle ? <span className={styles.tooltip__title}>{title}</span> : null}
        <span className={styles.tooltip__text}>{content}</span>
      </span>
    </span>
  );
}
