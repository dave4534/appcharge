import { useEffect, useId, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../_shared/cn';
import controlStyles from '../_shared/inputControl.module.css';
import { FieldShell } from '../_shared/FieldShell';
import styles from './DatePicker.module.css';

export type DatePickerType = 'Default' | 'Date' | 'Date Range';

export interface DatePickerProps {
  /** Figma: Type */
  type?: DatePickerType;
  /** Figma: With Dialog */
  withDialog?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  rangeValue?: [string, string];
  defaultRangeValue?: [string, string];
  onChange?: (value: string) => void;
  onRangeChange?: (value: [string, string]) => void;
  disabled?: boolean;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthMatrix(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

interface MonthPanelProps {
  monthDate: Date;
  selectedDate: Date | null;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onSelect: (date: Date) => void;
}

function MonthPanel({
  monthDate,
  selectedDate,
  rangeStart,
  rangeEnd,
  onSelect,
}: MonthPanelProps) {
  const cells = getMonthMatrix(monthDate.getFullYear(), monthDate.getMonth());

  return (
    <div className={styles.datePicker__month}>
      <div className={styles.datePicker__monthTitle}>
        {monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      <div className={styles.datePicker__weekdays}>
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.datePicker__weekday}>
            {day}
          </span>
        ))}
      </div>
      <div className={styles.datePicker__days}>
        {cells.map((date, index) => {
          if (!date) {
            return <span key={`empty-${index}`} className={styles.datePicker__dayEmpty} />;
          }

          const selected = isSameDay(date, selectedDate);
          const inRange = isBetween(date, rangeStart, rangeEnd);
          const rangeEdge = isSameDay(date, rangeStart) || isSameDay(date, rangeEnd);

          return (
            <button
              key={date.toISOString()}
              type="button"
              className={cn(
                styles.datePicker__day,
                selected && styles['datePicker__day--selected'],
                inRange && styles['datePicker__day--inRange'],
                rangeEdge && styles['datePicker__day--rangeEdge'],
              )}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DatePicker({
  type = 'Date',
  withDialog = true,
  label = 'Label',
  required = false,
  placeholder = 'Select date',
  value,
  defaultValue = '',
  rangeValue,
  defaultRangeValue = ['', ''],
  onChange,
  onRangeChange,
  disabled = false,
  className,
}: DatePickerProps) {
  const dialogId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalRange, setInternalRange] = useState(defaultRangeValue);
  const [visibleMonth, setVisibleMonth] = useState(() => parseDate(defaultValue) ?? new Date());
  const [rangeDraftStart, setRangeDraftStart] = useState<Date | null>(null);

  const currentValue = value ?? internalValue;
  const currentRange = rangeValue ?? internalRange;
  const selectedDate = parseDate(currentValue);
  const rangeStart = parseDate(currentRange[0]);
  const rangeEnd = parseDate(currentRange[1]);

  const displayValue =
    type === 'Date Range' && rangeStart && rangeEnd
      ? `${formatDate(rangeStart)} – ${formatDate(rangeEnd)}`
      : selectedDate
        ? formatDate(selectedDate)
        : '';

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function commitSingle(date: Date) {
    const iso = date.toISOString();
    if (value === undefined) {
      setInternalValue(iso);
    }
    onChange?.(iso);
    setOpen(false);
  }

  function commitRange(start: Date, end: Date) {
    const next: [string, string] = [start.toISOString(), end.toISOString()];
    if (rangeValue === undefined) {
      setInternalRange(next);
    }
    onRangeChange?.(next);
    setRangeDraftStart(null);
    setOpen(false);
  }

  function handleSelect(date: Date) {
    if (type === 'Date Range') {
      if (!rangeDraftStart) {
        setRangeDraftStart(date);
        return;
      }

      const start = rangeDraftStart.getTime() <= date.getTime() ? rangeDraftStart : date;
      const end = rangeDraftStart.getTime() <= date.getTime() ? date : rangeDraftStart;
      commitRange(start, end);
      return;
    }

    commitSingle(date);
  }

  const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);

  return (
    <FieldShell label={label} required={required} showHelper={false}>
      <div className={cn(styles.datePicker, className)} ref={rootRef}>
        <div
          className={cn(
            controlStyles.control,
            controlStyles['control--size-large'],
            styles.datePicker__control,
            disabled && controlStyles['control--disabled'],
          )}
        >
          <input
            className={controlStyles.control__input}
            value={displayValue}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            aria-haspopup={withDialog ? 'dialog' : undefined}
            aria-expanded={withDialog ? open : undefined}
            aria-controls={withDialog ? dialogId : undefined}
            onClick={() => {
              if (!disabled && withDialog && type !== 'Default') {
                setOpen(true);
              }
            }}
          />
          <button
            type="button"
            className={styles.datePicker__iconButton}
            disabled={disabled || type === 'Default'}
            aria-label="Open calendar"
            onClick={() => {
              if (!disabled && withDialog && type !== 'Default') {
                setOpen((current) => !current);
              }
            }}
          >
            <Calendar size={16} strokeWidth={2} />
          </button>
        </div>

        {open && withDialog && type !== 'Default' ? (
          <div id={dialogId} className={styles.datePicker__dialog} role="dialog" aria-label="Calendar">
            <div className={styles.datePicker__dialogHeader}>
              <button
                type="button"
                className={styles.datePicker__nav}
                aria-label="Previous month"
                onClick={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={styles.datePicker__nav}
                aria-label="Next month"
                onClick={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div
              className={cn(
                styles.datePicker__months,
                type === 'Date Range' && styles['datePicker__months--range'],
              )}
            >
              <MonthPanel
                monthDate={visibleMonth}
                selectedDate={selectedDate}
                rangeStart={rangeDraftStart ?? rangeStart}
                rangeEnd={rangeEnd}
                onSelect={handleSelect}
              />
              {type === 'Date Range' ? (
                <MonthPanel
                  monthDate={nextMonth}
                  selectedDate={selectedDate}
                  rangeStart={rangeDraftStart ?? rangeStart}
                  rangeEnd={rangeEnd}
                  onSelect={handleSelect}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
