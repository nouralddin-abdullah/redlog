/**
 * Types for the Lesson Progress API. Mirrors `newchanges-api.md`.
 *
 * Notes:
 * - Money fields are JSON strings (kept consistent with Course.price). No money
 *   types live here — they're carried on the enrollment, not on progress.
 * - `progress.totalLessons === 0` is the empty-course signal — the API never
 *   returns null for the progress block.
 * - `completedLessonIds` is a set; iteration order is not guaranteed.
 */

/** Embedded in mutation responses + `EnrollmentDTO.progress`. No `completedLessonIds`. */
export interface EnrollmentProgressSummary {
  completedCount: number;
  totalLessons: number;
  /** 0..100, floored. Never reads 100 unless the course is actually fully done. */
  percent: number;
  currentLessonId: string | null;
  /** Non-null only when every lesson in the course is completed. */
  completedAt: string | null;
}

/** Full per-course progress payload from `GET /courses/:slug/progress`. */
export interface CourseProgress extends EnrollmentProgressSummary {
  courseId: string;
  /** Set membership — order not guaranteed. Use as `Set` on the client. */
  completedLessonIds: string[];
}

/** Response shape for `POST` and `DELETE /lessons/:id/complete`. */
export interface LessonCompletionResult {
  lessonId: string;
  /** ISO timestamp on POST; null on DELETE. */
  completedAt: string | null;
  courseProgress: EnrollmentProgressSummary;
}
