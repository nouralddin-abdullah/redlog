import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from './api';
import type { CreateNoteInput, UpdateNoteInput } from './types';

export const notesKeys = {
  all: ['notes'] as const,
  byLesson: (lessonId: string) => ['notes', 'lesson', lessonId] as const,
};

export function useLessonNotes(lessonId: string | undefined) {
  return useQuery({
    queryKey: notesKeys.byLesson(lessonId ?? ''),
    queryFn: () => notesApi.list(lessonId!),
    enabled: Boolean(lessonId),
    staleTime: 30_000,
  });
}

export function useCreateNote(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesApi.create(lessonId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notesKeys.byLesson(lessonId) });
    },
  });
}

export function useUpdateNote(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      notesApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notesKeys.byLesson(lessonId) });
    },
  });
}

export function useDeleteNote(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notesKeys.byLesson(lessonId) });
    },
  });
}
