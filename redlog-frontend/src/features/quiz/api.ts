import { api, type ApiSuccess } from '@/shared/api/client';
import type {
  Attempt,
  AttemptResult,
  AttemptStart,
  QuizDefinition,
  SaveAnswerInput,
  SaveAnswerResponse,
} from './types';

/**
 * Student-facing quiz endpoints. Instructor / admin endpoints intentionally
 * left out — add them in a separate module when authoring is built.
 */
export const quizApi = {
  /**
   * GET /lessons/:id/quiz — public; with a Bearer token, the response
   * includes `attemptsUsed` and `lastAttempt`.
   */
  async get(lessonId: string): Promise<QuizDefinition> {
    const { data } = await api.get<ApiSuccess<QuizDefinition>>(
      `/lessons/${lessonId}/quiz`,
    );
    return data.data;
  },

  /**
   * POST /lessons/:id/quiz/attempts — starts a new attempt or resumes the
   * in-progress one. Caller can ignore `resumed` and just store `attemptId`.
   */
  async startAttempt(lessonId: string): Promise<AttemptStart> {
    const { data } = await api.post<ApiSuccess<AttemptStart>>(
      `/lessons/${lessonId}/quiz/attempts`,
    );
    return data.data;
  },

  /**
   * GET /quiz-attempts/:id — auto-finalizes if expired. Two response shapes
   * (in-progress vs. submitted) discriminated by `submittedAt`.
   */
  async getAttempt(attemptId: string): Promise<Attempt> {
    const { data } = await api.get<ApiSuccess<Attempt>>(
      `/quiz-attempts/${attemptId}`,
    );
    return data.data;
  },

  /**
   * POST /quiz-attempts/:id/answers — upserts the student's pick for one
   * question. Calling with the same questionId replaces the previous answer.
   */
  async saveAnswer(
    attemptId: string,
    input: SaveAnswerInput,
  ): Promise<SaveAnswerResponse> {
    const { data } = await api.post<ApiSuccess<SaveAnswerResponse>>(
      `/quiz-attempts/${attemptId}/answers`,
      input,
    );
    return data.data;
  },

  /**
   * POST /quiz-attempts/:id/submit — finalize and grade. Idempotent: a
   * second call returns the same graded result.
   */
  async submitAttempt(attemptId: string): Promise<AttemptResult> {
    const { data } = await api.post<ApiSuccess<AttemptResult>>(
      `/quiz-attempts/${attemptId}/submit`,
    );
    return data.data;
  },
};
