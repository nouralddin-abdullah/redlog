import {
  Play,
  Video,
  FileText,
  ListChecks,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlarmClock,
} from 'lucide-react';
import type { Course, CourseModule } from '@/features/courses/types';
import {
  discountPercent,
  formatHours,
  formatLessonDuration,
  formatPrice,
} from '@/features/courses/utils';
import { Button } from '@/shared/components/ui/Button';

interface CoursePreviewCardProps {
  course: Course;
  modules: CourseModule[] | undefined;
  /** True when curriculum query is still loading; we show counts as "—". */
  curriculumLoading: boolean;
  onEnroll: () => void;
  onPreview?: () => void;
}

export function CoursePreviewCard({
  course,
  modules,
  curriculumLoading,
  onEnroll,
  onPreview,
}: CoursePreviewCardProps) {
  const allLessons = (modules ?? []).flatMap((m) => m.lessons);
  const videoLessons = allLessons.filter((l) => l.type === 'video');
  const fileLessons = allLessons.filter((l) => l.type === 'file');
  const quizLessons = allLessons.filter((l) => l.type === 'quiz');
  const previewLesson = allLessons.find((l) => l.isPreview);

  const discount = discountPercent(course.price, course.originalPrice);

  // Items derived from API features[]; we surface the refund line in the
  // dedicated footer beneath the list.
  const featureItems = course.features.filter((f) => !f.includes('استرداد'));
  const refundLine = course.features.find((f) => f.includes('استرداد'));

  return (
    <div className="card sticky top-5 overflow-hidden rounded-[var(--radius-lg)] bg-white text-[var(--color-ink-800)] shadow-[0_20px_50px_rgba(0,0,0,.25)]">
      {/* Preview thumbnail */}
      <button
        type="button"
        onClick={onPreview}
        className="relative flex w-full cursor-pointer items-center justify-center"
        style={{
          aspectRatio: '16/9',
          background:
            'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-navy) 100%)',
        }}
      >
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div
          className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-[var(--color-brand-blue-700)] shadow-[0_8px_20px_rgba(0,0,0,.2)]"
        >
          <Play className="size-7 fill-current" />
        </div>
        <div className="absolute bottom-3 end-3 rounded-[4px] bg-black/60 px-2.5 py-1 text-[12px] font-semibold text-white">
          معاينة مجانية
          {previewLesson ? ` · ${formatLessonDuration(previewLesson.durationSeconds)}` : ''}
        </div>
      </button>

      <div className="p-5">
        <div className="mb-1 flex items-baseline gap-2.5">
          <span className="text-[28px] font-extrabold text-[var(--color-ink-900)]">
            {formatPrice(course.price)}
          </span>
          {course.originalPrice && (
            <span className="text-[16px] text-[var(--color-ink-400)] line-through">
              {formatPrice(course.originalPrice)}
            </span>
          )}
          {discount !== null && (
            <span className="ms-auto rounded-full bg-[var(--color-success-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-success)]">
              خصم {discount}%
            </span>
          )}
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-danger)]">
          <AlarmClock className="size-3.5" aria-hidden />
          {/* Static placeholder — needs `offerEndsAt` on course payload */}
          <span>ينتهي العرض خلال يومين</span>
        </div>

        <Button block size="lg" onClick={onEnroll} className="mb-2">
          اشترك في الكورس
        </Button>
        <Button
          block
          size="lg"
          variant="outline"
          onClick={onPreview}
          iconStart={<Play className="size-4" />}
          className="mb-4"
        >
          معاينة مجانية
        </Button>

        <div className="mb-2.5 text-[13px] font-bold text-[var(--color-ink-800)]">
          هذا الكورس يشمل:
        </div>

        <ul className="flex flex-col gap-2 text-[13px] text-[var(--color-ink-700)]">
          {videoLessons.length > 0 && (
            <FeatureRow icon={<Video />} label={
              `${videoLessons.length} درس فيديو (${formatHours(course.durationMinutes)})`
            } />
          )}
          {fileLessons.length > 0 && (
            <FeatureRow icon={<FileText />} label={`${fileLessons.length} ملف PDF قابل للتنزيل`} />
          )}
          {quizLessons.length > 0 && (
            <FeatureRow icon={<ListChecks />} label={`${quizLessons.length} اختبار تفاعلي`} />
          )}
          {curriculumLoading && allLessons.length === 0 && (
            <li className="text-[var(--color-ink-400)]">جاري تحميل المحتوى…</li>
          )}

          {featureItems.map((f) => (
            <FeatureRow
              key={f}
              icon={iconForFeature(f)}
              label={f}
            />
          ))}
        </ul>

        {refundLine && (
          <div className="mt-4 border-t border-[var(--color-line)] pt-3.5 text-center text-[12px] text-[var(--color-ink-500)]">
            {refundLine}
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="text-[var(--color-brand-blue)] [&>svg]:size-4">{icon}</span>
      <span>{label}</span>
    </li>
  );
}

function iconForFeature(text: string): React.ReactNode {
  if (text.includes('شهادة')) return <CheckCircle2 />;
  if (text.includes('مجتمع')) return <MessageCircle />;
  if (text.includes('وصول') || text.includes('مدى الحياة')) return <Clock />;
  return <CheckCircle2 />;
}
