import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from './api';

export const categoriesKeys = {
  all: ['categories'] as const,
  detail: (slug: string) => ['categories', slug] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: categoriesApi.list,
    staleTime: 10 * 60_000,
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    queryKey: categoriesKeys.detail(slug ?? ''),
    queryFn: () => categoriesApi.get(slug!),
    enabled: Boolean(slug),
    staleTime: 10 * 60_000,
  });
}
