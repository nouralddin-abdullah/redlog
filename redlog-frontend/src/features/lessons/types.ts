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

/**
 * Lesson attachment — see `lesson-attachments-api.md`. Embedded on
 * `LessonDetail.attachments` and also returned by the dedicated list /
 * upload / rename / delete endpoints under `/lessons/:lessonId/attachments`
 * + `/lesson-attachments/:id`.
 *
 * `fileSizeBytes` may come back as a JSON string (TypeORM returns Postgres
 * `bigint` as string). Always coerce with `Number(...)` before formatting.
 */
export interface LessonAttachment {
  id: string;
  title: string;
  /** Public, permanent CDN URL — drop directly into `<a href>`. */
  fileUrl: string;
  mimeType: string;
  /** May be string (bigint) or number — coerce with `Number(...)`. */
  fileSizeBytes: number | string;
  createdAt: string;
}

/** Response from GET /api/lessons/:id/playback. */
export interface LessonPlayback {
  embedUrl: string;
  expiresAt: string;
}
