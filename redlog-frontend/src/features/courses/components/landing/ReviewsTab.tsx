import { Star } from 'lucide-react';
import type { Course } from '@/features/courses/types';
import { formatRating, formatStudents } from '@/features/courses/utils';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';

/**
 * Placeholder reviews — these match the reference's hardcoded list. Once the
 * `/api/courses/:slug/reviews` endpoint exists, swap these for live data.
 */
const PLACEHOLDER_REVIEWS = [
  {
    user: 'سارة علي',
    rating: 5,
    time: 'منذ أسبوع',
    text: 'أفضل كورس درسته في الأشعة، الشرح واضح جداً والمحاضر بيوصل المعلومة ببساطة. الحالات العملية ممتازة وزودتني خبرة كبيرة.',
  },
  {
    user: 'محمد خالد',
    rating: 5,
    time: 'منذ أسبوعين',
    text: 'الكورس ده غير حياتي العملية. المحتوى منظم بشكل ممتاز، والاختبارات بعد كل وحدة بتثبت المعلومة. أنصح بيه أي طالب أشعة.',
  },
  {
    user: 'ليلى أحمد',
    rating: 4,
    time: 'منذ شهر',
    text: 'محتوى قوي جداً، بس كنت أتمنى يكون فيه شرح أكثر للأشعة المقطعية المتقدمة. عموماً أداء ممتاز ويستحق التجربة.',
  },
];

/** Placeholder rating distribution — needs an aggregate field on the course. */
const PLACEHOLDER_BREAKDOWN: ReadonlyArray<{ stars: number; percent: number }> = [
  { stars: 5, percent: 78 },
  { stars: 4, percent: 18 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 0 },
];

interface ReviewsTabProps {
  course: Course;
}

export function ReviewsTab({ course }: ReviewsTabProps) {
  return (
    <div>
      {/* Summary */}
      <div
        className="mb-8 grid grid-cols-1 gap-8 rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] p-6 sm:grid-cols-[200px_1fr]"
      >
        <div className="text-center">
          <div className="font-display text-[56px] font-extrabold leading-none text-[var(--color-ink-900)]">
            {formatRating(course.rating)}
          </div>
          <div className="my-2 flex justify-center gap-0.5 text-[#F59E0B]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-[18px] fill-current" />
            ))}
          </div>
          <div className="text-[13px] text-[var(--color-ink-500)]">
            {formatStudents(course.reviewsCount)} تقييم
          </div>
        </div>

        <div className="flex-1">
          {PLACEHOLDER_BREAKDOWN.map((b) => (
            <div
              key={b.stars}
              className="mb-1.5 flex items-center gap-2.5 text-[13px]"
            >
              <span className="min-w-[18px]">{b.stars}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                <div
                  className="h-full"
                  style={{ width: `${b.percent}%`, background: '#F59E0B' }}
                />
              </div>
              <span className="min-w-[36px] text-[var(--color-ink-500)]">
                {b.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="flex flex-col gap-4">
        {PLACEHOLDER_REVIEWS.map((r, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5"
          >
            <div className="mb-2.5 flex items-center gap-3">
              <Avatar name={r.user} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold">{r.user}</div>
                <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-500)]">
                  <span className="flex text-[#F59E0B]">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="size-3 fill-current" />
                    ))}
                  </span>
                  <span>· {r.time}</span>
                </div>
              </div>
            </div>
            <p className="m-0 text-[14px] leading-[1.7] text-[var(--color-ink-700)]">
              {r.text}
            </p>
          </div>
        ))}

        <Button variant="ghost" className="self-start">
          عرض المزيد من التقييمات
        </Button>
      </div>
    </div>
  );
}
