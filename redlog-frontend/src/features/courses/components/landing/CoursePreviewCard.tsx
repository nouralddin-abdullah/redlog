import {
  Play,
  Video,
  ListChecks,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlarmClock,
  Hourglass,
  PlayCircle,
} from 'lucide-react';
import type {
  Course,
  CourseAccess,
  CourseModule,
} from '@/features/courses/types';
import type { CourseProgress } from '@/features/lesson-progress/types';
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
  curriculumLoading: boolean;
  access: CourseAccess | undefined;
  /** True while access query is loading. */
  accessLoading: boolean;
  /**
   * Per-course progress for enrolled viewers — drives the progress bar +
   * "Continue learning" copy. Undefined for non-enrolled visitors.
   */
  progress?: CourseProgress;
  /** Bunny thumbnail of the first preview video — preferred over course.thumbnail. */
  previewThumbnailUrl?: string | null;
  /** Called when the user clicks "subscribe" (NONE) or "retry" (REJECTED). */
  onEnroll: () => void;
  /** Called when an enrolled user clicks "start learning". */
  onStartLearning?: () => void;
  /** Called when a PENDING user clicks the status button — show request details. */
  onShowRequestDetails?: () => void;
  /** Called when the user clicks the "free preview" button. */
  onPreview?: () => void;
}

export function CoursePreviewCard({
  course,
  modules,
  curriculumLoading,
  access,
  accessLoading,
  progress,
  previewThumbnailUrl,
  onEnroll,
  onStartLearning,
  onShowRequestDetails,
  onPreview,
}: CoursePreviewCardProps) {
  const isEnrolled = access?.state === 'ENROLLED';
  const showProgressBar = isEnrolled && progress && progress.totalLessons > 0;
  // Once a user has started a course, the CTA copy shifts from "Start learning"
  // to "Continue learning" (Udemy convention). We treat any completed lesson
  // OR a stored currentLessonId as "started".
  const hasStarted = Boolean(
    progress && (progress.completedCount > 0 || progress.currentLessonId),
  );
  const allLessons = (modules ?? []).flatMap((m) => m.lessons);
  const videoLessons = allLessons.filter((l) => l.type === 'video');
  const quizLessons = allLessons.filter((l) => l.type === 'quiz');
  const previewLesson = allLessons.find((l) => l.isPreview);

  /** Use the curated course thumbnail; only fall back to the preview frame. */
  const heroThumbnail = course.thumbnail ?? previewThumbnailUrl;

  const featureItems = course.features.filter((f) => !f.includes('استرداد'));
  const refundLine = course.features.find((f) => f.includes('استرداد'));

  const discount = discountPercent(course.price, course.originalPrice);
  const cta = primaryCta({
    state: access?.state ?? 'NONE',
    hasStarted,
    onEnroll,
    onStartLearning,
    onShowRequestDetails,
  });

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
        {heroThumbnail && (
          <img
            src={heroThumbnail}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-[var(--color-brand-blue-700)] shadow-[0_8px_20px_rgba(0,0,0,.2)]">
          <Play className="size-7 fill-current" />
        </div>
        <div className="absolute bottom-3 end-3 rounded-[4px] bg-black/60 px-2.5 py-1 text-[12px] font-semibold text-white">
          معاينة مجانية
          {previewLesson ? ` · ${formatLessonDuration(previewLesson.durationSeconds)}` : ''}
        </div>
      </button>

      <div className="p-5">
        {!isEnrolled && (
          <>
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
              <span>ينتهي العرض خلال يومين</span>
            </div>
          </>
        )}

        {showProgressBar && progress && (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-[13px]">
              <span className="text-[var(--color-ink-700)]">
                تقدمك في الكورس
              </span>
              <span className="font-semibold text-[var(--color-ink-900)]">
                {progress.percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
              <div
                className="h-full rounded-full bg-[var(--color-success)] transition-[width] duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="mt-1.5 text-[12px] text-[var(--color-ink-500)]">
              {progress.completedCount} من {progress.totalLessons} درس مكتمل
              {progress.completedAt && ' · أتممت الكورس 🎉'}
            </div>
          </div>
        )}

        <Button
          block
          size="lg"
          onClick={cta.onClick}
          disabled={accessLoading || cta.disabled}
          variant={cta.variant}
          iconStart={cta.icon}
          className="mb-2"
        >
          {cta.label}
        </Button>
        <Button
          block
          size="lg"
          variant="outline"
          onClick={onPreview}
          iconStart={<Play className="size-4" />}
        >
          معاينة مجانية
        </Button>

        <div className="mt-5 mb-2.5 text-[13px] font-bold text-[var(--color-ink-800)]">
          هذا الكورس يشمل:
        </div>

        <ul className="flex flex-col gap-2 text-[13px] text-[var(--color-ink-700)]">
          {videoLessons.length > 0 && (
            <FeatureRow
              icon={<Video />}
              label={`${videoLessons.length} درس فيديو (${formatHours(course.durationMinutes)})`}
            />
          )}
          {quizLessons.length > 0 && (
            <FeatureRow icon={<ListChecks />} label={`${quizLessons.length} اختبار تفاعلي`} />
          )}
          {curriculumLoading && allLessons.length === 0 && (
            <li className="text-[var(--color-ink-400)]">جاري تحميل المحتوى…</li>
          )}

          {featureItems.map((f) => (
            <FeatureRow key={f} icon={iconForFeature(f)} label={f} />
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

/* =================== primary CTA per access state =================== */

interface CtaArgs {
  state: CourseAccess['state'];
  /** True once the user has opened or completed at least one lesson. */
  hasStarted: boolean;
  onEnroll: () => void;
  onStartLearning?: () => void;
  onShowRequestDetails?: () => void;
}

interface CtaConfig {
  label: string;
  variant: 'primary' | 'soft' | 'outline' | 'ghost' | 'amber';
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function primaryCta({
  state,
  hasStarted,
  onEnroll,
  onStartLearning,
  onShowRequestDetails,
}: CtaArgs): CtaConfig {
  switch (state) {
    case 'PENDING':
      return {
        label: 'طلبك قيد المراجعة',
        variant: 'soft',
        icon: <Hourglass className="size-4" />,
        onClick: () => onShowRequestDetails?.(),
      };
    case 'REJECTED':
      return {
        label: 'إعادة إرسال طلب الدفع',
        variant: 'primary',
        onClick: onEnroll,
      };
    case 'ENROLLED':
      return {
        label: hasStarted ? 'متابعة التعلم' : 'ابدأ التعلم',
        variant: 'primary',
        icon: <PlayCircle className="size-4" />,
        onClick: () => onStartLearning?.(),
      };
    case 'NONE':
    default:
      return {
        label: 'اشترك في الكورس',
        variant: 'primary',
        onClick: onEnroll,
      };
  }
}

/* =================== misc =================== */

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
