import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { coursesApi } from './api';
import type { ListCoursesParams } from './types';

export const coursesKeys = {
  all: ['courses'] as const,
  list: (params: ListCoursesParams) => ['courses', 'list', params] as const,
  detail: (slug: string) => ['courses', 'detail', slug] as const,
  curriculum: (slug: string) => ['courses', 'curriculum', slug] as const,
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
