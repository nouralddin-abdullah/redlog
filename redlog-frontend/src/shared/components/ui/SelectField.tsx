import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  iconStart?: ReactNode;
  optional?: boolean;
  /** Use this when you want the select to render an `<option disabled value="">placeholder…</option>` automatically */
  placeholder?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, iconStart, optional, placeholder, options, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-[var(--color-ink-700)]"
        >
          {label}
          {optional && (
            <span className="mr-1.5 text-[11px] font-medium text-[var(--color-ink-400)]">
              (اختياري)
            </span>
          )}
        </label>
        {hint && !error && (
          <span className="text-[11px] text-[var(--color-ink-400)]">{hint}</span>
        )}
      </div>

      <div className="relative">
        {iconStart && (
          <span
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)] [&>svg]:size-[18px]"
            aria-hidden
          >
            {iconStart}
          </span>
        )}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'input-base appearance-none bg-no-repeat',
            iconStart && 'ps-11',
            'pe-11',
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 size-[18px] text-[var(--color-ink-400)]"
          aria-hidden
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-1.5 text-[12.5px] font-medium text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
});
