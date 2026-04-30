import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { questionsApi } from './api';
import type {
  CreateQuestionInput,
  CreateReplyInput,
  LessonQuestion,
  UpdateQuestionInput,
  UpdateReplyInput,
} from './types';

export const questionsKeys = {
  all: ['questions'] as const,
  byLesson: (lessonId: string) => ['questions', 'lesson', lessonId] as const,
};

function invalidate(qc: QueryClient, lessonId: string) {
  void qc.invalidateQueries({ queryKey: questionsKeys.byLesson(lessonId) });
}

export function useLessonQuestions(lessonId: string | undefined) {
  return useQuery({
    queryKey: questionsKeys.byLesson(lessonId ?? ''),
    queryFn: () => questionsApi.list(lessonId!),
    enabled: Boolean(lessonId),
    staleTime: 15_000,
  });
}

/* =================== questions =================== */

export function useCreateQuestion(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuestionInput) =>
      questionsApi.create(lessonId, input),
    onSuccess: () => invalidate(qc, lessonId),
  });
}

export function useUpdateQuestion(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuestionInput }) =>
      questionsApi.update(id, input),
    onSuccess: () => invalidate(qc, lessonId),
  });
}

export function useDeleteQuestion(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.delete(id),
    onSuccess: () => invalidate(qc, lessonId),
  });
}

/* =================== like (optimistic) =================== */

interface ToggleLikeArgs {
  id: string;
  currentlyLiked: boolean;
}

/**
 * Optimistic like toggle. Notes:
 * - We don't `invalidate` on settled because the GET list endpoint may
 *   return stale `likedByMe` for a fresh like (e.g. eventual consistency
 *   or backend bugs); a refetch would clobber the optimistic flip.
 * - `onSuccess` syncs `likedByMe` from the like endpoint's authoritative
 *   `{ liked: boolean }` payload so we self-heal if our optimistic guess
 *   was wrong.
 * - `likesCount` stays as the optimistic delta — fine because the like
 *   endpoint is idempotent.
 */
export function useToggleQuestionLike(lessonId: string) {
  const qc = useQueryClient();
  const key = questionsKeys.byLesson(lessonId);

  return useMutation({
    mutationFn: ({ id, currentlyLiked }: ToggleLikeArgs) =>
      currentlyLiked ? questionsApi.unlike(id) : questionsApi.like(id),

    onMutate: async ({ id, currentlyLiked }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<LessonQuestion[]>(key);

      if (prev) {
        qc.setQueryData<LessonQuestion[]>(
          key,
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  likedByMe: !currentlyLiked,
                  likesCount: Math.max(0, q.likesCount + (currentlyLiked ? -1 : 1)),
                }
              : q,
          ),
        );
      }
      return { prev };
    },

    onSuccess: (response, { id }) => {
      qc.setQueryData<LessonQuestion[]>(key, (current) => {
        if (!current) return current;
        return current.map((q) =>
          q.id === id ? { ...q, likedByMe: response.liked } : q,
        );
      });
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
  });
}

/* =================== replies =================== */

export function useCreateReply(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: string;
      input: CreateReplyInput;
    }) => questionsApi.createReply(questionId, input),
    onSuccess: () => invalidate(qc, lessonId),
  });
}

export function useUpdateReply(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReplyInput }) =>
      questionsApi.updateReply(id, input),
    onSuccess: () => invalidate(qc, lessonId),
  });
}

export function useDeleteReply(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.deleteReply(id),
    onSuccess: () => invalidate(qc, lessonId),
  });
}
