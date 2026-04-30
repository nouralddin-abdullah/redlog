import { api, type ApiSuccess } from '@/shared/api/client';
import type { LessonAttachment } from './types';

export const attachmentsApi = {
  async list(lessonId: string): Promise<LessonAttachment[]> {
    const { data } = await api.get<ApiSuccess<LessonAttachment[]>>(
      `/lessons/${lessonId}/attachments`,
    );
    return data.data;
  },
};
