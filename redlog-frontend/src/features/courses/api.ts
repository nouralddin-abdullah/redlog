import { api, type ApiSuccess } from '@/shared/api/client';
import type {
  Course,
  CourseAccess,
  CourseModule,
  CoursesListResponse,
  CreatePaymentRequestInput,
  CreateReviewInput,
  ListCoursesParams,
  ListReviewsParams,
  PaginationMeta,
  PaymentInfo,
  PaymentRequest,
  Review,
  ReviewSummary,
  ReviewsListResponse,
} from './types';

interface RawListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const coursesApi = {
  async list(params: ListCoursesParams = {}): Promise<CoursesListResponse> {
    const { data } = await api.get<ApiSuccess<Course[]> & RawListResponse<Course>>(
      '/courses',
      { params },
    );
    return { items: data.data, meta: data.meta };
  },

  async getBySlug(slug: string): Promise<Course> {
    const { data } = await api.get<ApiSuccess<Course>>(`/courses/${slug}`);
    return data.data;
  },

  async getCurriculum(slug: string): Promise<CourseModule[]> {
    const { data } = await api.get<ApiSuccess<CourseModule[]>>(
      `/courses/${slug}/curriculum`,
    );
    return data.data;
  },

  async getAccess(slug: string): Promise<CourseAccess> {
    const { data } = await api.get<ApiSuccess<CourseAccess>>(
      `/courses/${slug}/access`,
    );
    return data.data;
  },

  async getReviewsSummary(slug: string): Promise<ReviewSummary> {
    const { data } = await api.get<ApiSuccess<ReviewSummary>>(
      `/courses/${slug}/reviews/summary`,
    );
    return data.data;
  },

  async listReviews(
    slug: string,
    params: ListReviewsParams = {},
  ): Promise<ReviewsListResponse> {
    const { data } = await api.get<ApiSuccess<Review[]> & RawListResponse<Review>>(
      `/courses/${slug}/reviews`,
      { params },
    );
    return { items: data.data, meta: data.meta };
  },

  async getMyReview(slug: string): Promise<Review | null> {
    const { data } = await api.get<ApiSuccess<Review | null>>(
      `/courses/${slug}/reviews/me`,
    );
    return data.data;
  },

  async createReview(slug: string, input: CreateReviewInput): Promise<Review> {
    const { data } = await api.post<ApiSuccess<Review>>(
      `/courses/${slug}/reviews`,
      input,
    );
    return data.data;
  },

  async updateReview(id: string, input: CreateReviewInput): Promise<Review> {
    const { data } = await api.patch<ApiSuccess<Review>>(`/reviews/${id}`, input);
    return data.data;
  },

  async deleteReview(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`);
  },

  async getPaymentInfo(slug: string): Promise<PaymentInfo> {
    const { data } = await api.get<ApiSuccess<PaymentInfo>>(
      `/courses/${slug}/payment-info`,
    );
    return data.data;
  },

  async createPaymentRequest(
    courseId: string,
    input: CreatePaymentRequestInput,
  ): Promise<PaymentRequest> {
    const fd = new FormData();
    fd.append('senderPhoneNumber', input.senderPhoneNumber);
    fd.append('screenshot', input.screenshot);
    const { data } = await api.post<ApiSuccess<PaymentRequest>>(
      `/courses/${courseId}/payment-requests`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },
};
