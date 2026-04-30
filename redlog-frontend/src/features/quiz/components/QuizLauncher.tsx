import { ListChecks, Play, RotateCcw, Eye, Trophy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/Button';
import { HttpError } from '@/shared/api/client';
import { cn } from '@/shared/lib/cn';
import { useStartAttempt } from '../hooks';
import type { QuizDefinition, LastAttemptSummary } from '../types';

interface QuizLauncherProps {
  /** Lesson title — used as the launcher heading. */
  title: string;
  quiz: QuizDefinition;
  /** Called once an attempt is created or resumed. */
  onAttemptStarted: (attemptId: string) => void;
  /** Called when the student wants to see a previous submitted/expired attempt's review. */
  onReviewLast: (attemptId: string) => void;
}

/**
 * Quiz launchpad — light, centered card matching the Radlog reference's
 * "intro" screen. Shows quiz vitals (count / minutes / pass threshold), the
 * user's last result, and the right CTA based on attempt state.
 */
export function QuizLauncher({
  title,
  quiz,
  onAttemptStarted,
  onReviewLast,
}: QuizLauncherProps) {
  const startAttempt = useStartAttempt(quiz.lessonId);
  const last = quiz.lastAttempt;
  const minutes = Math.round(quiz.durationSeconds / 60);
  const isResume = last?.status === 'in_progress';
  const isReviewable =
    last && (last.status === 'submitted' || last.status === 'expired');

  const noAttemptsLeft =
    !isResume &&
    quiz.maxAttempts !== null &&
    quiz.attemptsUsed >= quiz.maxAttempts;

  const ctaLabel = isResume
    ? 'استئناف الاختبار'
    : isReviewable
      ? 'إعادة المحاولة'
      : 'بدء الاختبار';
  const ctaIcon = isResume ? (
    <Play className="size-4 fill-current" />
  ) : isReviewable ? (
    <RotateCcw className="size-4" />
  ) : (
    <Play className="size-4 fill-current" />
  );

  const handleStart = () => {
    startAttempt.mutate(undefined, {
      onSuccess: (data) => onAttemptStarted(data.attemptId),
      onError: (err) =>
        toast.error(
          err instanceof HttpError ? err.message : 'تعذّر بدء الاختبار',
        ),
    });
  };

  return (
    <div
      className="flex items-center justify-center bg-[var(--color-surface-soft)] px-5 py-12"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <div className="card w-full max-w-[560px] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-10 text-center shadow-[0_4px_12px_rgba(15,27,45,.08)]">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]">
          <ListChecks className="size-8" />
        </div>

        <h1 className="m-0 mb-2 text-[24px] font-bold leading-snug text-[var(--color-ink-900)]">
          {title}
        </h1>
        <p className="m-0 mb-6 text-[14px] text-[var(--color-ink-600)]">
          اختبار قصير على محتوى الدرس
        </p>

        {/* Stats grid */}
        <div className="mb-4 grid grid-cols-3 gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-4">
          <Stat value={quiz.questionsCount} label="أسئلة" />
          <Stat
            value={minutes}
            label="دقيقة"
            hidden={quiz.durationSeconds <= 0}
          />
          <Stat value={`${quiz.passThresholdPercent}%`} label="للنجاح" />
        </div>

        {/* Attempts row */}
        <div className="mb-5 text-[12.5px] text-[var(--color-ink-500)]">
          {quiz.maxAttempts === null
            ? 'محاولات غير محدودة'
            : `${quiz.attemptsUsed} / ${quiz.maxAttempts} محاولات مستخدمة`}
        </div>

        {last && (
          <LastAttemptBanner
            last={last}
            passThreshold={quiz.passThresholdPercent}
          />
        )}

        {noAttemptsLeft && (
          <div className="mb-5 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] p-3 text-start text-[13px] text-[var(--color-warning)]">
            <AlertCircle className="size-4 shrink-0" />
            <span>لقد استنفدت جميع المحاولات المتاحة لهذا الاختبار.</span>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {isReviewable && last && (
            <Button
              variant="outline"
              block
              size="lg"
              onClick={() => onReviewLast(last.id)}
              iconStart={<Eye className="size-4" />}
            >
              مراجعة آخر محاولة
            </Button>
          )}
          <Button
            variant="primary"
            block
            size="lg"
            onClick={handleStart}
            loading={startAttempt.isPending}
            disabled={noAttemptsLeft}
            iconStart={ctaIcon}
            className="bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-700)]"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================== bits ============================ */

function Stat({
  value,
  label,
  hidden,
}: {
  value: string | number;
  label: string;
  hidden?: boolean;
}) {
  if (hidden) return <div />;
  return (
    <div>
      <div className="text-[22px] font-bold leading-tight text-[var(--color-ink-900)]">
        {value}
      </div>
      <div className="text-[12px] text-[var(--color-ink-500)]">{label}</div>
    </div>
  );
}

function LastAttemptBanner({
  last,
  passThreshold,
}: {
  last: LastAttemptSummary;
  passThreshold: number;
}) {
  if (last.status === 'in_progress') {
    return (
      <div className="mb-5 rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-warning)]">
        لديك محاولة لم تُكتمل بعد — يمكنك استئنافها.
      </div>
    );
  }

  const passed = last.passed;
  return (
    <div
      className={cn(
        'mb-5 flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[13px] font-semibold',
        passed
          ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
          : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
      )}
    >
      <Trophy className="size-4" />
      آخر محاولة: {last.score}% —{' '}
      {passed ? 'اجتزت' : `لم تجتز (الحد ${passThreshold}%)`}
    </div>
  );
}
