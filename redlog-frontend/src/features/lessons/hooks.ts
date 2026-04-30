import { useQuery } from '@tanstack/react-query';
import { lessonsApi } from './api';

export const lessonsKeys = {
  all: ['lessons'] as const,
  detail: (id: string) => ['lessons', 'detail', id] as const,
  playback: (id: string) => ['lessons', 'playback', id] as const,
};

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: lessonsKeys.detail(id ?? ''),
    queryFn: () => lessonsApi.get(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

interface UsePlaybackArgs {
  id: string | undefined;
  /** Caller controls when to mint a playback URL — typically only for video lessons. */
  enabled?: boolean;
}

/**
 * Mints a signed Bunny embed URL. Tokens are short-lived (~1h), so we keep
 * cache short and refresh on focus to avoid serving an expired URL after a
 * long pause.
 */
export function useLessonPlayback({ id, enabled = true }: UsePlaybackArgs) {
  return useQuery({
    queryKey: lessonsKeys.playback(id ?? ''),
    queryFn: () => lessonsApi.getPlayback(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 30 * 60_000, // 30 minutes — well under the typical token lifetime
    refetchOnWindowFocus: true,
  });
}
