import { api, type ApiSuccess } from '@/shared/api/client';
import type { Enrollment } from './types';

export const enrollmentsApi = {
  async listMine(): Promise<Enrollment[]> {
    const { data } = await api.get<ApiSuccess<Enrollment[]>>('/me/enrollments');
    return data.data;
  },
};
