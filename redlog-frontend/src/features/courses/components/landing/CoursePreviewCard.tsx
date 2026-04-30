import {
  Play,
  Video,
  FileText,
  ListChecks,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlarmClock,
  Hourglass,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import type {
  Course,
  CourseAccess,
  CourseModule,
} from '@/features/courses/types';
import {
  discountPercent,
  formatHours,
  formatLessonDuration,
  formatPrice,
} from '@/features/courses/utils';
import { formatRelativeTime } from '@/shared/lib/relative-time';
import { egyptianE164ToLocal } from '@/shared/lib/phone';
import { Button } from '@/shared/components/ui/Button';

interface CoursePreviewCardProps {
  course: Course;
  modules: CourseModule[] | undefined;
  curriculumLoading: boolean;
  access: CourseAccess | undefined;
  /** True while access query is loading. */
  accessLoading: boolean;
  /** Called when the user clicks "subscribe" or "retry payment". */
  onEnroll: () => void;
  /** Called when an enrolled user clicks "start learning". */
  onStartLearning?: () => void;
  /** Called when the user clicks the "free preview" button. */
  onPreview?: () => void;
}

export function CoursePreviewCard({
  course,
  modules,
  curriculumLoading,
  access,
  accessLoading,
  onEnroll,
  onStartLearning,
  onPreview,
}: CoursePreviewCardProps) {
  const allLessons = (modules ?? []).flatMap((m) => m.lessons);
  const videoLessons = allLessons.filter((l) => l.type === 'video');
  const fileLessons = allLessons.filter((l) => l.type === 'file');
  const quizLessons = allLessons.filter((l) => l.type === 'quiz');
  const previewLesson = allLessons.find((l) => l.isPreview);

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
        <div className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-[var(--color-brand-blue-700)] shadow-[0_8px_20px_rgba(0,0,0,.2)]">
          <Play className="size-7 fill-current" />
        </div>
        <div className="absolute bottom-3 end-3 rounded-[4px] bg-black/60 px-2.5 py-1 text-[12px] font-semibold text-white">
          معاينة مجانية
          {previewLesson ? ` · ${formatLessonDuration(previewLesson.durationSeconds)}` : ''}
        </div>
      </button>

      <div className="p-5">
        <CTASection
          course={course}
          access={access}
          accessLoading={accessLoading}
          onEnroll={onEnroll}
          onStartLearning={onStartLearning}
          onPreview={onPreview}
        />

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

/* =================== CTA section per access state =================== */

function CTASection({
  course,
  access,
  accessLoading,
  onEnroll,
  onStartLearning,
  onPreview,
}: {
  course: Course;
  access: CourseAccess | undefined;
  accessLoading: boolean;
  onEnroll: () => void;
  onStartLearning?: () => void;
  onPreview?: () => void;
}) {
  // Default to NONE while loading so we render the price block and the user
  // sees something useful immediately.
  const state = access?.state ?? 'NONE';

  if (state === 'ENROLLED') {
    return (
      <StatusBlock
        tone="success"
        icon={<GraduationCap />}
        title="أنت مشترك في الكورس"
        body="يمكنك متابعة جميع الدروس والاختبارات."
      >
        <Button block size="lg" onClick={onStartLearning}>
          ابدأ التعلم
        </Button>
      </StatusBlock>
    );
  }

  if (state === 'PENDING') {
    const req = access?.paymentRequest;
    return (
      <StatusBlock
        tone="warning"
        icon={<Hourglass />}
        title="طلبك قيد المراجعة"
        body="سنتواصل معك خلال 24 ساعة بعد التحقق من التحويل."
      >
        {req && (
          <ul className="mt-1 flex flex-col gap-1 text-[12.5px] text-[var(--color-ink-600)]">
            <li>
              <span className="text-[var(--color-ink-500)]">المبلغ:</span>{' '}
              <strong className="text-[var(--color-ink-900)]">
                {formatPrice(req.amount)}
              </strong>
            </li>
            <li>
              <span className="text-[var(--color-ink-500)]">من الرقم:</span>{' '}
              <strong dir="ltr" className="font-mono tabular-nums text-[var(--color-ink-900)]">
                {egyptianE164ToLocal(req.senderPhoneNumber)}
              </strong>
            </li>
            <li>
              <span className="text-[var(--color-ink-500)]">أرسل:</span>{' '}
              <strong className="text-[var(--color-ink-900)]">
                {formatRelativeTime(req.createdAt)}
              </strong>
            </li>
          </ul>
        )}
        <Button block variant="outline" onClick={onPreview} iconStart={<Play className="size-4" />}>
          معاينة مجانية
        </Button>
      </StatusBlock>
    );
  }

  if (state === 'REJECTED') {
    const req = access?.paymentRequest;
    return (
      <StatusBlock
        tone="danger"
        icon={<XCircle />}
        title="تم رفض طلبك السابق"
        body={req?.adminNote ?? 'يرجى التحقق من بيانات التحويل وإعادة الإرسال.'}
      >
        <Button block size="lg" onClick={onEnroll}>
          إرسال طلب جديد
        </Button>
        <Button block variant="outline" onClick={onPreview} iconStart={<Play className="size-4" />}>
          معاينة مجانية
        </Button>
      </StatusBlock>
    );
  }

  // NONE (default)
  const discount = discountPercent(course.price, course.originalPrice);
  return (
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

      <Button
        block
        size="lg"
        onClick={onEnroll}
        className="mb-2"
        disabled={accessLoading}
      >
        اشترك في الكورس
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
    </>
  );
}

/* =================== status block =================== */

const TONE: Record<
  'success' | 'warning' | 'danger',
  { wrapper: string; iconColor: string; titleColor: string }
> = {
  success: {
    wrapper:
      'border-[#BBE6C5] bg-[var(--color-success-soft)]',
    iconColor: 'text-[var(--color-success)]',
    titleColor: 'text-[var(--color-success)]',
  },
  warning: {
    wrapper: 'border-[#F6DDA9] bg-[var(--color-warning-soft)]',
    iconColor: 'text-[var(--color-warning)]',
    titleColor: 'text-[var(--color-warning)]',
  },
  danger: {
    wrapper: 'border-[#FBC8C8] bg-[var(--color-danger-soft)]',
    iconColor: 'text-[var(--color-danger)]',
    titleColor: 'text-[var(--color-danger)]',
  },
};

function StatusBlock({
  tone,
  icon,
  title,
  body,
  children,
}: {
  tone: 'success' | 'warning' | 'danger';
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className={`rounded-[var(--radius-md)] border p-3.5 ${t.wrapper}`}>
      <div className="mb-3 flex items-start gap-2.5">
        <span className={`mt-0.5 [&>svg]:size-5 ${t.iconColor}`} aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className={`text-[14px] font-bold ${t.titleColor}`}>{title}</div>
          <div className="mt-0.5 text-[12.5px] leading-[1.6] text-[var(--color-ink-700)]">
            {body}
          </div>
        </div>
      </div>
      {children && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  );
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
