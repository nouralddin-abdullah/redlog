import { api, type ApiSuccess } from '@/shared/api/client';
import type { Category } from './types';

export const categoriesApi = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<ApiSuccess<Category[]>>('/categories');
    return data.data;
  },

  async get(slug: string): Promise<Category> {
    const { data } = await api.get<ApiSuccess<Category>>(`/categories/${slug}`);
    return data.data;
  },
};
