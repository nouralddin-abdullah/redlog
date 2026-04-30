/**
 * Types for the student-facing quiz API. Mirrors `quiz-api.md` exactly —
 * keep them in sync when the spec changes.
 *
 * Notable contracts:
 * - The launchpad payload (`QuizDefinition`) NEVER carries `isCorrect` on
 *   options or `explanation` on questions — those only appear on the
 *   submitted-attempt shape.
 * - `lastAttempt.status` is `'in_progress' | 'submitted' | 'expired'`. The
 *   server auto-finalizes expired attempts on read; treat 'expired' the same
 *   as a submitted attempt for review purposes.
 */

export type AttemptStatus = 'in_progress' | 'submitted' | 'expired';

/* ============================== Quiz definition ============================ */

export interface QuizOption {
  id: string;
  order: number;
  text: string;
}

export interface QuizQuestion {
  id: string;
  order: number;
  text: string;
  imageUrl: string | null;
  points: number;
  options: QuizOption[];
}

export interface LastAttemptSummary {
  id: string;
  startedAt: string;
  /** null only when status === 'in_progress'. */
  submittedAt: string | null;
  expiresAt: string;
  score: number;
  passed: boolean;
  status: AttemptStatus;
}

export interface QuizDefinition {
  lessonId: string;
  durationSeconds: number;
  passThresholdPercent: number;
  questionsCount: number;
  /** null = unlimited. */
  maxAttempts: number | null;
  /** Number of attempts (in_progress + submitted + expired) used so far. */
  attemptsUsed: number;
  questions: QuizQuestion[];
  /** null when the user is anonymous or has never attempted. */
  lastAttempt: LastAttemptSummary | null;
}

/* ============================== Start attempt ============================== */

export interface AttemptStart {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  /** true when the server returned the in-progress attempt instead of a new one. */
  resumed: boolean;
}

/* ============================== Attempt state ============================== */

export interface AttemptAnswerInProgress {
  questionId: string;
  optionId: string;
}

export interface AttemptInProgress {
  id: string;
  lessonId: string;
  startedAt: string;
  expiresAt: string;
  submittedAt: null;
  answers: AttemptAnswerInProgress[];
}

export interface AttemptResultAnswer {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  points: number;
  explanation: string | null;
}

export interface AttemptResult {
  id: string;
  lessonId: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  passed: boolean;
  pointsEarned: number;
  pointsTotal: number;
  /** Only includes questions the user actually answered before submit/expiry. */
  answers: AttemptResultAnswer[];
}

export type Attempt = AttemptInProgress | AttemptResult;

export function isAttemptResult(a: Attempt): a is AttemptResult {
  return a.submittedAt !== null;
}

/* ============================== Save answer ================================ */

export interface SaveAnswerInput {
  questionId: string;
  optionId: string;
}

export interface SaveAnswerResponse {
  questionId: string;
  optionId: string;
}
