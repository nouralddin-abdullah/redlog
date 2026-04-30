import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { useAttempt, useQuiz } from '../hooks';
import { isAttemptResult } from '../types';
import { QuizLauncher } from './QuizLauncher';
import { QuizRunner } from './QuizRunner';
import { QuizReview } from './QuizReview';

interface QuizStageProps {
  /** Lesson title — passed through to launcher / runner / review for headings. */
  title: string;
  lessonId: string;
  /**
   * Notifies the player page when the quiz transitions in/out of "active"
   * mode (taking or reviewing). Active mode hides the surrounding lesson
   * chrome so the quiz can use the full main column.
   */
  onActiveChange?: (active: boolean) => void;
}

/**
 * Top-level orchestrator for a quiz lesson. State machine:
 *
 *   no activeAttemptId          → <QuizLauncher>
 *   activeAttemptId, in-progress → <QuizRunner>
 *   activeAttemptId, submitted   → <QuizReview>
 *
 * Active states emit `onActiveChange(true)` so the player can hide its
 * other chrome (lesson info, tabs) while the student is taking or
 * reviewing the quiz.
 */
export function QuizStage({ title, lessonId, onActiveChange }: QuizStageProps) {
  const quiz = useQuiz(lessonId);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const attempt = useAttempt(activeAttemptId);

  // Re-run on every render — cheap, and avoids missing edge cases vs.
  // sprinkling the callback in setActiveAttemptId sites.
  useEffect(() => {
    onActiveChange?.(activeAttemptId !== null);
  }, [activeAttemptId, onActiveChange]);

  // Reset the active state when the lesson changes (user navigates the
  // sidebar) so we don't carry an attempt id across lessons.
  useEffect(() => {
    setActiveAttemptId(null);
  }, [lessonId]);

  if (quiz.isLoading) return <StageSkeleton />;

  if (quiz.error || !quiz.data) {
    return (
      <StageWrap>
        <Alert tone="warning">
          <AlertTriangle className="me-2 inline size-4" />
          تعذّر تحميل الاختبار
          {quiz.error instanceof HttpError ? ` — ${quiz.error.message}` : ''}
        </Alert>
      </StageWrap>
    );
  }

  // No active attempt → launchpad.
  if (!activeAttemptId) {
    return (
      <QuizLauncher
        title={title}
        quiz={quiz.data}
        onAttemptStarted={setActiveAttemptId}
        onReviewLast={setActiveAttemptId}
      />
    );
  }

  if (attempt.isLoading) return <StageSkeleton />;

  if (attempt.error || !attempt.data) {
    return (
      <StageWrap>
        <Alert tone="warning">
          <AlertTriangle className="me-2 inline size-4" />
          تعذّر تحميل المحاولة
          {attempt.error instanceof HttpError ? ` — ${attempt.error.message}` : ''}
        </Alert>
      </StageWrap>
    );
  }

  // Submitted (or auto-finalized) → review.
  if (isAttemptResult(attempt.data)) {
    return (
      <QuizReview
        title={title}
        quiz={quiz.data}
        result={attempt.data}
        onBack={() => setActiveAttemptId(null)}
      />
    );
  }

  // In-progress → runner.
  return (
    <QuizRunner
      title={title}
      quiz={quiz.data}
      attempt={attempt.data}
      onExit={() => setActiveAttemptId(null)}
    />
  );
}

/* ============================== presentation helpers ============================ */

function StageWrap({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center bg-[var(--color-surface-soft)] px-6 py-12"
      style={{ minHeight: '480px' }}
    >
      {children}
    </div>
  );
}

function StageSkeleton() {
  return (
    <div
      className="flex items-center justify-center bg-[var(--color-surface-soft)]"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-brand-blue)]" />
    </div>
  );
}
