import { api, type ApiSuccess } from '@/shared/api/client';
import type {
  Course,
  CourseModule,
  CoursesListResponse,
  ListCoursesParams,
  PaginationMeta,
} from './types';

interface RawListResponse {
  data: Course[];
  meta: PaginationMeta;
}

export const coursesApi = {
  async list(params: ListCoursesParams = {}): Promise<CoursesListResponse> {
    const { data } = await api.get<ApiSuccess<Course[]> & RawListResponse>(
      '/courses',
      { params },
    );
    return { items: data.data, meta: data.meta };
  },

  async getBySlug(slug: string): Promise<Course> {
    const { data } = await api.get<ApiSuccess<Course>>(`/courses/${slug}`);
    return data.data;
  },

  async getCurriculum(slug: string): Promise<CourseModule[]> {
    const { data } = await api.get<ApiSuccess<CourseModule[]>>(
      `/courses/${slug}/curriculum`,
    );
    return data.data;
  },
};
