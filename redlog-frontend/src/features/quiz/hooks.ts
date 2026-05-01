import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi } from './api';
import type { Attempt, AttemptResult, SaveAnswerInput } from './types';
import { coursesKeys } from '@/features/courses/hooks';
import { lessonProgressKeys } from '@/features/lesson-progress/hooks';
import { enrollmentsKeys } from '@/features/enrollments/hooks';
import { certificatesKeys } from '@/features/certificates/hooks';

export const quizKeys = {
  all: ['quiz'] as const,
  byLesson: (lessonId: string) => ['quiz', 'lesson', lessonId] as const,
  attempt: (attemptId: string) => ['quiz', 'attempt', attemptId] as const,
};

/**
 * Loads the launchpad payload (questions + last-attempt summary). Stays
 * fresh for 30s — the user's `attemptsUsed` and `lastAttempt` shift after
 * mutations and we invalidate explicitly there.
 */
export function useQuiz(lessonId: string | undefined) {
  return useQuery({
    queryKey: quizKeys.byLesson(lessonId ?? ''),
    queryFn: () => quizApi.get(lessonId!),
    enabled: Boolean(lessonId),
    staleTime: 30_000,
  });
}

/**
 * Loads a single attempt — in-progress (with saved answers) or submitted
 * (with full graded result). Polling isn't enabled by default; the timer is
 * driven client-side from `expiresAt` and we refetch on submit.
 */
export function useAttempt(attemptId: string | null) {
  return useQuery<Attempt>({
    queryKey: quizKeys.attempt(attemptId ?? ''),
    queryFn: () => quizApi.getAttempt(attemptId!),
    enabled: Boolean(attemptId),
    staleTime: 5_000,
  });
}

/**
 * Starts (or resumes) an attempt. Caller passes the lessonId; on success we
 * invalidate the launchpad query so `attemptsUsed` / `lastAttempt` reflect
 * the new state when the user goes back.
 */
export function useStartAttempt(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => quizApi.startAttempt(lessonId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: quizKeys.byLesson(lessonId) });
    },
  });
}

/**
 * Persists one question's answer. Optimistically writes the value into the
 * cached attempt's `answers` array so the runner UI stays in sync without a
 * round-trip. Rolls back on error.
 */
export function useSaveAnswer(attemptId: string) {
  const qc = useQueryClient();
  const key = quizKeys.attempt(attemptId);

  return useMutation({
    mutationFn: (input: SaveAnswerInput) => quizApi.saveAnswer(attemptId, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Attempt>(key);

      if (previous && previous.submittedAt === null) {
        const others = previous.answers.filter(
          (a) => a.questionId !== input.questionId,
        );
        qc.setQueryData<Attempt>(key, {
          ...previous,
          answers: [
            ...others,
            { questionId: input.questionId, optionId: input.optionId },
          ],
        });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
  });
}

/**
 * Finalizes the attempt. The mutation result is the graded shape; we also
 * write it into the attempt cache so `useAttempt` immediately returns the
 * submitted form (no second network round-trip).
 *
 * When `courseSlug` is provided, a passing result triggers cache
 * invalidation for the course's progress + access + my-enrollments — the
 * backend marks the quiz lesson complete server-side, so the curriculum
 * checkmarks and progress bar need to refetch.
 */
export function useSubmitAttempt(
  attemptId: string,
  lessonId: string,
  courseSlug?: string,
) {
  const qc = useQueryClient();
  return useMutation<AttemptResult>({
    mutationFn: () => quizApi.submitAttempt(attemptId),
    onSuccess: (result) => {
      qc.setQueryData(quizKeys.attempt(attemptId), result);
      void qc.invalidateQueries({ queryKey: quizKeys.byLesson(lessonId) });

      // Passing a quiz auto-completes the quiz lesson on the backend. Bring
      // the per-course progress + access + my-enrollments caches in line.
      // (Failed attempts never affect progress, so nothing to do.)
      if (result.passed && courseSlug) {
        void qc.invalidateQueries({
          queryKey: lessonProgressKeys.course(courseSlug),
        });
        void qc.invalidateQueries({ queryKey: coursesKeys.access(courseSlug) });
        void qc.invalidateQueries({ queryKey: enrollmentsKeys.all });
        // The passed quiz might have been the last lesson in the course —
        // in which case the backend just issued a certificate. We don't get
        // course-completion signal from the quiz response, so refetch
        // unconditionally on a pass. Cheap: at most one request per submit.
        void qc.invalidateQueries({ queryKey: certificatesKeys.all });
      }
    },
  });
}
