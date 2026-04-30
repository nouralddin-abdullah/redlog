import type { LessonType } from '@/features/courses/types';

/**
 * Full lesson payload from GET /api/lessons/:id.
 * Extends the curriculum's `Lesson` shape with playback-related fields.
 */
export interface LessonDetail {
  id: string;
  title: string;
  type: LessonType;
  order: number;
  durationSeconds: number;
  isPreview: boolean;
  moduleId: string;

  /** Stored upload URL (rarely surfaced — playback uses signed embed instead). */
  videoUrl: string | null;
  /** Optional adaptive stream URL — alternative to Bunny embed. */
  streamUrl: string | null;
  /** Bunny Stream's per-video GUID. */
  bunnyVideoId: string | null;
  thumbnailUrl: string | null;
  transcript: string | null;
  /** Time-coded transcript cues (shape pending). */
  transcriptCues: unknown | null;
  attachments: LessonAttachment[];

  createdAt: string;
  updatedAt: string;
}

/** Shape pending — backend currently returns an empty array. */
export interface LessonAttachment {
  id?: string;
  name?: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

/** Response from GET /api/lessons/:id/playback. */
export interface LessonPlayback {
  embedUrl: string;
  expiresAt: string;
}
