import { useQuery } from '@tanstack/react-query';
import { attachmentsApi } from './api';

export const attachmentsKeys = {
  all: ['attachments'] as const,
  byLesson: (lessonId: string) => ['attachments', 'lesson', lessonId] as const,
};

export function useLessonAttachments(lessonId: string | undefined) {
  return useQuery({
    queryKey: attachmentsKeys.byLesson(lessonId ?? ''),
    queryFn: () => attachmentsApi.list(lessonId!),
    enabled: Boolean(lessonId),
    staleTime: 60_000,
  });
}
