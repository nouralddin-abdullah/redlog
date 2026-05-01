import type { EnrollmentProgressSummary } from '@/features/lesson-progress/types';

/** Slim course projection embedded on each enrollment row in `/me/enrollments`. */
export interface EnrollmentCourse {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
}

/**
 * One row from `GET /me/enrollments`. `progress` is **always present** —
 * empty courses come back as `{ totalLessons: 0, percent: 0, ... }` rather
 * than null. Detect the empty state via `progress.totalLessons === 0`.
 */
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  /** JSON string — money fields are decimals serialized as strings. */
  pricePaid: string;
  enrolledAt: string;
  lastAccessedAt: string | null;
  /** Most-recently-opened lesson — what "Continue learning" jumps to. */
  currentLessonId: string | null;
  /** Non-null only when every lesson in the course is complete. */
  completedAt: string | null;
  course: EnrollmentCourse;
  progress: EnrollmentProgressSummary;
}
