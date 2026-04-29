import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  iconStart?: ReactNode;
  /** End-of-input slot. Ignored when `type` is "password" — we render the toggle. */
  iconEnd?: ReactNode;
  optional?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, iconStart, iconEnd, optional, className, type = 'text', id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

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
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'input-base',
            iconStart && 'ps-11',
            (iconEnd || isPassword) && 'pe-11',
            className,
          )}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
            className="absolute end-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-ink-400)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-700)]"
          >
            {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        ) : iconEnd ? (
          <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)] [&>svg]:size-[18px]">
            {iconEnd}
          </span>
        ) : null}
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
