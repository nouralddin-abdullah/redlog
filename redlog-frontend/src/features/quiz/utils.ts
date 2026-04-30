import type { QuizOption, QuizQuestion } from './types';

/**
 * The backend doesn't (yet) carry an explicit question `kind`, so we infer
 * True/False questions from their option set: exactly two options whose
 * text matches a known Arabic/English True/False vocabulary. Falls back to
 * `null` for everything else (rendered as standard MCQ).
 *
 * If the backend ever adds `question.kind: 'true_false' | 'mcq' | …`, swap
 * this for a direct check and delete the heuristic.
 */
const TRUE_TOKENS = ['صح', 'صحيح', 'نعم', 'true', 'yes', 't'];
const FALSE_TOKENS = ['خطأ', 'خاطئ', 'لا', 'false', 'no', 'f'];

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export interface TrueFalseShape {
  trueOption: QuizOption;
  falseOption: QuizOption;
}

export function detectTrueFalse(question: QuizQuestion): TrueFalseShape | null {
  if (question.options.length !== 2) return null;
  const [a, b] = question.options;
  const an = normalize(a.text);
  const bn = normalize(b.text);

  const aIsTrue = TRUE_TOKENS.includes(an);
  const aIsFalse = FALSE_TOKENS.includes(an);
  const bIsTrue = TRUE_TOKENS.includes(bn);
  const bIsFalse = FALSE_TOKENS.includes(bn);

  if (aIsTrue && bIsFalse) return { trueOption: a, falseOption: b };
  if (bIsTrue && aIsFalse) return { trueOption: b, falseOption: a };
  return null;
}
