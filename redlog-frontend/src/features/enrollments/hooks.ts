import { useQuery } from '@tanstack/react-query';
import { enrollmentsApi } from './api';

export const enrollmentsKeys = {
  all: ['enrollments'] as const,
  mine: () => ['enrollments', 'mine'] as const,
};

export function useMyEnrollments() {
  return useQuery({
    queryKey: enrollmentsKeys.mine(),
    queryFn: () => enrollmentsApi.listMine(),
    staleTime: 60_000,
  });
}
