import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonProgressApi } from './api';
import type { CourseProgress, LessonCompletionResult } from './types';
import { coursesKeys } from '@/features/courses/hooks';
import { enrollmentsKeys } from '@/features/enrollments/hooks';
import { certificatesKeys } from '@/features/certificates/hooks';

export const lessonProgressKeys = {
  all: ['lesson-progress'] as const,
  course: (slug: string) => ['lesson-progress', 'course', slug] as const,
};

/**
 * Per-course progress for the curriculum tab and player sidebar. Requires the
 * caller to be enrolled — backend returns 403 otherwise. Caller should guard
 * with `enabled` based on access state.
 */
export function useCourseProgress(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: lessonProgressKeys.course(slug ?? ''),
    queryFn: () => lessonProgressApi.getCourseProgress(slug!),
    enabled: Boolean(slug) && (options.enabled ?? true),
    staleTime: 60_000,
  });
}

/**
 * Shared post-mutation cache writes for both mark and unmark. The server
 * returns a fresh `courseProgress` snapshot in the response, so we can
 * `setQueryData` for the per-course progress key (without `completedLessonIds`
 * — that requires a refetch since it's not in the mutation payload) and
 * invalidate the rest.
 */
function applyCompletionResult(
  qc: ReturnType<typeof useQueryClient>,
  slug: string,
  result: LessonCompletionResult,
): void {
  // Patch the per-course progress cache with the fresh snapshot. Update
  // completedLessonIds optimistically too — we know exactly which lesson
  // toggled. This avoids an extra round-trip while keeping checkmarks in sync.
  qc.setQueryData<CourseProgress | undefined>(
    lessonProgressKeys.course(slug),
    (prev) => {
      if (!prev) return prev;
      const lessonIds = new Set(prev.completedLessonIds);
      if (result.completedAt) lessonIds.add(result.lessonId);
      else lessonIds.delete(result.lessonId);
      return {
        ...prev,
        completedCount: result.courseProgress.completedCount,
        totalLessons: result.courseProgress.totalLessons,
        percent: result.courseProgress.percent,
        currentLessonId: result.courseProgress.currentLessonId,
        completedAt: result.courseProgress.completedAt,
        completedLessonIds: Array.from(lessonIds),
      };
    },
  );

  // Access response carries enrollment.completedAt — flips when the last
  // lesson is (un)completed. Refetch so the landing card stays correct.
  void qc.invalidateQueries({ queryKey: coursesKeys.access(slug) });
  // My-courses page reads progress per enrollment; its cache shape is a list
  // so a targeted patch isn't worth it — invalidate.
  void qc.invalidateQueries({ queryKey: enrollmentsKeys.all });
  // When the course just transitioned to fully complete, the backend issued
  // (or reused) a certificate inside the same flow. Refetch the list so the
  // user sees it without a manual reload. Skipped on un-complete and on
  // partial-progress writes — neither can produce a new cert.
  if (result.courseProgress.completedAt) {
    void qc.invalidateQueries({ queryKey: certificatesKeys.all });
  }
}

export function useMarkLessonComplete(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => lessonProgressApi.markComplete(lessonId),
    onSuccess: (result) => applyCompletionResult(qc, slug, result),
  });
}

export function useUnmarkLessonComplete(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => lessonProgressApi.unmarkComplete(lessonId),
    onSuccess: (result) => applyCompletionResult(qc, slug, result),
  });
}
