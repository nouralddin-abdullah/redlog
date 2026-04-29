import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Tone = 'danger' | 'warning' | 'success' | 'info';

const TONE: Record<Tone, { wrapper: string; icon: ReactNode }> = {
  danger: {
    wrapper:
      'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[#FBC8C8]',
    icon: <AlertCircle className="size-[18px] shrink-0" aria-hidden />,
  },
  warning: {
    wrapper:
      'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[#F6DDA9]',
    icon: <TriangleAlert className="size-[18px] shrink-0" aria-hidden />,
  },
  success: {
    wrapper:
      'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[#BBE6C5]',
    icon: <CheckCircle2 className="size-[18px] shrink-0" aria-hidden />,
  },
  info: {
    wrapper:
      'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)] border-[#C9DCEF]',
    icon: <Info className="size-[18px] shrink-0" aria-hidden />,
  },
};

export function Alert({
  tone = 'info',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium leading-relaxed',
        TONE[tone].wrapper,
        className,
      )}
    >
      {TONE[tone].icon}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
