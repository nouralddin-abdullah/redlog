import type { Category } from '@/features/categories/types';

export interface CourseInstructorProfile {
  userId: string;
  bio: string | null;
  specialty: string | null;
  university: string | null;
  rating: string;
  studentsCount: number;
  coursesCount: number;
}

export interface CourseInstructor {
  id: string;
  name: string;
  avatar: string | null;
  instructorProfile: CourseInstructorProfile | null;
}

export interface Course {
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
  /** API stores money + ratings as strings — keep as strings, parse at the edge. */
  price: string;
  originalPrice: string | null;
  rating: string;
  studentsCount: number;
  reviewsCount: number;
  durationMinutes: number;
  totalLessons: number;
  isPublished: boolean;
  publishedAt: string;
  categoryId: string;
  instructorId: string;
  category: Category;
  instructor: CourseInstructor;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CoursesListResponse {
  items: Course[];
  meta: PaginationMeta;
}

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'studentsCount' | 'title';
  order?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  instructorId?: string;
}

export type LessonType = 'video' | 'quiz';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  order: number;
  durationSeconds: number;
  isPreview: boolean;
  moduleId: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  durationMinutes: number;
  courseId: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

/* ===================== Reviews ===================== */

export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  courseId: string;
  user: ReviewUser;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsListResponse {
  items: Review[];
  meta: PaginationMeta;
}

export interface ListReviewsParams {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
  rating?: StarRating;
}

export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
}

export interface CreateReviewInput {
  rating: StarRating;
  comment: string | null;
}

/* ===================== Access ===================== */

export type AccessState = 'NONE' | 'PENDING' | 'REJECTED' | 'ENROLLED';

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected';

/** Full shape — returned by POST /courses/:id/payment-requests and admin endpoints. */
export interface PaymentRequest {
  id: string;
  userId: string;
  courseId: string;
  amount: string;
  senderPhoneNumber: string;
  screenshotUrl: string;
  status: PaymentRequestStatus;
  adminNote: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Subset embedded in GET /courses/:slug/access — no userId/courseId/reviewedByUserId/updatedAt. */
export type PaymentRequestSummary = Pick<
  PaymentRequest,
  | 'id'
  | 'status'
  | 'amount'
  | 'senderPhoneNumber'
  | 'screenshotUrl'
  | 'adminNote'
  | 'createdAt'
  | 'reviewedAt'
>;

export interface CourseAccess {
  state: AccessState;
  paymentRequest: PaymentRequestSummary | null;
  /** Enrollment record when state is ENROLLED. Shape pending — keep as unknown. */
  enrollment: unknown | null;
}

/* ===================== Manual payment ===================== */

export interface PaymentInfo {
  recipientPhone: string;
  amount: string;
  currency: string;
  instructions: string;
}

export interface CreatePaymentRequestInput {
  senderPhoneNumber: string;
  screenshot: File;
}
