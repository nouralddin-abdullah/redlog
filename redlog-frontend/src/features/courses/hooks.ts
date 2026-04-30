import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { coursesApi } from './api';
import type {
  CreatePaymentRequestInput,
  CreateReviewInput,
  ListCoursesParams,
  ListReviewsParams,
  StarRating,
} from './types';

export const coursesKeys = {
  all: ['courses'] as const,
  list: (params: ListCoursesParams) => ['courses', 'list', params] as const,
  detail: (slug: string) => ['courses', 'detail', slug] as const,
  curriculum: (slug: string) => ['courses', 'curriculum', slug] as const,
  access: (slug: string) => ['courses', 'access', slug] as const,
  reviewsSummary: (slug: string) => ['courses', 'reviews-summary', slug] as const,
  reviews: (slug: string, rating: StarRating | undefined) =>
    ['courses', 'reviews', slug, { rating: rating ?? null }] as const,
  reviewsForCourse: (slug: string) => ['courses', 'reviews', slug] as const,
  myReview: (slug: string) => ['courses', 'my-review', slug] as const,
  paymentInfo: (slug: string) => ['courses', 'payment-info', slug] as const,
};

export function useCourses(params: ListCoursesParams = {}) {
  return useQuery({
    queryKey: coursesKeys.list(params),
    queryFn: () => coursesApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useCourse(slug: string | undefined) {
  return useQuery({
    queryKey: coursesKeys.detail(slug ?? ''),
    queryFn: () => coursesApi.getBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useCurriculum(slug: string | undefined) {
  return useQuery({
    queryKey: coursesKeys.curriculum(slug ?? ''),
    queryFn: () => coursesApi.getCurriculum(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useCourseAccess(slug: string | undefined) {
  return useQuery({
    queryKey: coursesKeys.access(slug ?? ''),
    queryFn: () => coursesApi.getAccess(slug!),
    enabled: Boolean(slug),
    staleTime: 30_000,
  });
}

export function useReviewsSummary(slug: string | undefined) {
  return useQuery({
    queryKey: coursesKeys.reviewsSummary(slug ?? ''),
    queryFn: () => coursesApi.getReviewsSummary(slug!),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useMyReview(slug: string | undefined) {
  return useQuery({
    queryKey: coursesKeys.myReview(slug ?? ''),
    queryFn: () => coursesApi.getMyReview(slug!),
    enabled: Boolean(slug),
    staleTime: 30_000,
  });
}

interface UseReviewsArgs {
  slug: string | undefined;
  rating?: StarRating;
  pageSize?: number;
}

export function useReviewsInfinite({
  slug,
  rating,
  pageSize = 10,
}: UseReviewsArgs) {
  return useInfiniteQuery({
    queryKey: coursesKeys.reviews(slug ?? '', rating),
    enabled: Boolean(slug),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params: ListReviewsParams = {
        page: pageParam,
        limit: pageSize,
        order: 'desc',
        ...(rating ? { rating } : {}),
      };
      return coursesApi.listReviews(slug!, params);
    },
    getNextPageParam: (last) =>
      last.meta.hasNextPage ? last.meta.currentPage + 1 : undefined,
    staleTime: 30_000,
  });
}

function invalidateReviews(qc: ReturnType<typeof useQueryClient>, slug: string) {
  void qc.invalidateQueries({ queryKey: coursesKeys.reviewsForCourse(slug) });
  void qc.invalidateQueries({ queryKey: coursesKeys.reviewsSummary(slug) });
  void qc.invalidateQueries({ queryKey: coursesKeys.myReview(slug) });
  void qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });
}

export function useCreateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => coursesApi.createReview(slug, input),
    onSuccess: () => invalidateReviews(qc, slug),
  });
}

export function useUpdateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateReviewInput }) =>
      coursesApi.updateReview(id, input),
    onSuccess: () => invalidateReviews(qc, slug),
  });
}

export function useDeleteReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteReview(id),
    onSuccess: () => invalidateReviews(qc, slug),
  });
}

export function usePaymentInfo(slug: string | undefined) {
  return useQuery({
    queryKey: coursesKeys.paymentInfo(slug ?? ''),
    queryFn: () => coursesApi.getPaymentInfo(slug!),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useSubmitPaymentRequest(courseId: string, slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentRequestInput) =>
      coursesApi.createPaymentRequest(courseId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: coursesKeys.access(slug) });
    },
  });
}
