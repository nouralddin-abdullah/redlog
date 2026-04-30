import { useState } from 'react';
import { StarRatingInput } from './StarRating';
import { Button } from '@/shared/components/ui/Button';
import { Alert } from '@/shared/components/ui/Alert';
import type { CreateReviewInput, StarRating } from '@/features/courses/types';
import { cn } from '@/shared/lib/cn';

interface ReviewFormProps {
  /** Submitted defaults — when present we treat the form as "edit mode". */
  defaultValue?: { rating: StarRating; comment: string | null };
  submitting?: boolean;
  errorMessage?: string | null;
  onCancel?: () => void;
  onSubmit: (input: CreateReviewInput) => void;
  className?: string;
}

const COMMENT_MAX = 1000;

export function ReviewForm({
  defaultValue,
  submitting,
  errorMessage,
  onCancel,
  onSubmit,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(defaultValue?.rating ?? 0);
  const [comment, setComment] = useState<string>(defaultValue?.comment ?? '');
  const [touched, setTouched] = useState(false);

  const isEdit = Boolean(defaultValue);
  const ratingError = touched && (rating < 1 || rating > 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (rating < 1 || rating > 5) return;
    onSubmit({
      rating: rating as StarRating,
      comment: comment.trim() ? comment.trim() : null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5',
        className,
      )}
    >
      <div className="mb-1 text-[15px] font-bold text-[var(--color-ink-900)]">
        {isEdit ? 'عدّل تقييمك' : 'اكتب تقييمك'}
      </div>
      <div className="mb-3 text-[13px] text-[var(--color-ink-500)]">
        شاركنا رأيك في الكورس لمساعدة بقية الطلبة.
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[13px] font-semibold text-[var(--color-ink-700)]">
          تقييمك
        </div>
        <StarRatingInput value={rating} onChange={setRating} disabled={submitting} />
        {ratingError && (
          <p className="mt-1.5 text-[12.5px] font-medium text-[var(--color-danger)]">
            اختر عدد النجوم من ١ إلى ٥
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-700)]"
        >
          تعليقك
          <span className="mr-1.5 text-[11px] font-medium text-[var(--color-ink-400)]">
            (اختياري)
          </span>
        </label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={COMMENT_MAX}
          disabled={submitting}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تجربتك مع الكورس…"
          className="input-base resize-y leading-[1.7]"
        />
        <div className="mt-1 text-end text-[11.5px] text-[var(--color-ink-400)] tabular-nums">
          {comment.length} / {COMMENT_MAX}
        </div>
      </div>

      {errorMessage && (
        <Alert tone="danger" className="mb-3">
          {errorMessage}
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting}>
          {isEdit ? 'حفظ التعديل' : 'نشر التقييم'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            إلغاء
          </Button>
        )}
      </div>
    </form>
  );
}
