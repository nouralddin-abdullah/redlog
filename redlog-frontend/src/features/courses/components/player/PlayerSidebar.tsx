import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  Lock,
  Play,
  ListChecks,
} from 'lucide-react';
import type { CourseModule, Lesson } from '@/features/courses/types';
import { formatModuleDuration, formatLessonDuration } from '@/features/courses/utils';
import { cn } from '@/shared/lib/cn';

interface PlayerSidebarProps {
  modules: CourseModule[];
  currentLessonId: string | null;
  /** Lesson IDs the user has finished. */
  completedLessonIds?: ReadonlySet<string>;
  /**
   * Optional progress block — when present, renders a percent + bar in the
   * header. Pass undefined for non-enrolled previews (no header bar).
   */
  progress?: {
    completedCount: number;
    totalLessons: number;
    percent: number;
  };
  /**
   * Certificate state for the row at the bottom of the sidebar.
   *  - undefined: don't render the row at all (non-enrolled preview).
   *  - `unlocked: false`: course incomplete, render greyed-out lock.
   *  - `unlocked: true`: course complete; `certificateId` may briefly be null
   *    if the cert list hasn't refetched yet — render a "preparing" state.
   */
  certificate?: {
    unlocked: boolean;
    certificateId: string | null;
  };
  onSelectLesson: (lesson: Lesson) => void;
}

export function PlayerSidebar({
  modules,
  currentLessonId,
  completedLessonIds,
  progress,
  certificate,
  onSelectLesson,
}: PlayerSidebarProps) {
  /** Open the module that contains the current lesson by default; allow user to expand others. */
  const initiallyOpen =
    modules.find((m) => m.lessons.some((l) => l.id === currentLessonId))?.id ??
    modules[0]?.id ??
    null;

  const [openModuleId, setOpenModuleId] = useState<string | null>(initiallyOpen);

  // Auto-expand the module of the current lesson if the user navigates to one
  // outside the currently-open module (e.g. via the URL).
  useEffect(() => {
    if (!currentLessonId) return;
    const containing = modules.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId),
    );
    if (containing && containing.id !== openModuleId) {
      setOpenModuleId(containing.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonId]);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <aside className="sticky top-0 hidden h-screen w-[360px] shrink-0 flex-col overflow-y-auto border-s border-[var(--color-line)] bg-white lg:flex">
      <div className="sticky top-0 z-10 border-b border-[var(--color-line)] bg-white px-5 py-4">
        <h3 className="m-0 mb-1 text-[16px] font-bold text-[var(--color-ink-900)]">
          محتوى الكورس
        </h3>
        <div className="text-[13px] text-[var(--color-ink-500)]">
          {modules.length} وحدات · {totalLessons} درس
        </div>
        {progress && progress.totalLessons > 0 && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-[12px] text-[var(--color-ink-500)]">
              <span>
                {progress.completedCount} من {progress.totalLessons} مكتمل
              </span>
              <span className="font-semibold text-[var(--color-ink-700)]">
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
      </div>

      <div className="flex-1">
        {modules.map((mod) => {
        const open = mod.id === openModuleId;
        return (
          <div key={mod.id} className="border-b border-[var(--color-line)]">
            <button
              type="button"
              onClick={() => setOpenModuleId(open ? null : mod.id)}
              className="flex w-full items-center gap-2.5 px-5 py-3.5 text-start"
              style={{ background: open ? 'var(--color-surface-soft)' : 'transparent' }}
            >
              {open ? (
                <ChevronDown className="size-4 shrink-0 text-[var(--color-ink-400)]" aria-hidden />
              ) : (
                <ChevronLeft className="size-4 shrink-0 text-[var(--color-ink-400)]" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                  {mod.title}
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
                  {mod.lessons.length} دروس · {formatModuleDuration(mod.durationMinutes)}
                </div>
              </div>
            </button>

            {open && (
              <ul className="m-0 list-none p-0">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <LessonRow
                      lesson={lesson}
                      active={currentLessonId === lesson.id}
                      completed={completedLessonIds?.has(lesson.id) ?? false}
                      onClick={() => onSelectLesson(lesson)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      </div>

      {certificate && <CertificateRow {...certificate} />}
    </aside>
  );
}

/**
 * Pinned at the bottom of the sidebar — always visible while the user is in
 * the course. Locked state communicates that finishing the course unlocks a
 * tangible reward; unlocked state deep-links into the certificate render.
 */
function CertificateRow({
  unlocked,
  certificateId,
}: {
  unlocked: boolean;
  certificateId: string | null;
}) {
  // Locked: course incomplete. Render as a static (non-clickable) row so the
  // user sees what they're working toward.
  if (!unlocked) {
    return (
      <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-soft)] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-muted)] text-[var(--color-ink-400)]">
            <Lock className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold text-[var(--color-ink-700)]">
                شهادة الإتمام
              </span>
              <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                مقفلة
              </span>
            </div>
            <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-ink-500)]">
              أتمم جميع الدروس للحصول على شهادة موثّقة.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked but cert id not yet known — happens for ~one render after the
  // course completes and before /me/certificates refetches. Show the unlocked
  // styling but don't make it a link until we have a target.
  if (!certificateId) {
    return (
      <div className="border-t-2 border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-blue)] text-white">
            <Award className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold text-[var(--color-brand-navy)]">
              شهادة الإتمام
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--color-ink-600)]">
              جارٍ إصدار شهادتك…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/certificates/${certificateId}`}
      className="group block border-t-2 border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] px-5 py-4 transition-colors hover:bg-[var(--color-brand-blue-100)]"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-blue)] text-white shadow-[0_2px_6px_rgba(59,111,168,0.4)]">
          <Award className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-[var(--color-brand-navy)]">
              شهادة الإتمام
            </span>
            <span className="rounded-full bg-[var(--color-success)] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-white">
              مفتوحة
            </span>
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-ink-700)] group-hover:text-[var(--color-brand-navy)]">
            عرض الشهادة الآن →
          </div>
        </div>
      </div>
    </Link>
  );
}

function LessonRow({
  lesson,
  active,
  completed,
  onClick,
}: {
  lesson: Lesson;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 border-e-[3px] px-5 py-2.5 text-start transition-colors',
        active
          ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)]'
          : 'border-transparent hover:bg-[var(--color-surface-soft)]',
      )}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md',
          completed
            ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
            : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]',
        )}
      >
        {completed ? <Check className="size-3.5" /> : <LessonIcon type={lesson.type} />}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'truncate text-[13px]',
            active
              ? 'font-semibold text-[var(--color-brand-blue-700)]'
              : 'font-medium text-[var(--color-ink-700)]',
          )}
        >
          {lesson.title}
        </div>
        <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-500)]">
          {meta(lesson)}
        </div>
      </div>
    </button>
  );
}

function LessonIcon({ type }: { type: Lesson['type'] }) {
  const cls = 'size-3.5';
  if (type === 'video') return <Play className={cls} aria-hidden />;
  return <ListChecks className={cls} aria-hidden />;
}

function meta(lesson: Lesson): string {
  if (lesson.durationSeconds <= 0) return '';
  return formatLessonDuration(lesson.durationSeconds);
}
