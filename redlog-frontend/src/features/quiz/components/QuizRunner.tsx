import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X as XIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { cn } from '@/shared/lib/cn';
import { useSaveAnswer, useSubmitAttempt } from '../hooks';
import { detectTrueFalse, type TrueFalseShape } from '../utils';
import type {
  AttemptInProgress,
  QuizDefinition,
  QuizOption,
} from '../types';

interface QuizRunnerProps {
  /** Lesson title — shown in the sticky topbar. */
  title: string;
  quiz: QuizDefinition;
  attempt: AttemptInProgress;
  /** Forwarded to the submit hook for cache invalidation on a pass. */
  courseSlug?: string;
  /** Caller hides the surrounding chrome (lesson info, etc.) while taking. */
  onExit: () => void;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

/**
 * Live quiz UI driven by an in-progress attempt. Layout mirrors the Radlog
 * reference: sticky topbar with timer chip, slim progress bar, centered
 * 760px content column, sticky footer with prev/next/submit + dot indicators.
 *
 * Auto-saves on every option pick (optimistic via the cached attempt).
 * Auto-submits when the timer reaches zero.
 */
export function QuizRunner({
  title,
  quiz,
  attempt,
  courseSlug,
  onExit,
}: QuizRunnerProps) {
  const sortedQuestions = useMemo(
    () => [...quiz.questions].sort((a, b) => a.order - b.order),
    [quiz.questions],
  );

  const [questionIdx, setQuestionIdx] = useState(0);
  const current = sortedQuestions[questionIdx];

  const answersByQuestion = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of attempt.answers) m.set(a.questionId, a.optionId);
    return m;
  }, [attempt.answers]);

  const saveAnswer = useSaveAnswer(attempt.id);
  const submitAttempt = useSubmitAttempt(attempt.id, quiz.lessonId, courseSlug);

  const remainingMs = useCountdown(attempt.expiresAt);
  const remainingSec = Math.floor(remainingMs / 1000);
  const timeIsUp = remainingMs <= 0;
  const timeRunningOut = remainingSec > 0 && remainingSec < 60;

  // Auto-submit on expiry — guarded so it only fires once.
  const autoSubmittedRef = useRef(false);
  useEffect(() => {
    if (
      timeIsUp &&
      !autoSubmittedRef.current &&
      !submitAttempt.isPending &&
      !submitAttempt.isSuccess
    ) {
      autoSubmittedRef.current = true;
      submitAttempt.mutate(undefined, {
        onError: (err) =>
          toast.error(
            err instanceof HttpError
              ? err.message
              : 'انتهى الوقت — أعد التحميل لرؤية النتيجة.',
          ),
      });
    }
  }, [timeIsUp, submitAttempt]);

  const handlePick = (optionId: string) => {
    if (!current || timeIsUp) return;
    saveAnswer.mutate(
      { questionId: current.id, optionId },
      {
        onError: (err) =>
          toast.error(
            err instanceof HttpError ? err.message : 'تعذّر حفظ الإجابة',
          ),
      },
    );
  };

  const handleSubmit = () => {
    if (submitAttempt.isPending) return;
    submitAttempt.mutate(undefined, {
      onError: (err) =>
        toast.error(
          err instanceof HttpError ? err.message : 'تعذّر إرسال الاختبار',
        ),
    });
  };

  const handleExit = () => {
    if (window.confirm('هل تريد إنهاء الاختبار؟ ستحفظ إجاباتك ويمكنك استئنافه لاحقاً.')) {
      onExit();
    }
  };

  if (!current) {
    return (
      <div className="bg-white p-8">
        <Alert tone="warning">لا توجد أسئلة مرتبطة بهذا الاختبار.</Alert>
      </div>
    );
  }

  const isLast = questionIdx === sortedQuestions.length - 1;
  const isFirst = questionIdx === 0;
  const selectedOptionId = answersByQuestion.get(current.id);
  const answered = selectedOptionId !== undefined;
  const progressPct = ((questionIdx + 1) / sortedQuestions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-soft)]">
      {/* ===== Sticky topbar ===== */}
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[var(--color-line)] bg-white px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExit}
          iconStart={<XIcon className="size-4" />}
        >
          إنهاء
        </Button>

        <div className="flex-1 text-center">
          <div className="truncate text-[12.5px] text-[var(--color-ink-500)]">
            {title}
          </div>
          <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
            السؤال {questionIdx + 1} من {sortedQuestions.length}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius-md)] px-3.5 py-2 font-mono text-[15px] font-bold tabular-nums',
            timeRunningOut || timeIsUp
              ? 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
              : 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]',
          )}
        >
          <Clock className="size-4" />
          {formatRemaining(remainingMs)}
        </div>
      </header>

      {/* Slim progress bar */}
      <div className="h-1 bg-[var(--color-surface-muted)]">
        <div
          className="h-full bg-[var(--color-brand-blue)] transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ===== Content column ===== */}
      <div className="mx-auto w-full max-w-[760px] flex-1 px-5 pb-24 pt-8">
        <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink-500)]">
          <span>سؤال {questionIdx + 1}</span>
          {current.points > 1 && (
            <>
              <span aria-hidden>•</span>
              <span>{current.points} درجات</span>
            </>
          )}
        </div>

        <h2 className="m-0 mb-6 text-[22px] font-bold leading-[1.6] text-[var(--color-ink-900)]">
          {current.text}
        </h2>

        {current.imageUrl && (
          <figure className="mb-7 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4 text-center">
            <img
              src={current.imageUrl}
              alt=""
              className="mx-auto block max-h-[420px] w-auto rounded-[var(--radius-md)]"
            />
          </figure>
        )}

        {(() => {
          const tf = detectTrueFalse(current);
          if (tf) {
            return (
              <TrueFalseChoice
                shape={tf}
                selectedId={selectedOptionId}
                disabled={timeIsUp}
                onPick={handlePick}
              />
            );
          }
          return (
            <ul className="flex flex-col gap-3">
              {[...current.options]
                .sort((a, b) => a.order - b.order)
                .map((opt, i) => (
                  <OptionButton
                    key={opt.id}
                    index={i}
                    option={opt}
                    selected={opt.id === selectedOptionId}
                    disabled={timeIsUp}
                    onPick={handlePick}
                  />
                ))}
            </ul>
          );
        })()}
      </div>

      {/* ===== Sticky footer ===== */}
      <footer className="sticky bottom-0 z-20 border-t border-[var(--color-line)] bg-white">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-5 py-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setQuestionIdx((i) => Math.max(0, i - 1))}
            disabled={isFirst}
            iconStart={<ChevronRight className="size-4" />}
          >
            السابق
          </Button>

          {/* dot indicators */}
          <div className="flex items-center gap-1.5">
            {sortedQuestions.map((q, i) => {
              const dotAnswered = answersByQuestion.has(q.id);
              const dotCurrent = i === questionIdx;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuestionIdx(i)}
                  aria-label={`الانتقال إلى السؤال ${i + 1}`}
                  aria-current={dotCurrent ? 'step' : undefined}
                  className={cn(
                    'size-2.5 rounded-full transition-colors',
                    dotCurrent
                      ? 'ring-2 ring-[var(--color-brand-blue)] ring-offset-1 ring-offset-white'
                      : '',
                    dotAnswered
                      ? 'bg-[var(--color-brand-blue)]'
                      : dotCurrent
                        ? 'bg-[var(--color-brand-blue-100)]'
                        : 'bg-[var(--color-surface-muted)]',
                  )}
                />
              );
            })}
          </div>

          {isLast ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={submitAttempt.isPending}
              disabled={!answered}
              iconEnd={<Check className="size-4" />}
              className="bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-700)]"
            >
              إنهاء الاختبار
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setQuestionIdx((i) => i + 1)}
              disabled={!answered}
              iconEnd={<ChevronLeft className="size-4" />}
              className="bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-700)]"
            >
              التالي
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

/* ============================== True/False choice ============================ */

function TrueFalseChoice({
  shape,
  selectedId,
  disabled,
  onPick,
}: {
  shape: TrueFalseShape;
  selectedId: string | undefined;
  disabled: boolean;
  onPick: (optionId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      <TrueFalseButton
        kind="true"
        option={shape.trueOption}
        selected={selectedId === shape.trueOption.id}
        disabled={disabled}
        onPick={onPick}
      />
      <TrueFalseButton
        kind="false"
        option={shape.falseOption}
        selected={selectedId === shape.falseOption.id}
        disabled={disabled}
        onPick={onPick}
      />
    </div>
  );
}

function TrueFalseButton({
  kind,
  option,
  selected,
  disabled,
  onPick,
}: {
  kind: 'true' | 'false';
  option: QuizOption;
  selected: boolean;
  disabled: boolean;
  onPick: (optionId: string) => void;
}) {
  const isTrue = kind === 'true';
  return (
    <button
      type="button"
      onClick={() => onPick(option.id)}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 bg-white px-5 py-8 text-[20px] font-bold transition-colors',
        // Selected state — colored border, tinted bg, colored text
        selected
          ? isTrue
            ? 'border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]'
            : 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
          : 'border-[var(--color-line)] text-[var(--color-ink-700)] hover:border-[var(--color-ink-400)]',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-full transition-colors',
          selected
            ? isTrue
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-[var(--color-danger)] text-white'
            : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]',
        )}
      >
        {isTrue ? <Check className="size-7" /> : <XIcon className="size-7" />}
      </span>
      {option.text}
    </button>
  );
}

/* ============================== option button ============================ */

function OptionButton({
  index,
  option,
  selected,
  disabled,
  onPick,
}: {
  index: number;
  option: QuizOption;
  selected: boolean;
  disabled: boolean;
  onPick: (optionId: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(option.id)}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(
          'flex w-full items-center gap-3.5 rounded-[var(--radius-md)] border-2 bg-white px-5 py-4 text-start text-[15px] leading-relaxed transition-colors',
          selected
            ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] font-semibold text-[var(--color-brand-blue-700)]'
            : 'border-[var(--color-line)] font-medium text-[var(--color-ink-800)] hover:border-[var(--color-ink-400)]',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold transition-colors',
            selected
              ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)] text-white'
              : 'border-[var(--color-line-strong)] bg-white text-[var(--color-ink-700)]',
          )}
        >
          {selected ? (
            <Check className="size-3.5" />
          ) : (
            ARABIC_LETTERS[index] ?? index + 1
          )}
        </span>
        <span className="min-w-0 flex-1">{option.text}</span>
      </button>
    </li>
  );
}

/* ============================== timer helpers ============================ */

/** Returns ms remaining until `targetIso`. Re-renders every second. */
function useCountdown(targetIso: string) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return Math.max(0, target - now);
}

function formatRemaining(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

