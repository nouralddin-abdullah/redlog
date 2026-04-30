import { api, type ApiSuccess } from '@/shared/api/client';
import type { CreateNoteInput, LessonNote, UpdateNoteInput } from './types';

export const notesApi = {
  async list(lessonId: string): Promise<LessonNote[]> {
    const { data } = await api.get<ApiSuccess<LessonNote[]>>(
      `/lessons/${lessonId}/notes`,
    );
    return data.data;
  },

  async create(lessonId: string, input: CreateNoteInput): Promise<LessonNote> {
    const { data } = await api.post<ApiSuccess<LessonNote>>(
      `/lessons/${lessonId}/notes`,
      input,
    );
    return data.data;
  },

  async update(id: string, input: UpdateNoteInput): Promise<LessonNote> {
    const { data } = await api.patch<ApiSuccess<LessonNote>>(
      `/lesson-notes/${id}`,
      input,
    );
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/lesson-notes/${id}`);
  },
};
