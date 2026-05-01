import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, PlayCircle } from 'lucide-react';

import { useMyEnrollments } from '@/features/enrollments/hooks';
import type { Enrollment } from '@/features/enrollments/types';
import { useMyCertificates } from '@/features/certificates/hooks';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';

export function MyCoursesPage() {
  const enrollmentsQuery = useMyEnrollments();
  // Index certificates by courseId so each completed-course card can deep-link
  // to its certificate. The certs query stays warm via the existing
  // invalidation in `applyCompletionResult`.
  const certsQuery = useMyCertificates();
  const certIdByCourseId = new Map(
    (certsQuery.data ?? []).map((c) => [c.courseId, c.id]),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          كورساتي
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          الكورسات التي اشتركت بها مع تقدمك في كل منها.
        </p>
      </header>

      {enrollmentsQuery.isLoading && <SkeletonGrid />}

      {enrollmentsQuery.error && (
        <Alert tone="warning">
          تعذّر تحميل كورساتك
          {enrollmentsQuery.error instanceof HttpError
            ? ` — ${enrollmentsQuery.error.message}`
            : ''}
        </Alert>
      )}

      {enrollmentsQuery.data && enrollmentsQuery.data.length === 0 && (
        <EmptyState />
      )}

      {enrollmentsQuery.data && enrollmentsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {enrollmentsQuery.data.map((e) => (
            <EnrollmentCard
              key={e.id}
              enrollment={e}
              certificateId={certIdByCourseId.get(e.courseId) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EnrollmentCard({
  enrollment,
  certificateId,
}: {
  enrollment: Enrollment;
  certificateId: string | null;
}) {
  const { course, progress, currentLessonId, completedAt } = enrollment;
  const isComplete = completedAt !== null;
  const isEmpty = progress.totalLessons === 0;
  // Resume to the user's last opened lesson if known; otherwise drop them on
  // the player without a lesson param so it picks the first available one.
  const learnHref = currentLessonId
    ? `/courses/${course.slug}/learn?lesson=${currentLessonId}`
    : `/courses/${course.slug}/learn`;

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)]">
      <Link to={`/courses/${course.slug}`} className="block">
        <div
          className="relative flex h-[140px] items-center justify-center text-white"
          style={{
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
          {isComplete && (
            <span className="absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-bold text-[var(--color-success)]">
              <CheckCircle2 className="size-3.5" /> مكتمل
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-[18px]">
        <Link
          to={`/courses/${course.slug}`}
          className="m-0 mb-3 line-clamp-2 text-[16px] font-bold leading-[1.4] text-[var(--color-ink-900)] hover:text-[var(--color-brand-blue)]"
        >
          {course.title}
        </Link>

        {isEmpty ? (
          <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-3 py-2.5 text-[12.5px] text-[var(--color-ink-500)]">
            لم يتم نشر الدروس بعد — تابع لاحقاً.
          </div>
        ) : (
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
              <span className="text-[var(--color-ink-600)]">
                {progress.completedCount} من {progress.totalLessons} درس
              </span>
              <span className="font-semibold tabular-nums text-[var(--color-ink-900)]">
                {progress.percent}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
              <div
                className="h-full rounded-full bg-[var(--color-success)] transition-[width] duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <Link
            to={learnHref}
            className="btn-base inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[13.5px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-12px_rgba(14,42,71,0.65)] hover:bg-[var(--color-brand-navy-700)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
            aria-disabled={isEmpty}
            onClick={(ev) => {
              if (isEmpty) ev.preventDefault();
            }}
          >
            <PlayCircle className="size-4" />
            {isComplete
              ? 'مراجعة الكورس'
              : progress.completedCount > 0 || currentLessonId
                ? 'متابعة التعلم'
                : 'ابدأ التعلم'}
          </Link>
          {isComplete && certificateId && (
            <Link
              to={`/certificates/${certificateId}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-[var(--color-brand-navy)] hover:bg-[var(--color-surface-muted)]"
            >
              <Award className="size-4" />
              عرض الشهادة
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
        <BookOpen className="size-6" />
      </div>
      <h2 className="m-0 mb-1.5 text-[18px] font-bold text-[var(--color-ink-900)]">
        لم تشترك في أي كورس بعد
      </h2>
      <p className="mb-5 text-[14px] text-[var(--color-ink-500)]">
        استكشف الكورسات وابدأ رحلتك التعليمية.
      </p>
      <Link
        to="/courses"
        className="btn-base inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-brand-navy)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-brand-navy-700)]"
      >
        تصفح الكورسات
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[300px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
        />
      ))}
    </div>
  );
}
