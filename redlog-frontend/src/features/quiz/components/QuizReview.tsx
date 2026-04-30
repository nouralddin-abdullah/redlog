import { useMemo } from 'react';
import { Check, X as XIcon, MinusCircle, Lightbulb, RotateCcw, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import type {
  AttemptResult,
  AttemptResultAnswer,
  QuizDefinition,
  QuizQuestion,
  QuizOption,
} from '../types';

interface QuizReviewProps {
  /** Lesson title — used in the result card subtitle. */
  title: string;
  quiz: QuizDefinition;
  result: AttemptResult;
  /** Return to the launcher (where they can start a new attempt). */
  onBack: () => void;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];

/**
 * Post-submit review. Hero card mirrors the reference's "result" screen —
 * big serif score, pass/fail emoji, 3-column stat grid (correct / wrong /
 * time taken). Below, every question is replayed with the user's pick, the
 * correct option, and the explanation in a blue callout.
 */
export function QuizReview({ title, quiz, result, onBack }: QuizReviewProps) {
  const sortedQuestions = useMemo(
    () => [...quiz.questions].sort((a, b) => a.order - b.order),
    [quiz.questions],
  );
  const answerByQuestion = useMemo(() => {
    const m = new Map<string, AttemptResultAnswer>();
    for (const a of result.answers) m.set(a.questionId, a);
    return m;
  }, [result.answers]);

  const correctCount = result.answers.filter((a) => a.isCorrect).length;
  const wrongCount = result.answers.length - correctCount;
  const skippedCount = sortedQuestions.length - result.answers.length;
  const passed = result.passed;
  const elapsedSec = Math.max(
    0,
    Math.floor(
      (new Date(result.submittedAt).getTime() -
        new Date(result.startedAt).getTime()) /
        1000,
    ),
  );

  const canRetake =
    quiz.maxAttempts === null || quiz.attemptsUsed < quiz.maxAttempts;

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)] py-10">
      <div className="mx-auto w-full max-w-[760px] px-5">
        {/* ===== Hero result card ===== */}
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-10 text-center shadow-[0_4px_12px_rgba(15,27,45,.08)]">
          <div
            className={cn(
              'mx-auto mb-5 flex size-[100px] items-center justify-center rounded-full text-[40px]',
              passed
                ? 'bg-[var(--color-success-soft)]'
                : 'bg-[var(--color-warning-soft)]',
            )}
          >
            {passed ? '🎉' : '📚'}
          </div>

          <h1 className="m-0 mb-2 text-[28px] font-bold text-[var(--color-ink-900)]">
            {passed ? 'مبروك! نجحت في الاختبار' : 'حاول مرة أخرى'}
          </h1>
          <p className="m-0 mb-6 text-[14px] text-[var(--color-ink-600)]">
            {passed
              ? `أداء رائع في "${title}" — استمر على هذا المستوى.`
              : `راجع الدرس "${title}" وأعد المحاولة عند الاستعداد.`}
          </p>

          <div
            className={cn(
              'mb-2 font-["Playfair_Display","ui-serif",serif] text-[64px] font-extrabold leading-none',
              passed ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]',
            )}
          >
            {result.score}%
          </div>
          <div className="mb-6 text-[14px] text-[var(--color-ink-600)]">
            {correctCount} من {sortedQuestions.length} إجابات صحيحة (الحد {quiz.passThresholdPercent}%)
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-4">
            <Stat
              value={correctCount}
              label="صحيحة"
              tone="success"
            />
            <Stat
              value={wrongCount + skippedCount}
              label={skippedCount > 0 ? `خاطئة + ${skippedCount} متخطّى` : 'خاطئة'}
              tone="danger"
            />
            <Stat
              value={formatElapsed(elapsedSec)}
              label="الوقت المستغرق"
              tone="ink"
            />
          </div>
        </div>

        {/* ===== Per-question review ===== */}
        <h2 className="m-0 mb-4 text-[20px] font-bold text-[var(--color-ink-900)]">
          مراجعة الإجابات
        </h2>

        <div className="flex flex-col gap-3">
          {sortedQuestions.map((q, i) => (
            <ReviewQuestion
              key={q.id}
              index={i}
              question={q}
              answer={answerByQuestion.get(q.id)}
            />
          ))}
        </div>

        {/* ===== Footer buttons ===== */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            variant="ghost"
            block
            size="lg"
            onClick={onBack}
            iconStart={<ChevronRight className="size-4" />}
          >
            العودة لصفحة الاختبار
          </Button>
          {canRetake && (
            <Button
              variant="primary"
              block
              size="lg"
              onClick={onBack}
              iconStart={<RotateCcw className="size-4" />}
              className="bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-700)]"
            >
              محاولة جديدة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== bits ============================ */

function Stat({
  value,
  label,
  tone,
}: {
  value: string | number;
  label: string;
  tone: 'success' | 'danger' | 'ink';
}) {
  const valueColor =
    tone === 'success'
      ? 'text-[var(--color-success)]'
      : tone === 'danger'
        ? 'text-[var(--color-danger)]'
        : 'text-[var(--color-ink-700)]';
  return (
    <div>
      <div className={cn('text-[20px] font-bold leading-tight', valueColor)}>
        {value}
      </div>
      <div className="text-[12px] text-[var(--color-ink-500)]">{label}</div>
    </div>
  );
}

/* ============================== per-question card ============================ */

function ReviewQuestion({
  index,
  question,
  answer,
}: {
  index: number;
  question: QuizQuestion;
  answer: AttemptResultAnswer | undefined;
}) {
  const sortedOptions = [...question.options].sort((a, b) => a.order - b.order);
  const skipped = !answer;
  const isCorrect = answer?.isCorrect ?? false;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5 shadow-[0_1px_2px_rgba(15,27,45,.04)]">
      <div className="mb-3 flex items-start gap-3">
        <StatusBadge skipped={skipped} isCorrect={isCorrect} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-[var(--color-ink-500)]">
            السؤال {index + 1}
            {question.points > 1 && ` · ${question.points} درجات`}
          </div>
          <div className="mt-1 text-[15px] font-semibold leading-relaxed text-[var(--color-ink-900)]">
            {question.text}
          </div>
        </div>
      </div>

      {question.imageUrl && (
        <figure className="mb-4 ms-11 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white p-3 text-center">
          <img
            src={question.imageUrl}
            alt=""
            className="mx-auto block max-h-[320px] w-auto rounded-[var(--radius-sm)]"
          />
        </figure>
      )}

      <ul className="mb-3 ms-11 flex flex-col gap-2">
        {sortedOptions.map((opt, i) => (
          <ReviewOption
            key={opt.id}
            index={i}
            option={opt}
            isCorrectOption={opt.id === answer?.correctOptionId}
            isSelected={opt.id === answer?.selectedOptionId}
            skipped={skipped}
          />
        ))}
      </ul>

      {answer?.explanation && (
        <div className="ms-11 rounded-[var(--radius-md)] bg-[var(--color-brand-blue-50)] p-3.5 text-[13.5px] leading-relaxed text-[var(--color-ink-700)]">
          <div className="mb-1 flex items-center gap-1.5 text-[var(--color-brand-blue-700)]">
            <Lightbulb className="size-4" />
            <span className="font-bold">شرح</span>
          </div>
          {answer.explanation}
        </div>
      )}
    </div>
  );
}

function ReviewOption({
  index,
  option,
  isCorrectOption,
  isSelected,
  skipped,
}: {
  index: number;
  option: QuizOption;
  isCorrectOption: boolean;
  isSelected: boolean;
  skipped: boolean;
}) {
  // Highlight schema:
  //   correct option (whether picked or not) → green outline
  //   user's pick that was wrong              → red outline
  //   else                                    → neutral
  const tone = isCorrectOption ? 'correct' : isSelected ? 'wrong' : 'neutral';

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-md)] border p-3 text-[14px] leading-relaxed',
        tone === 'correct' &&
          'border-[var(--color-success)]/40 bg-[var(--color-success-soft)] text-[var(--color-ink-900)]',
        tone === 'wrong' &&
          'border-[var(--color-danger)]/40 bg-[var(--color-danger-soft)] text-[var(--color-ink-900)]',
        tone === 'neutral' &&
          'border-[var(--color-line)] bg-white text-[var(--color-ink-700)]',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold',
          tone === 'correct' && 'bg-[var(--color-success)] text-white',
          tone === 'wrong' && 'bg-[var(--color-danger)] text-white',
          tone === 'neutral' &&
            'border-2 border-[var(--color-line-strong)] bg-white text-[var(--color-ink-600)]',
        )}
      >
        {tone === 'correct' ? (
          <Check className="size-3.5" />
        ) : tone === 'wrong' ? (
          <XIcon className="size-3.5" />
        ) : (
          ARABIC_LETTERS[index] ?? index + 1
        )}
      </span>
      <span className="min-w-0 flex-1">{option.text}</span>
      {isSelected && !skipped && (
        <span className="ms-auto whitespace-nowrap text-[12px] font-semibold text-[var(--color-ink-500)]">
          اختيارك
        </span>
      )}
    </li>
  );
}

function StatusBadge({
  skipped,
  isCorrect,
}: {
  skipped: boolean;
  isCorrect: boolean;
}) {
  if (skipped) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
        <MinusCircle className="size-[18px]" />
      </div>
    );
  }
  if (isCorrect) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
        <Check className="size-[18px]" />
      </div>
    );
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
      <XIcon className="size-[18px]" />
    </div>
  );
}

/* ============================== formatting ============================ */

function formatElapsed(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
