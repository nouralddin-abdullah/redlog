import { api, type ApiSuccess } from '@/shared/api/client';
import type {
  CreateQuestionInput,
  CreateReplyInput,
  LessonQuestion,
  LikeResponse,
  QuestionReply,
  UpdateQuestionInput,
  UpdateReplyInput,
} from './types';

export const questionsApi = {
  /* ---------- questions ---------- */
  async list(lessonId: string): Promise<LessonQuestion[]> {
    const { data } = await api.get<ApiSuccess<LessonQuestion[]>>(
      `/lessons/${lessonId}/questions`,
    );
    return data.data;
  },
  async create(
    lessonId: string,
    input: CreateQuestionInput,
  ): Promise<LessonQuestion> {
    const { data } = await api.post<ApiSuccess<LessonQuestion>>(
      `/lessons/${lessonId}/questions`,
      input,
    );
    return data.data;
  },
  async update(id: string, input: UpdateQuestionInput): Promise<LessonQuestion> {
    const { data } = await api.patch<ApiSuccess<LessonQuestion>>(
      `/lesson-questions/${id}`,
      input,
    );
    return data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/lesson-questions/${id}`);
  },

  /* ---------- likes ---------- */
  async like(id: string): Promise<LikeResponse> {
    const { data } = await api.post<LikeResponse>(`/lesson-questions/${id}/like`);
    return data;
  },
  async unlike(id: string): Promise<LikeResponse> {
    const { data } = await api.delete<LikeResponse>(`/lesson-questions/${id}/like`);
    return data;
  },

  /* ---------- replies ---------- */
  async createReply(
    questionId: string,
    input: CreateReplyInput,
  ): Promise<QuestionReply> {
    const { data } = await api.post<ApiSuccess<QuestionReply>>(
      `/lesson-questions/${questionId}/replies`,
      input,
    );
    return data.data;
  },
  async updateReply(id: string, input: UpdateReplyInput): Promise<QuestionReply> {
    const { data } = await api.patch<ApiSuccess<QuestionReply>>(
      `/lesson-question-replies/${id}`,
      input,
    );
    return data.data;
  },
  async deleteReply(id: string): Promise<void> {
    await api.delete(`/lesson-question-replies/${id}`);
  },
};
