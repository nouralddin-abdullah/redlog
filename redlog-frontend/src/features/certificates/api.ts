import { api, type ApiSuccess } from '@/shared/api/client';
import type { Certificate, CertificateVerifyResult } from './types';

export const certificatesApi = {
  async listMine(): Promise<Certificate[]> {
    const { data } = await api.get<ApiSuccess<Certificate[]>>(
      '/me/certificates',
    );
    return data.data;
  },

  async getMine(id: string): Promise<Certificate> {
    const { data } = await api.get<ApiSuccess<Certificate>>(
      `/me/certificates/${id}`,
    );
    return data.data;
  },

  /**
   * Public — no auth header required. Backend tolerates loose casing /
   * whitespace, but we trim defensively here too so the URL stays clean.
   */
  async verify(code: string): Promise<CertificateVerifyResult> {
    const trimmed = code.trim();
    const { data } = await api.get<ApiSuccess<CertificateVerifyResult>>(
      `/certificates/verify/${encodeURIComponent(trimmed)}`,
    );
    return data.data;
  },
};
