import type { AnchorHTMLAttributes, ReactNode } from 'react';
import styles from './Link.module.css';

export type LinkSize = 'Small' | 'Large';
export type LinkState = 'Default' | 'Hover' | 'Disabled';
export type LinkIconPosition = 'No icon' | 'Start' | 'End';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Figma: Size */
  size?: LinkSize;
  /** Figma: State */
  state?: LinkState;
  /** Figma: Icon position */
  iconPosition?: LinkIconPosition;
  /** Figma: Link text */
  children?: ReactNode;
  /** Icon slot — maps to Figma Icon type INSTANCE_SWAP */
  iconElement?: ReactNode;
  /** Use inverted surface colors (on dark backgrounds) */
  inverted?: boolean;
}

const sizeClass: Record<LinkSize, string> = {
  Small: styles['link--size-small'],
  Large: styles['link--size-large'],
};

const stateClass: Record<LinkState, string> = {
  Default: '',
  Hover: styles['link--state-hover'],
  Disabled: styles['link--state-disabled'],
};

export function Link({
  size = 'Large',
  state = 'Default',
  iconPosition = 'No icon',
  children = 'Read more',
  iconElement,
  inverted = false,
  className,
  href = '#',
  ...rest
}: LinkProps) {
  const classes = [
    styles.link,
    sizeClass[size],
    stateClass[state],
    inverted ? styles['link--inverted'] : '',
    iconPosition === 'Start' ? styles['link--icon-start'] : '',
    iconPosition === 'End' ? styles['link--icon-end'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconNode = iconElement ? (
    <span className={styles.link__icon} aria-hidden="true">
      {iconElement}
    </span>
  ) : null;

  const isDisabled = state === 'Disabled';

  if (isDisabled) {
    return (
      <span className={classes} aria-disabled="true" role="link">
        {iconPosition === 'Start' && iconNode}
        <span className={styles.link__text}>{children}</span>
        {iconPosition === 'End' && iconNode}
      </span>
    );
  }

  return (
    <a className={classes} href={href} {...rest}>
      {iconPosition === 'Start' && iconNode}
      <span className={styles.link__text}>{children}</span>
      {iconPosition === 'End' && iconNode}
    </a>
  );
}
