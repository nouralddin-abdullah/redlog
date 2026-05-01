import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

interface Props {
  label: string;
  value: string;
  /** Optional sub-label rendered beneath the value (e.g. "هذا الشهر"). */
  hint?: string;
  /** Icon rendered in the top-end corner — picks up the tile's accent color. */
  icon: LucideIcon;
  /** Trend indicator. Positive renders green, negative red. */
  trendPercent?: number;
  /** Tile accent — keys into a small palette. */
  tone?: 'navy' | 'blue' | 'amber' | 'success' | 'warning';
}

/**
 * Dashboard stat tile. Generous padding, large display number, optional trend
 * indicator. Tones are subtle (icon background only) so a row of four tiles
 * still reads as a unified block rather than a rainbow.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  trendPercent,
  tone = 'navy',
}: Props) {
  const accent = ACCENT[tone];
  const trend = trendPercent;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink-500)]">
          {label}
        </div>
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
            accent.bg,
            accent.fg,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      </div>

      <div className="text-[26px] font-bold tabular-nums leading-none text-[var(--color-ink-900)]">
        {value}
      </div>

      <div className="flex items-center gap-2 text-[12.5px]">
        {trend !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
              trend >= 0
                ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
        {hint && (
          <span className="text-[var(--color-ink-500)]">{hint}</span>
        )}
      </div>
    </div>
  );
}

const ACCENT: Record<
  NonNullable<Props['tone']>,
  { bg: string; fg: string }
> = {
  navy: {
    bg: 'bg-[var(--color-brand-blue-100)]',
    fg: 'text-[var(--color-brand-navy)]',
  },
  blue: {
    bg: 'bg-[var(--color-brand-blue-100)]',
    fg: 'text-[var(--color-brand-blue-700)]',
  },
  amber: {
    bg: 'bg-[var(--color-accent-amber-soft)]',
    fg: 'text-[var(--color-accent-amber-700)]',
  },
  success: {
    bg: 'bg-[var(--color-success-soft)]',
    fg: 'text-[var(--color-success)]',
  },
  warning: {
    bg: 'bg-[var(--color-warning-soft)]',
    fg: 'text-[var(--color-warning)]',
  },
};
