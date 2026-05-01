import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { instructorApi } from './api';
import { coursesKeys } from '@/features/courses/hooks';
import { lessonsKeys } from '@/features/lessons/hooks';
import type {
  CreateLessonInput,
  CreateModuleInput,
  InstructorCoursesQuery,
  ReorderCurriculumInput,
  UpdateCourseInput,
  UpdateLessonInput,
  UpdateModuleInput,
} from './types';

export const instructorKeys = {
  all: ['instructor'] as const,
  dashboard: () => ['instructor', 'dashboard'] as const,
  courses: () => ['instructor', 'courses'] as const,
  coursesList: (params: InstructorCoursesQuery) =>
    ['instructor', 'courses', params] as const,
  course: (slug: string) => ['instructor', 'course', slug] as const,
  curriculum: (slug: string) =>
    ['instructor', 'course', slug, 'curriculum'] as const,
  attachments: (lessonId: string) =>
    ['instructor', 'lesson', lessonId, 'attachments'] as const,
};

/**
 * Single-fetch dashboard payload. Stale time is short (60s) — KPIs and feeds
 * shift any time a student enrolls, reviews, or asks a question, so we don't
 * want users staring at significantly stale numbers.
 */
export function useInstructorDashboard() {
  return useQuery({
    queryKey: instructorKeys.dashboard(),
    queryFn: () => instructorApi.getDashboard(),
    staleTime: 60_000,
  });
}

/**
 * Paginated + filterable list of the instructor's own courses. `keepPreviousData`
 * keeps the table populated while the user types into search or paginates,
 * so the layout doesn't flash empty between requests.
 */
export function useInstructorCourses(params: InstructorCoursesQuery = {}) {
  return useQuery({
    queryKey: instructorKeys.coursesList(params),
    queryFn: () => instructorApi.listCourses(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Workflow mutations invalidate the dashboard, the courses list (status
 * counts + the changed row's status), and the affected course's public
 * detail caches (status flips).
 */
function useWorkflowInvalidate() {
  const qc = useQueryClient();
  return (slug?: string) => {
    void qc.invalidateQueries({ queryKey: instructorKeys.dashboard() });
    void qc.invalidateQueries({ queryKey: instructorKeys.courses() });
    if (slug) {
      void qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });
      void qc.invalidateQueries({ queryKey: coursesKeys.access(slug) });
    }
  };
}

export function useSubmitCourseForReview() {
  const invalidate = useWorkflowInvalidate();
  return useMutation({
    mutationFn: ({ courseId }: { courseId: string; slug?: string }) =>
      instructorApi.submitForReview(courseId),
    onSuccess: (_data, vars) => invalidate(vars.slug),
  });
}

export function useUnpublishCourse() {
  const invalidate = useWorkflowInvalidate();
  return useMutation({
    mutationFn: ({ courseId }: { courseId: string; slug?: string }) =>
      instructorApi.unpublish(courseId),
    onSuccess: (_data, vars) => invalidate(vars.slug),
  });
}

/**
 * Full course detail for the editor — basic info, pricing, thumbnail, and
 * the workflow timestamps all come back in this single payload.
 */
export function useInstructorCourse(slug: string | undefined) {
  return useQuery({
    queryKey: slug ? instructorKeys.course(slug) : ['instructor', 'course', ''],
    queryFn: () => instructorApi.getCourse(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

/** Modules + lessons tree for the curriculum tab. */
export function useInstructorCurriculum(slug: string | undefined) {
  return useQuery({
    queryKey: slug
      ? instructorKeys.curriculum(slug)
      : ['instructor', 'course', '', 'curriculum'],
    queryFn: () => instructorApi.getCurriculum(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

/**
 * Save edits from the basic-info / pricing tabs. Caller passes the slug so
 * we can patch the cached detail in-place from the response (no refetch
 * needed — the API returns the fresh course). Also invalidates the courses
 * list since `updatedAt` and any visible field there could shift.
 */
export function useUpdateCourse(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      body,
    }: {
      courseId: string;
      body: UpdateCourseInput;
    }) => instructorApi.updateCourse(courseId, body),
    onSuccess: (updated) => {
      // The PATCH response is the public Course shape — refetch the
      // instructor detail rather than try to merge two slightly different
      // shapes by hand.
      void qc.invalidateQueries({ queryKey: instructorKeys.course(slug) });
      void qc.invalidateQueries({ queryKey: instructorKeys.courses() });
      void qc.invalidateQueries({ queryKey: coursesKeys.detail(updated.slug) });
    },
  });
}

/**
 * Multipart thumbnail upload. Per spec, the server already persists
 * `Course.thumbnail` so we don't need a follow-up PATCH — just refetch the
 * detail to pick up the new URL.
 */
export function useUploadThumbnail(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, file }: { courseId: string; file: File }) =>
      instructorApi.uploadThumbnail(courseId, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: instructorKeys.course(slug) });
      void qc.invalidateQueries({ queryKey: instructorKeys.courses() });
      void qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });
    },
  });
}

/* ============================== Curriculum mutations ==============================
 * Every curriculum-changing mutation invalidates:
 *   - The curriculum query (always, the tree changed)
 *   - The course detail query (totalLessons / durationMinutes shift on
 *     create/delete; cheap to refetch on rename too)
 *   - The instructor courses list (those same totals are denormalized into
 *     the row data)
 *   - The public learner curriculum (`coursesKeys.curriculum`) so a viewer
 *     mid-session sees fresh structure
 *
 * Reorder is the exception — only `order` columns shift, totals are stable,
 * so we only invalidate the curriculum queries.
 */
function useCurriculumInvalidate(slug: string) {
  const qc = useQueryClient();
  return (opts: { totalsChanged?: boolean } = {}) => {
    void qc.invalidateQueries({ queryKey: instructorKeys.curriculum(slug) });
    void qc.invalidateQueries({ queryKey: coursesKeys.curriculum(slug) });
    if (opts.totalsChanged) {
      void qc.invalidateQueries({ queryKey: instructorKeys.course(slug) });
      void qc.invalidateQueries({ queryKey: instructorKeys.courses() });
      void qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });
    }
  };
}

export function useCreateModule(slug: string) {
  const invalidate = useCurriculumInvalidate(slug);
  return useMutation({
    mutationFn: ({
      courseId,
      body,
    }: {
      courseId: string;
      body: CreateModuleInput;
    }) => instructorApi.createModule(courseId, body),
    onSuccess: () => invalidate({ totalsChanged: false }),
  });
}

export function useUpdateModule(slug: string) {
  const invalidate = useCurriculumInvalidate(slug);
  return useMutation({
    mutationFn: ({
      moduleId,
      body,
    }: {
      moduleId: string;
      body: UpdateModuleInput;
    }) => instructorApi.updateModule(moduleId, body),
    onSuccess: () => invalidate({ totalsChanged: false }),
  });
}

export function useDeleteModule(slug: string) {
  const invalidate = useCurriculumInvalidate(slug);
  return useMutation({
    // Cascade-deletes lessons → totals shift.
    mutationFn: ({ moduleId }: { moduleId: string }) =>
      instructorApi.deleteModule(moduleId),
    onSuccess: () => invalidate({ totalsChanged: true }),
  });
}

export function useCreateLesson(slug: string) {
  const invalidate = useCurriculumInvalidate(slug);
  return useMutation({
    mutationFn: ({
      moduleId,
      body,
    }: {
      moduleId: string;
      body: CreateLessonInput;
    }) => instructorApi.createLesson(moduleId, body),
    onSuccess: () => invalidate({ totalsChanged: true }),
  });
}

export function useUpdateLesson(slug: string) {
  const invalidate = useCurriculumInvalidate(slug);
  return useMutation({
    mutationFn: ({
      lessonId,
      body,
    }: {
      lessonId: string;
      body: UpdateLessonInput;
    }) => instructorApi.updateLesson(lessonId, body),
    // durationSeconds changes shift module/course durationMinutes.
    onSuccess: (_data, vars) =>
      invalidate({ totalsChanged: vars.body.durationSeconds !== undefined }),
  });
}

export function useDeleteLesson(slug: string) {
  const invalidate = useCurriculumInvalidate(slug);
  return useMutation({
    mutationFn: ({ lessonId }: { lessonId: string }) =>
      instructorApi.deleteLesson(lessonId),
    onSuccess: () => invalidate({ totalsChanged: true }),
  });
}

/**
 * Bulk reorder. The mutation result is the freshly-ordered tree — we
 * `setQueryData` to skip the immediate refetch so the user sees their drop
 * land instantly. Other consumers (public curriculum) still get invalidated.
 */
export function useReorderCurriculum(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      body,
    }: {
      courseId: string;
      body: ReorderCurriculumInput;
    }) => instructorApi.reorderCurriculum(courseId, body),
    onSuccess: (modules) => {
      qc.setQueryData(instructorKeys.curriculum(slug), modules);
      void qc.invalidateQueries({ queryKey: coursesKeys.curriculum(slug) });
    },
  });
}

/* ============================== Lesson attachments ==============================
 * The attachment list is also embedded on the lesson detail response, so
 * mutations always invalidate `lessonsKeys.detail(lessonId)` along with the
 * dedicated list query — both caches need to refresh.
 */

export function useLessonAttachments(lessonId: string | undefined) {
  return useQuery({
    queryKey: lessonId
      ? instructorKeys.attachments(lessonId)
      : ['instructor', 'lesson', '', 'attachments'],
    queryFn: () => instructorApi.listAttachments(lessonId!),
    enabled: Boolean(lessonId),
    staleTime: 60_000,
  });
}

function useAttachmentInvalidate(lessonId: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({
      queryKey: instructorKeys.attachments(lessonId),
    });
    void qc.invalidateQueries({ queryKey: lessonsKeys.detail(lessonId) });
  };
}

export function useUploadAttachment(lessonId: string) {
  const invalidate = useAttachmentInvalidate(lessonId);
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) =>
      instructorApi.uploadAttachment(lessonId, file, title),
    onSuccess: invalidate,
  });
}

export function useRenameAttachment(lessonId: string) {
  const invalidate = useAttachmentInvalidate(lessonId);
  return useMutation({
    mutationFn: ({
      attachmentId,
      title,
    }: {
      attachmentId: string;
      title: string;
    }) => instructorApi.renameAttachment(attachmentId, title),
    onSuccess: invalidate,
  });
}

export function useDeleteAttachment(lessonId: string) {
  const invalidate = useAttachmentInvalidate(lessonId);
  return useMutation({
    mutationFn: ({ attachmentId }: { attachmentId: string }) =>
      instructorApi.deleteAttachment(attachmentId),
    onSuccess: invalidate,
  });
}
