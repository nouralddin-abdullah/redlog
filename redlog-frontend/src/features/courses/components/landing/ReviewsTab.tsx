import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import type { Course, CreateReviewInput, StarRating } from '@/features/courses/types';
import {
  useCourseAccess,
  useCreateReview,
  useDeleteReview,
  useMyReview,
  useReviewsInfinite,
  useReviewsSummary,
  useUpdateReview,
} from '@/features/courses/hooks';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { HttpError } from '@/shared/api/client';
import { formatRating, formatStudents } from '@/features/courses/utils';

import { RatingBreakdown } from './RatingBreakdown';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { StarRating as Stars } from './StarRating';

interface ReviewsTabProps {
  course: Course;
}

export function ReviewsTab({ course }: ReviewsTabProps) {
  const slug = course.slug;

  const summaryQuery = useReviewsSummary(slug);
  const accessQuery = useCourseAccess(slug);
  const myReviewQuery = useMyReview(slug);
  const [filter, setFilter] = useState<StarRating | null>(null);
  const reviewsQuery = useReviewsInfinite({
    slug,
    rating: filter ?? undefined,
  });

  const [editing, setEditing] = useState(false);

  const createMut = useCreateReview(slug);
  const updateMut = useUpdateReview(slug);
  const deleteMut = useDeleteReview(slug);

  const ownReview = myReviewQuery.data ?? null;

  const otherReviews = useMemo(() => {
    const all = reviewsQuery.data?.pages.flatMap((p) => p.items) ?? [];
    return ownReview ? all.filter((r) => r.id !== ownReview.id) : all;
  }, [reviewsQuery.data, ownReview]);

  const enrolled = accessQuery.data?.state === 'ENROLLED';

  const handleCreate = async (input: CreateReviewInput) => {
    try {
      await createMut.mutateAsync(input);
      toast.success('تم نشر تقييمك');
    } catch {
      /* surfaced via mutation.error */
    }
  };

  const handleEditSubmit = async (input: CreateReviewInput) => {
    if (!ownReview) return;
    try {
      await updateMut.mutateAsync({ id: ownReview.id, input });
      toast.success('تم حفظ التعديل');
      setEditing(false);
    } catch {
      /* surfaced */
    }
  };

  const handleDelete = async () => {
    if (!ownReview) return;
    if (!window.confirm('هل تريد حذف تقييمك؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }
    try {
      await deleteMut.mutateAsync(ownReview.id);
      toast.success('تم حذف التقييم');
    } catch (e) {
      toast.error(
        e instanceof HttpError ? e.message : 'تعذّر حذف التقييم',
      );
    }
  };

  return (
    <div>
      {/* ---------- Summary ---------- */}
      {summaryQuery.isLoading && <SummarySkeleton />}
      {summaryQuery.error && (
        <Alert tone="warning" className="mb-6">
          تعذّر تحميل ملخص التقييمات
          {summaryQuery.error instanceof HttpError
            ? ` — ${summaryQuery.error.message}`
            : ''}
        </Alert>
      )}
      {summaryQuery.data && (
        <Summary
          average={summaryQuery.data.average}
          total={summaryQuery.data.total}
          summary={summaryQuery.data}
          selected={filter}
          onSelect={setFilter}
        />
      )}

      {/* ---------- Active filter chip ---------- */}
      {filter !== null && (
        <div className="mb-4 flex items-center gap-2 text-[13px] text-[var(--color-ink-600)]">
          <span>
            عرض تقييمات <strong className="font-bold text-[var(--color-ink-900)]">{filter}★</strong> فقط
          </span>
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-[12px] font-semibold transition-colors hover:bg-[var(--color-line)]"
          >
            <X className="size-3" /> إزالة الفلتر
          </button>
        </div>
      )}

      {/* ---------- Write / your review ---------- */}
      {!myReviewQuery.isLoading &&
        (ownReview ? (
          editing ? (
            <ReviewForm
              defaultValue={{
                rating: ownReview.rating as StarRating,
                comment: ownReview.comment,
              }}
              submitting={updateMut.isPending}
              errorMessage={errorMessage(updateMut.error)}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditing(false)}
              className="mb-4"
            />
          ) : (
            <div className="mb-4">
              <ReviewCard
                review={ownReview}
                isOwn
                onEdit={() => setEditing(true)}
                onDelete={handleDelete}
                deleting={deleteMut.isPending}
              />
            </div>
          )
        ) : enrolled ? (
          <ReviewForm
            submitting={createMut.isPending}
            errorMessage={errorMessage(createMut.error)}
            onSubmit={handleCreate}
            className="mb-4"
          />
        ) : null)}

      {/* ---------- Reviews list ---------- */}
      {reviewsQuery.error ? (
        <Alert tone="danger">
          تعذّر تحميل التقييمات
          {reviewsQuery.error instanceof HttpError
            ? ` — ${reviewsQuery.error.message}`
            : ''}
        </Alert>
      ) : (
        <div className="flex flex-col gap-4">
          {reviewsQuery.isLoading && <ReviewsSkeleton />}

          {otherReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}

          {!reviewsQuery.isLoading &&
            otherReviews.length === 0 &&
            !ownReview && <EmptyState filter={filter} />}

          {reviewsQuery.hasNextPage && (
            <Button
              variant="ghost"
              className="self-start"
              loading={reviewsQuery.isFetchingNextPage}
              onClick={() => reviewsQuery.fetchNextPage()}
            >
              عرض المزيد من التقييمات
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* =================== sub-components =================== */

function Summary({
  average,
  total,
  summary,
  selected,
  onSelect,
}: {
  average: number;
  total: number;
  summary: import('@/features/courses/types').ReviewSummary;
  selected: StarRating | null;
  onSelect: (s: StarRating | null) => void;
}) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-8 rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] p-6 sm:grid-cols-[200px_1fr]">
      <div className="text-center">
        <div className="font-display text-[56px] font-extrabold leading-none text-[var(--color-ink-900)]">
          {formatRating(String(average))}
        </div>
        <div className="my-2 flex justify-center">
          <Stars value={Math.round(average)} size={18} />
        </div>
        <div className="text-[13px] text-[var(--color-ink-500)]">
          {formatStudents(total)} تقييم
        </div>
      </div>

      <RatingBreakdown summary={summary} selected={selected} onSelect={onSelect} />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="mb-6 h-[180px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)]" />
  );
}

function ReviewsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5"
        >
          <Loader2 className="size-5 animate-spin text-[var(--color-ink-400)]" />
          <span className="text-[13px] text-[var(--color-ink-500)]">جاري التحميل…</span>
        </div>
      ))}
    </>
  );
}

function EmptyState({ filter }: { filter: StarRating | null }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white py-12 text-center">
      <p className="m-0 text-[14px] text-[var(--color-ink-500)]">
        {filter !== null
          ? `لا توجد تقييمات بـ ${filter}★ حتى الآن.`
          : 'لا توجد تقييمات بعد — كن أول من يقيّم.'}
      </p>
    </div>
  );
}

function errorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof HttpError) return error.message;
  return 'حدث خطأ غير متوقع';
}
