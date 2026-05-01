import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from './api';

export const certificatesKeys = {
  all: ['certificates'] as const,
  mine: () => ['certificates', 'mine'] as const,
  detail: (id: string) => ['certificates', 'detail', id] as const,
  verify: (code: string) => ['certificates', 'verify', code] as const,
};

export function useMyCertificates(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: certificatesKeys.mine(),
    queryFn: () => certificatesApi.listMine(),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60_000,
  });
}

export function useCertificate(id: string | undefined) {
  return useQuery({
    queryKey: certificatesKeys.detail(id ?? ''),
    queryFn: () => certificatesApi.getMine(id!),
    enabled: Boolean(id),
    // Snapshot fields never change after issue — this can stay fresh for a
    // long time. The live `course.thumbnail` updating mid-session is fine
    // (next visit picks it up).
    staleTime: 60 * 60_000,
  });
}

/**
 * Public verify hook — usable without authentication. Treats 404 as "not
 * found" in the UI rather than a hard error; consumers should branch on the
 * query state to render the invalid case.
 */
export function useVerifyCertificate(code: string | undefined) {
  return useQuery({
    queryKey: certificatesKeys.verify(code ?? ''),
    queryFn: () => certificatesApi.verify(code!),
    enabled: Boolean(code),
    retry: false,
    staleTime: 60 * 60_000,
  });
}
