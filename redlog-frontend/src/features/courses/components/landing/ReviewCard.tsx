import { Pencil, Trash2 } from 'lucide-react';
import type { Review } from '@/features/courses/types';
import { Avatar } from '@/shared/components/ui/Avatar';
import { formatRelativeTime } from '@/shared/lib/relative-time';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
  /** When true, render a "Your review" badge + edit/delete actions. */
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

export function ReviewCard({ review, isOwn, onEdit, onDelete, deleting }: ReviewCardProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5">
      <div className="mb-2.5 flex items-start gap-3">
        <Avatar name={review.user.name} src={review.user.avatar} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-bold text-[var(--color-ink-900)]">
              {review.user.name}
            </span>
            {isOwn && (
              <span className="rounded-full bg-[var(--color-brand-blue-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-brand-blue-700)]">
                تقييمك
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-[var(--color-ink-500)]">
            <StarRating value={review.rating} size={12} />
            <span>· {formatRelativeTime(review.createdAt)}</span>
          </div>
        </div>

        {isOwn && (
          <div className="flex items-center gap-0.5">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md p-1.5 text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
                aria-label="تعديل التقييم"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="rounded-md p-1.5 text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] disabled:opacity-50"
                aria-label="حذف التقييم"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {review.comment && (
        <p className="m-0 text-[14px] leading-[1.7] text-[var(--color-ink-700)]">
          {review.comment}
        </p>
      )}
    </div>
  );
}
