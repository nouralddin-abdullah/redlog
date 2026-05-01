/**
 * Mock-data types for the standalone instructor area. Intentionally distinct
 * from the learner-side `Course` / `Enrollment` shapes — the instructor view
 * has different read fields (earnings, completion %, status workflow) that
 * the public API doesn't expose. Once the real API lands these types will
 * be swapped one-for-one; today they back the design fixtures only.
 */

export type CourseStatus = 'published' | 'draft' | 'pending_review' | 'rejected';

export type LessonKind = 'video' | 'quiz';

export interface InstructorLesson {
  id: string;
  title: string;
  kind: LessonKind;
  durationSeconds: number;
  order: number;
}

export interface InstructorModule {
  id: string;
  title: string;
  order: number;
  lessons: InstructorLesson[];
}

export interface InstructorCourse {
  id: string;
  slug: string;
  title: string;
  status: CourseStatus;
  thumbnail: string | null;
  /** EGP — kept as number on the mock side; production uses string. */
  price: number;
  studentsCount: number;
  rating: number;
  reviewsCount: number;
  totalLessons: number;
  /** Total duration in minutes. */
  totalDurationMinutes: number;
  /** Average lesson-completion across all enrolled students (0..100). */
  completionPercent: number;
  /** Lifetime earnings on this course (EGP). */
  earnings: number;
  earningsThisMonth: number;
  viewsThisMonth: number;
  createdAt: string;
  lastEditedAt: string;
  /** Admin note when status === 'rejected'. */
  rejectionReason: string | null;
  modules: InstructorModule[];
}

export interface InstructorEnrollmentEvent {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  pricePaid: number;
}

export interface InstructorReview {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  courseId: string;
  courseTitle: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}

export interface InstructorQuestion {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  askedAt: string;
  answered: boolean;
}

export interface EarningsMonth {
  /** ISO month e.g. "2026-04" — the chart formats it for display. */
  month: string;
  amount: number;
}

export interface PayoutRecord {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
  /** Method label rendered as-is. */
  method: string;
  date: string;
}

export interface InstructorStudent {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  totalSpent: number;
  joinedAt: string;
  /** Aggregate progress across all the instructor's courses they're in (0..100). */
  averageProgress: number;
}

/* ============================== API DTOs ==============================
 * Shapes returned by the live API. Distinct from the fixture types above
 * because the API normalizes monies as strings and uses different keys
 * (e.g. `monthIso` vs the fixture's `month`). When more endpoints land,
 * keep adding them in this section.
 */

export interface DashboardKpis {
  averageRating: number;
  reviewsCount: number;
  pendingQuestionsCount: number;
  /** EGP as decimal string. */
  thisMonthEarnings: string;
  lastMonthEarnings: string;
  /** Signed integer; null when last month was zero (avoid +∞%). */
  earningsPercentChange: number | null;
  activeStudents: number;
  /** ISO 4217 code, currently "EGP". */
  currency: string;
}

export interface DashboardEarningsPoint {
  /** Full ISO timestamp at month-start (UTC). */
  monthIso: string;
  /** EGP as decimal string. */
  amount: string;
}

export interface DashboardTopCourse {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  studentsCount: number;
  /** Null for courses with zero enrollments — render an empty state. */
  completionPercent: number | null;
  /** Number on this endpoint, even though the catalog returns it as string. */
  rating: number;
}

export type DashboardActivityType = 'enrollment' | 'review';

export interface DashboardActivity {
  type: DashboardActivityType;
  studentName: string;
  courseId: string;
  courseTitle: string;
  /** EGP as string when type === 'enrollment'; null otherwise. */
  amount: string | null;
  /** 1..5 when type === 'review'; null otherwise. */
  rating: number | null;
  createdAt: string;
}

export interface DashboardPendingQuestion {
  id: string;
  text: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  createdAt: string;
}

export interface DashboardStatusCounts {
  draft: number;
  /** camelCase on the wire; the UI maps to the snake_case CourseStatus enum. */
  pendingReview: number;
  published: number;
  rejected: number;
}

export interface InstructorDashboard {
  kpis: DashboardKpis;
  earningsSeries: DashboardEarningsPoint[];
  totalEarningsLast6Months: string;
  topCourses: DashboardTopCourse[];
  recentActivity: DashboardActivity[];
  pendingQuestions: DashboardPendingQuestion[];
  statusCounts: DashboardStatusCounts;
}

/* ============================== /me/instructor/courses ==============================
 * The instructor's private view of their own courses across every lifecycle
 * state. Distinct from the public `Course` shape on the catalog endpoint —
 * adds `totalEarnings`, `adminNote`, plus the workflow timestamps.
 */

export interface InstructorCourseListItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  status: CourseStatus;
  totalLessons: number;
  durationMinutes: number;
  /** EGP, decimal string. */
  price: string;
  currency: string;
  studentsCount: number;
  /** All-time, post-revenue-share. Decimal string. Retroactive: changes when
   *  the platform fee setting changes. */
  totalEarnings: string;
  /** Number on this endpoint, even though catalog `Course.rating` is string. */
  rating: number;
  reviewsCount: number;
  updatedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  /** Admin's reason when status === 'rejected'. */
  adminNote: string | null;
}

/** Always reflects the FULL set, not the filtered page — chip counts stay
 *  stable as the user types into search. */
export interface InstructorCoursesStatusCounts {
  all: number;
  draft: number;
  pendingReview: number;
  published: number;
  rejected: number;
}

export interface InstructorCoursesResponse {
  data: InstructorCourseListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statusCounts: InstructorCoursesStatusCounts;
}

export interface InstructorCoursesQuery {
  status?: CourseStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/* ============================== /me/instructor/courses/:slug ==============================
 * Full course detail used by every tab on the editor page. Mostly mirrors the
 * public `Course` shape but `rating` comes back as a number on this endpoint
 * (the dashboard / instructor responses break the catalog's string-rating
 * convention — keep them typed separately so neither side hides the other).
 */

interface InstructorCourseCategoryRef {
  id: string;
  slug: string;
  name: string;
}

interface InstructorCourseInstructorRef {
  id: string;
  name: string;
  avatar: string | null;
  instructorProfile: {
    rating: number;
    studentsCount: number;
  } | null;
}

export interface InstructorCourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string | null;
  badge: string | null;
  whatYouWillLearn: string[];
  prerequisites: string[];
  features: string[];
  /** EGP, decimal string (consistent with the rest of the API). */
  price: string;
  originalPrice: string | null;
  /** Number on the instructor endpoint. Catalog `Course.rating` is string. */
  rating: number;
  studentsCount: number;
  reviewsCount: number;
  durationMinutes: number;
  totalLessons: number;
  status: CourseStatus;
  submittedAt: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  adminNote: string | null;
  categoryId: string;
  instructorId: string;
  category: InstructorCourseCategoryRef;
  instructor: InstructorCourseInstructorRef;
  createdAt: string;
  updatedAt: string;
}

/** Subset accepted by `PATCH /courses/:id`. Server-managed fields (status,
 *  rating, studentsCount, etc.) are intentionally absent. */
export interface UpdateCourseInput {
  title?: string;
  description?: string;
  longDescription?: string;
  thumbnail?: string;
  badge?: string | null;
  whatYouWillLearn?: string[];
  prerequisites?: string[];
  features?: string[];
  price?: string;
  originalPrice?: string | null;
  categoryId?: string;
}

/* ============================== Curriculum ==============================
 * Same shape as the public curriculum endpoint but exposed under the owner-
 * only `/me/instructor/...` route so drafts come through too.
 */

export interface InstructorCurriculumLesson {
  id: string;
  title: string;
  type: 'video' | 'quiz';
  order: number;
  durationSeconds: number;
  isPreview: boolean;
  moduleId: string;
}

export interface InstructorCurriculumModule {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  courseId: string;
  lessons: InstructorCurriculumLesson[];
  createdAt: string;
  updatedAt: string;
}

/* ============================== Thumbnail upload ============================== */

export interface ThumbnailUploadResult {
  /** Public CDN URL — drop directly into <img src>. */
  thumbnail: string;
}

/* ============================== Lesson video upload (TUS / Bunny) ============================== */

/**
 * Response from `POST /lessons/:id/video/upload`. Contains everything the
 * `tus-js-client` upload needs to push the file straight to Bunny — the
 * Bunny API key never reaches the browser, only this signed per-video
 * envelope (default 1 hour TTL).
 */
export interface VideoUploadCredentials {
  /** Always `https://video.bunnycdn.com/tusupload` per Bunny's TUS server. */
  tusEndpoint: string;
  /** String form of the library id — sent as the `LibraryId` TUS header. */
  libraryId: string;
  /** Bunny GUID for the freshly-created (empty) video. */
  videoId: string;
  /** SHA256 signature, sent as `AuthorizationSignature` TUS header. */
  signature: string;
  /** Unix seconds. Sent as `AuthorizationExpire` TUS header. */
  expirationTime: number;
  /** Same moment as `expirationTime`, ISO format — for client-side TTL UI. */
  expiresAt: string;
  /** Echo of `videoId` under the lesson-side field name — already saved on the lesson. */
  bunnyVideoId: string;
}

export interface VideoStatusResult {
  bunnyVideoId: string;
  /** Raw Bunny status code. 0=queued, 1=processing, 2=encoding,
   *  3=finished, 4=resolution-finished, 5=failed. */
  status: number;
  statusLabel: string;
  /** True when status is finished or resolution-finished — frontend stops polling. */
  isReady: boolean;
  /** Bunny's reported video length. 0 while still encoding. */
  lengthSeconds: number;
  width: number;
  height: number;
  /** The DB value AFTER this poll's auto-sync. Equals `lengthSeconds` once ready. */
  lessonDurationSeconds: number;
  thumbnailUrl: string | null;
}

/* ============================== Curriculum mutations ============================== */

export interface CreateModuleInput {
  title: string;
  order?: number;
}

export interface UpdateModuleInput {
  title?: string;
  order?: number;
}

export interface CreateLessonInput {
  title: string;
  type?: 'video' | 'quiz';
  order?: number;
  durationSeconds?: number;
  bunnyVideoId?: string | null;
  thumbnailUrl?: string | null;
  transcript?: string | null;
  isPreview?: boolean;
}

/** All fields optional — partial update. Same shape as create. */
export type UpdateLessonInput = Partial<CreateLessonInput>;

/**
 * Bulk reorder body. The strict-set validation on the backend rejects any
 * payload that's missing or has extras vs. the server's view of the course.
 * Always build this from a fresh GET, never from stale local state.
 */
export interface ReorderCurriculumInput {
  modules: Array<{
    id: string;
    lessonIds: string[];
  }>;
}
