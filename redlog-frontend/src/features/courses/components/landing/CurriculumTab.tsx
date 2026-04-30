import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  Play,
  ListChecks,
  Lock,
} from 'lucide-react';
import type { Course, CourseModule, Lesson } from '@/features/courses/types';
import {
  formatHours,
  formatLessonDuration,
  formatModuleDuration,
} from '@/features/courses/utils';

interface CurriculumTabProps {
  course: Course;
  modules: CourseModule[] | undefined;
  loading: boolean;
}

export function CurriculumTab({ course, modules, loading }: CurriculumTabProps) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(
    modules?.[0]?.id ?? null,
  );

  const totalLessons = (modules ?? []).reduce(
    (sum, m) => sum + m.lessons.length,
    0,
  );

  if (loading && !modules) {
    return <SkeletonModules />;
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white py-12 text-center text-[var(--color-ink-500)]">
        لا توجد وحدات منشورة بعد.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="m-0 text-[22px] font-bold">محتوى الكورس</h2>
        <span className="text-[14px] text-[var(--color-ink-500)]">
          {modules.length} وحدات · {totalLessons} درس · {formatHours(course.durationMinutes)}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {modules.map((mod) => {
          const open = mod.id === openModuleId;
          return (
            <div
              key={mod.id}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenModuleId(open ? null : mod.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-start transition-colors"
                style={{ background: open ? 'var(--color-surface-soft)' : 'transparent' }}
              >
                {open ? (
                  <ChevronDown className="size-[18px] text-[var(--color-ink-400)]" aria-hidden />
                ) : (
                  <ChevronLeft className="size-[18px] text-[var(--color-ink-400)]" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-[var(--color-ink-900)]">
                    {mod.title}
                  </div>
                </div>
                <div className="text-[13px] text-[var(--color-ink-500)]">
                  {mod.lessons.length} دروس · {formatModuleDuration(mod.durationMinutes)}
                </div>
              </button>

              {open && (
                <div className="border-t border-[var(--color-line)]">
                  {mod.lessons.map((lesson, i) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      isLast={i === mod.lessons.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonRow({ lesson, isLast }: { lesson: Lesson; isLast: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3 text-[14px]"
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--color-line)',
      }}
    >
      <LessonIcon type={lesson.type} />
      <div className="flex-1 truncate text-[var(--color-ink-800)]">{lesson.title}</div>
      {lesson.isPreview ? (
        <button className="text-[13px] font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]">
          معاينة
        </button>
      ) : (
        <Lock className="size-3.5 text-[var(--color-ink-400)]" aria-hidden />
      )}
      <div
        className="min-w-[70px] text-end text-[13px] text-[var(--color-ink-500)]"
      >
        {formatLessonMeta(lesson)}
      </div>
    </div>
  );
}

function LessonIcon({ type }: { type: Lesson['type'] }) {
  const className = 'size-4 text-[var(--color-ink-500)]';
  switch (type) {
    case 'video':
      return <Play className={className} aria-hidden />;
    case 'quiz':
      return <ListChecks className={className} aria-hidden />;
  }
}

function formatLessonMeta(lesson: Lesson): string {
  if (lesson.durationSeconds <= 0) return '';
  return formatLessonDuration(lesson.durationSeconds);
}

function SkeletonModules() {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[60px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
        />
      ))}
    </div>
  );
}
