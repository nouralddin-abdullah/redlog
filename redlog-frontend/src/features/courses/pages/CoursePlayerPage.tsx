import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { ChevronRight, Lock } from 'lucide-react';
import {
  useCourse,
  useCourseAccess,
  useCurriculum,
} from '@/features/courses/hooks';
import { useLesson, useLessonPlayback } from '@/features/lessons/hooks';
import { useCurrentUser } from '@/features/auth/hooks';
import {
  BunnyPlayer,
  type BunnyPlayerHandle,
} from '@/features/courses/components/player/BunnyPlayer';
import { QuizStage } from '@/features/quiz/components/QuizStage';
import { ViewportPlaceholder } from '@/features/courses/components/player/ViewportPlaceholder';
import { PlayerSidebar } from '@/features/courses/components/player/PlayerSidebar';
import { PlayerTabs } from '@/features/courses/components/player/PlayerTabs';
import { formatLessonDuration } from '@/features/courses/utils';
import { Logo } from '@/shared/components/branding/Logo';
import { Button } from '@/shared/components/ui/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import type { Lesson } from '@/features/courses/types';

export function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lesson');

  const courseQuery = useCourse(slug);
  const curriculumQuery = useCurriculum(slug);
  const accessQuery = useCourseAccess(slug);
  const { data: currentUser } = useCurrentUser();

  /** Bunny player handle — used to seek when the user clicks a note's timestamp. */
  const playerRef = useRef<BunnyPlayerHandle>(null);

  /** Current playback time, in whole seconds. The Bunny iframe emits ~4Hz
   *  via player.js postMessage; we floor + dedupe so we re-render at most
   *  once per second while playing. */
  const [currentTime, setCurrentTime] = useState(0);
  const handleTimeUpdate = useCallback((seconds: number) => {
    setCurrentTime((prev) => {
      const next = Math.floor(seconds);
      return next === prev ? prev : next;
    });
  }, []);
  const handleSeek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds);
  }, []);

  const allLessons = useMemo(
    () => (curriculumQuery.data ?? []).flatMap((m) => m.lessons),
    [curriculumQuery.data],
  );

  const currentLesson: Lesson | null = useMemo(() => {
    if (!allLessons.length) return null;
    if (lessonIdParam) {
      const found = allLessons.find((l) => l.id === lessonIdParam);
      if (found) return found;
    }
    return allLessons[0] ?? null;
  }, [allLessons, lessonIdParam]);

  const currentModule = useMemo(() => {
    if (!currentLesson || !curriculumQuery.data) return null;
    return (
      curriculumQuery.data.find((m) =>
        m.lessons.some((l) => l.id === currentLesson.id),
      ) ?? null
    );
  }, [currentLesson, curriculumQuery.data]);

  // Per-lesson detail (transcript, attachments, …) and a signed Bunny embed
  // URL for video lessons. Both queries auto-refire on lesson change because
  // the lesson id is part of the key.
  const lessonDetailQuery = useLesson(currentLesson?.id);
  const playbackQuery = useLessonPlayback({
    id: currentLesson?.id,
    enabled: currentLesson?.type === 'video',
  });

  // Reset the cached playhead whenever the user switches lessons.
  useEffect(() => {
    setCurrentTime(0);
  }, [currentLesson?.id]);

  /** True while the student is taking or reviewing a quiz — hides the
   *  surrounding lesson info / mini topbar so the quiz fills the screen. */
  const [quizActive, setQuizActive] = useState(false);
  // When the user navigates to a different lesson, clear the active flag
  // so the chrome reappears (the new lesson might not even be a quiz).
  useEffect(() => {
    setQuizActive(false);
  }, [currentLesson?.id]);

  // ---------------------------------------------------------------
  //  All hooks above this line. Conditional early returns from here on.
  // ---------------------------------------------------------------

  const initialLoad = courseQuery.isLoading || accessQuery.isLoading;

  if (initialLoad) {
    return <LoadingScreen />;
  }

  if (courseQuery.error || !courseQuery.data) {
    return (
      <BlockingScreen
        title="تعذّر تحميل الكورس"
        message={
          courseQuery.error instanceof HttpError
            ? courseQuery.error.message
            : 'حاول التحديث، أو ارجع لاحقاً.'
        }
        ctaHref={`/courses/${slug ?? ''}`}
        ctaLabel="العودة لصفحة الكورس"
      />
    );
  }

  const course = courseQuery.data;

  if (accessQuery.data?.state !== 'ENROLLED') {
    return (
      <BlockingScreen
        icon={<Lock className="size-7" />}
        title="هذا الكورس مغلق"
        message="يجب الاشتراك في الكورس قبل عرض المحتوى."
        ctaHref={`/courses/${course.slug}`}
        ctaLabel="عرض تفاصيل الكورس"
      />
    );
  }

  const selectLesson = (lesson: Lesson) => {
    setSearchParams({ lesson: lesson.id }, { replace: false });
  };

  const watermarkText = currentUser
    ? `${currentUser.name} · ${currentUser.email}`
    : 'Radlog';

  const videoEmbedUrl = playbackQuery.data?.embedUrl ?? null;

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-soft)]">
      <main className="flex min-w-0 flex-1 flex-col">
        {!quizActive && (
          <MiniTopbar
            slug={course.slug}
            categoryName={course.category.name}
            courseTitle={course.title}
            onBack={() => navigate(`/courses/${course.slug}`)}
          />
        )}

        {/* ===== Viewport (lesson-type dependent) =====
            Video and the empty-state are 16:9 letterboxed in <Viewport>; quiz
            renders standalone so it isn't boxed by black bars. */}
        {!currentLesson ? (
          <Viewport>
            <ViewportPlaceholder title="اختر درساً للبدء" />
          </Viewport>
        ) : currentLesson.type === 'video' ? (
          <Viewport>
            <BunnyPlayer
              ref={playerRef}
              embedUrl={videoEmbedUrl}
              loading={playbackQuery.isLoading}
              posterUrl={lessonDetailQuery.data?.thumbnailUrl ?? undefined}
              title={currentLesson.title}
              watermarkText={watermarkText}
              onTimeUpdate={handleTimeUpdate}
            />
          </Viewport>
        ) : (
          <QuizStage
            title={currentLesson.title}
            lessonId={currentLesson.id}
            onActiveChange={setQuizActive}
          />
        )}

        {!quizActive && (
          <LessonInfo
            lesson={currentLesson}
            moduleTitle={currentModule?.title}
            instructor={course.instructor.name}
          />
        )}

        {/* ===== Below-info content per lesson type ===== */}
        {!quizActive && currentLesson?.type === 'video' && (
          <PlayerTabs
            lessonId={currentLesson.id}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        )}
      </main>

      {!quizActive && curriculumQuery.data && curriculumQuery.data.length > 0 && (
        <PlayerSidebar
          modules={curriculumQuery.data}
          currentLessonId={currentLesson?.id ?? null}
          onSelectLesson={selectLesson}
        />
      )}
    </div>
  );
}

/* ============== viewport (16:9, capped, centered) ============== */

function Viewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center bg-black">
      {/* aspect-video keeps 16:9; max-h caps height so the player never dominates;
          max-w mirrors the height cap so the two limits fire together and
          aspect ratio is preserved (no stretched letterbox). */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '16 / 9',
          maxHeight: '75vh',
          maxWidth: 'calc(75vh * 16 / 9)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============== mini topbar ============== */

function MiniTopbar({
  slug,
  categoryName,
  courseTitle,
  onBack,
}: {
  slug: string;
  categoryName: string;
  courseTitle: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-line)] bg-white px-6 py-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        iconStart={<ChevronRight className="size-4" />}
      >
        العودة
      </Button>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-[var(--color-ink-500)]">{categoryName}</div>
        <Link
          to={`/courses/${slug}`}
          className="block truncate text-[14.5px] font-semibold text-[var(--color-ink-900)] hover:text-[var(--color-brand-blue)]"
        >
          {courseTitle}
        </Link>
      </div>
    </div>
  );
}

/* ============== lesson info ============== */

function LessonInfo({
  lesson,
  moduleTitle,
  instructor,
}: {
  lesson: Lesson | null;
  moduleTitle?: string;
  instructor: string;
}) {
  if (!lesson) {
    return (
      <div className="border-b border-[var(--color-line)] bg-white px-6 py-5 text-[14px] text-[var(--color-ink-500)]">
        اختر درساً من القائمة لبدء التعلم.
      </div>
    );
  }
  return (
    <div className="border-b border-[var(--color-line)] bg-white px-6 py-5">
      <h2 className="m-0 mb-1.5 text-[20px] font-bold text-[var(--color-ink-900)]">
        {lesson.title}
      </h2>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink-500)]">
        {moduleTitle && <span>{moduleTitle}</span>}
        {moduleTitle && <span aria-hidden>•</span>}
        <span>{instructor}</span>
        {lesson.durationSeconds > 0 && lesson.type === 'video' && (
          <>
            <span aria-hidden>•</span>
            <span>{formatLessonDuration(lesson.durationSeconds)} دقيقة</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ============== loading + blocking screens ============== */

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-soft)]">
      <div className="flex flex-col items-center gap-3 text-[var(--color-ink-500)]">
        <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-brand-blue)]" />
        <span className="text-[13.5px]">جاري التحميل…</span>
      </div>
    </div>
  );
}

function BlockingScreen({
  icon,
  title,
  message,
  ctaHref,
  ctaLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-soft)]">
      <header className="border-b border-[var(--color-line)] bg-white px-8 py-5">
        <Logo size={28} />
      </header>
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center px-6 text-center">
        {icon && (
          <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
            {icon}
          </div>
        )}
        <h1 className="text-[24px] font-bold text-[var(--color-ink-900)]">{title}</h1>
        <Alert tone="info" className="my-5 w-full text-start">
          {message}
        </Alert>
        <Link
          to={ctaHref}
          className="btn-base h-11 rounded-[10px] bg-[var(--color-brand-navy)] px-5 text-sm text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-12px_rgba(14,42,71,0.65)] hover:bg-[var(--color-brand-navy-700)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

/* Notes / Q&A / Files (list) / Transcript tabs each still need their own
 * dedicated endpoints — wired as those land. */
