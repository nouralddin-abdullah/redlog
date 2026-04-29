import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Variant = 'primary' | 'ghost' | 'soft' | 'outline' | 'amber';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  block?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-[var(--color-brand-navy)] text-white hover:bg-[var(--color-brand-navy-700)] active:bg-[var(--color-brand-navy-900)] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-12px_rgba(14,42,71,0.65)]',
  ghost:
    'bg-transparent text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]',
  soft:
    'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)] hover:bg-[#D6E4F2]',
  outline:
    'bg-[var(--color-surface)] text-[var(--color-ink-800)] border-[var(--color-line-strong)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-ink-400)]',
  amber:
    'bg-[var(--color-accent-amber)] text-[var(--color-brand-navy)] hover:bg-[var(--color-accent-amber-700)] hover:text-white',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-[8px]',
  md: 'h-11 px-5 text-sm rounded-[10px]',
  lg: 'h-[52px] px-6 text-[15px] rounded-[12px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    iconStart,
    iconEnd,
    block,
    className,
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'btn-base',
        VARIANT[variant],
        SIZE[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        iconStart
      )}
      <span>{children}</span>
      {!loading && iconEnd}
    </button>
  );
});
