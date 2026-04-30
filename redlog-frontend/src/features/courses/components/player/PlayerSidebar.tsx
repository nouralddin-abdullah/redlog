import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Play,
  ListChecks,
} from 'lucide-react';
import type { CourseModule, Lesson } from '@/features/courses/types';
import { formatModuleDuration, formatLessonDuration } from '@/features/courses/utils';
import { cn } from '@/shared/lib/cn';

interface PlayerSidebarProps {
  modules: CourseModule[];
  currentLessonId: string | null;
  /** Lesson IDs the user has finished. (Plumbed for when a `/progress` endpoint lands.) */
  completedLessonIds?: ReadonlySet<string>;
  onSelectLesson: (lesson: Lesson) => void;
}

export function PlayerSidebar({
  modules,
  currentLessonId,
  completedLessonIds,
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
      </div>

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
    </aside>
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
