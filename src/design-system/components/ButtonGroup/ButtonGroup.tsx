import type { ButtonHTMLAttributes } from 'react';
import styles from './ButtonGroup.module.css';

export type ButtonGroupSize = 'Small' | 'Medium' | 'Large';
export type ButtonGroupVariant = 'Default' | 'Tertiary';

export interface ButtonGroupItem {
  label: string;
  value: string;
}

export interface ButtonGroupProps extends Omit<ButtonHTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Figma: Size */
  size?: ButtonGroupSize;
  /** Figma: Variant */
  variant?: ButtonGroupVariant;
  /** Segment labels and values */
  items: ButtonGroupItem[];
  /** Currently selected value */
  value?: string;
  /** Default selected value (uncontrolled) */
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const sizeClass: Record<ButtonGroupSize, string> = {
  Small: styles['button-group--size-small'],
  Medium: styles['button-group--size-medium'],
  Large: styles['button-group--size-large'],
};

const variantClass: Record<ButtonGroupVariant, string> = {
  Default: styles['button-group--variant-default'],
  Tertiary: styles['button-group--variant-tertiary'],
};

export function ButtonGroup({
  size = 'Medium',
  variant = 'Default',
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className,
  ...rest
}: ButtonGroupProps) {
  const classes = [
    styles['button-group'],
    sizeClass[size],
    variantClass[variant],
    disabled ? styles['button-group--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const selected = value ?? defaultValue ?? items[0]?.value;

  return (
    <div className={classes} role="group" {...rest}>
      {items.map((item, index) => {
        const isSelected = item.value === selected;
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        const buttonClasses = [
          styles['button-group__button'],
          isSelected ? styles['button-group__button--selected'] : '',
          isFirst ? styles['button-group__button--first'] : '',
          isLast ? styles['button-group__button--last'] : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={item.value}
            type="button"
            className={buttonClasses}
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onChange?.(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
