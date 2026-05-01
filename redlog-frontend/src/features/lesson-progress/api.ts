import { api, type ApiSuccess } from '@/shared/api/client';
import type { CourseProgress, LessonCompletionResult } from './types';

export const lessonProgressApi = {
  async markComplete(lessonId: string): Promise<LessonCompletionResult> {
    const { data } = await api.post<ApiSuccess<LessonCompletionResult>>(
      `/lessons/${lessonId}/complete`,
    );
    return data.data;
  },

  async unmarkComplete(lessonId: string): Promise<LessonCompletionResult> {
    const { data } = await api.delete<ApiSuccess<LessonCompletionResult>>(
      `/lessons/${lessonId}/complete`,
    );
    return data.data;
  },

  async getCourseProgress(slug: string): Promise<CourseProgress> {
    const { data } = await api.get<ApiSuccess<CourseProgress>>(
      `/courses/${slug}/progress`,
    );
    return data.data;
  },
};
