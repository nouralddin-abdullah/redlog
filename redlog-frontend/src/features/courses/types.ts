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

export type LessonType = 'video' | 'file' | 'quiz';

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
