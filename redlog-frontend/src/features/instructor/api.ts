import { api, type ApiSuccess } from '@/shared/api/client';
import type { Course } from '@/features/courses/types';
import type { LessonAttachment } from '@/features/lessons/types';
import type {
  CreateLessonInput,
  CreateModuleInput,
  InstructorCourseDetail,
  InstructorCoursesQuery,
  InstructorCoursesResponse,
  InstructorCurriculumLesson,
  InstructorCurriculumModule,
  InstructorDashboard,
  ReorderCurriculumInput,
  ThumbnailUploadResult,
  UpdateCourseInput,
  UpdateLessonInput,
  UpdateModuleInput,
  VideoStatusResult,
  VideoUploadCredentials,
} from './types';

export const instructorApi = {
  async getDashboard(): Promise<InstructorDashboard> {
    const { data } = await api.get<ApiSuccess<InstructorDashboard>>(
      '/me/instructor/dashboard',
    );
    return data.data;
  },

  async listCourses(
    params: InstructorCoursesQuery = {},
  ): Promise<InstructorCoursesResponse> {
    const { data } = await api.get<ApiSuccess<InstructorCoursesResponse>>(
      '/me/instructor/courses',
      { params },
    );
    return data.data;
  },

  async getCourse(slug: string): Promise<InstructorCourseDetail> {
    const { data } = await api.get<ApiSuccess<InstructorCourseDetail>>(
      `/me/instructor/courses/${slug}`,
    );
    return data.data;
  },

  async getCurriculum(slug: string): Promise<InstructorCurriculumModule[]> {
    const { data } = await api.get<ApiSuccess<InstructorCurriculumModule[]>>(
      `/me/instructor/courses/${slug}/curriculum`,
    );
    return data.data;
  },

  /** Partial update — only send the fields that changed. Server merges. */
  async updateCourse(
    courseId: string,
    body: UpdateCourseInput,
  ): Promise<Course> {
    const { data } = await api.patch<ApiSuccess<Course>>(
      `/courses/${courseId}`,
      body,
    );
    return data.data;
  },

  /**
   * Multipart thumbnail upload. The server stores the file, sets
   * `Course.thumbnail` to the resulting CDN URL, and returns that URL — no
   * follow-up PATCH needed. 5 MB max, JPG/PNG/GIF/WEBP only (per spec).
   */
  async uploadThumbnail(
    courseId: string,
    file: File,
  ): Promise<ThumbnailUploadResult> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post<ApiSuccess<ThumbnailUploadResult>>(
      `/courses/${courseId}/thumbnail`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  /**
   * draft | rejected → pending_review. Clears any prior `adminNote`.
   * Returns the updated CourseDTO.
   */
  async submitForReview(courseId: string): Promise<Course> {
    const { data } = await api.post<ApiSuccess<Course>>(
      `/courses/${courseId}/submit-for-review`,
    );
    return data.data;
  },

  /** published → draft. Preserves the original `publishedAt` stamp. */
  async unpublish(courseId: string): Promise<Course> {
    const { data } = await api.post<ApiSuccess<Course>>(
      `/courses/${courseId}/unpublish`,
    );
    return data.data;
  },

  /* ===== Curriculum mutations ===== */

  async createModule(
    courseId: string,
    body: CreateModuleInput,
  ): Promise<InstructorCurriculumModule> {
    const { data } = await api.post<ApiSuccess<InstructorCurriculumModule>>(
      `/courses/${courseId}/modules`,
      body,
    );
    return data.data;
  },

  async updateModule(
    moduleId: string,
    body: UpdateModuleInput,
  ): Promise<InstructorCurriculumModule> {
    const { data } = await api.patch<ApiSuccess<InstructorCurriculumModule>>(
      `/modules/${moduleId}`,
      body,
    );
    return data.data;
  },

  async deleteModule(moduleId: string): Promise<void> {
    await api.delete(`/modules/${moduleId}`);
  },

  async createLesson(
    moduleId: string,
    body: CreateLessonInput,
  ): Promise<InstructorCurriculumLesson> {
    const { data } = await api.post<ApiSuccess<InstructorCurriculumLesson>>(
      `/modules/${moduleId}/lessons`,
      body,
    );
    return data.data;
  },

  async updateLesson(
    lessonId: string,
    body: UpdateLessonInput,
  ): Promise<InstructorCurriculumLesson> {
    const { data } = await api.patch<ApiSuccess<InstructorCurriculumLesson>>(
      `/lessons/${lessonId}`,
      body,
    );
    return data.data;
  },

  async deleteLesson(lessonId: string): Promise<void> {
    await api.delete(`/lessons/${lessonId}`);
  },

  /**
   * Bulk reorder. Strict-set validation: the body MUST contain every module
   * and every non-deleted lesson exactly once. Always build from a fresh
   * snapshot — sending stale state will 400 with a structured missing/extra
   * payload. Atomic + idempotent server-side.
   */
  async reorderCurriculum(
    courseId: string,
    body: ReorderCurriculumInput,
  ): Promise<InstructorCurriculumModule[]> {
    const { data } = await api.put<ApiSuccess<InstructorCurriculumModule[]>>(
      `/courses/${courseId}/curriculum/order`,
      body,
    );
    return data.data;
  },

  /* ===== Lesson video upload (Bunny TUS) =====
   * Two-call flow: request signed creds, then the browser uploads directly
   * to Bunny via tus-js-client. Polled for encoding status afterwards.
   */

  async requestVideoUpload(
    lessonId: string,
  ): Promise<VideoUploadCredentials> {
    const { data } = await api.post<ApiSuccess<VideoUploadCredentials>>(
      `/lessons/${lessonId}/video/upload`,
    );
    return data.data;
  },

  async getVideoStatus(lessonId: string): Promise<VideoStatusResult> {
    const { data } = await api.get<ApiSuccess<VideoStatusResult>>(
      `/lessons/${lessonId}/video/status`,
    );
    return data.data;
  },

  /* ===== Lesson attachments ===== */

  async listAttachments(lessonId: string): Promise<LessonAttachment[]> {
    const { data } = await api.get<ApiSuccess<LessonAttachment[]>>(
      `/lessons/${lessonId}/attachments`,
    );
    return data.data;
  },

  /**
   * Multipart upload. Don't set `Content-Type` manually — axios picks the
   * boundary when given a `FormData` body. Per spec: 50 MB cap; allowlist
   * covers PDFs, Office docs, ZIPs, images, audio, plain text/CSV/Markdown.
   */
  async uploadAttachment(
    lessonId: string,
    file: File,
    title: string,
  ): Promise<LessonAttachment> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    const { data } = await api.post<ApiSuccess<LessonAttachment>>(
      `/lessons/${lessonId}/attachments`,
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  /** Rename only — the file blob itself is immutable. To replace, delete + re-upload. */
  async renameAttachment(
    attachmentId: string,
    title: string,
  ): Promise<LessonAttachment> {
    const { data } = await api.patch<ApiSuccess<LessonAttachment>>(
      `/lesson-attachments/${attachmentId}`,
      { title },
    );
    return data.data;
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/lesson-attachments/${attachmentId}`);
  },
};
