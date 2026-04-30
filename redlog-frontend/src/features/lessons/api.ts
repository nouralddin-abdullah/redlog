import { api, type ApiSuccess } from '@/shared/api/client';
import type { LessonDetail, LessonPlayback } from './types';

export const lessonsApi = {
  async get(id: string): Promise<LessonDetail> {
    const { data } = await api.get<ApiSuccess<LessonDetail>>(`/lessons/${id}`);
    return data.data;
  },

  async getPlayback(id: string): Promise<LessonPlayback> {
    const { data } = await api.get<ApiSuccess<LessonPlayback>>(
      `/lessons/${id}/playback`,
    );
    return data.data;
  },
};
