import type { ReviewSummary, StarRating } from '@/features/courses/types';
import { cn } from '@/shared/lib/cn';

interface RatingBreakdownProps {
  summary: ReviewSummary;
  selected: StarRating | null;
  onSelect: (rating: StarRating | null) => void;
}

const STARS: StarRating[] = [5, 4, 3, 2, 1];

export function RatingBreakdown({ summary, selected, onSelect }: RatingBreakdownProps) {
  const total = summary.total || 1;

  return (
    <div className="flex-1">
      {STARS.map((stars) => {
        const count = summary.breakdown[String(stars) as `${StarRating}`] ?? 0;
        const percent = Math.round((count / total) * 100);
        const active = selected === stars;
        return (
          <button
            key={stars}
            type="button"
            onClick={() => onSelect(active ? null : stars)}
            className={cn(
              'group mb-1.5 flex w-full items-center gap-2.5 rounded-md p-1 text-[13px] transition-colors',
              active
                ? 'bg-white text-[var(--color-ink-900)]'
                : 'hover:bg-white/60',
            )}
            aria-pressed={active}
          >
            <span className="min-w-[18px] font-medium">{stars}★</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
              <div
                className={cn(
                  'h-full transition-all',
                  active ? 'bg-[#D97706]' : 'bg-[#F59E0B]',
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="min-w-[40px] text-end text-[var(--color-ink-500)] tabular-nums">
              {percent}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
