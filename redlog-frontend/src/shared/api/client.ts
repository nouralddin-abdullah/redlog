import axios, { AxiosError, type AxiosInstance } from 'axios';
import { env } from '@/shared/config/env';
import { tokenStorage } from '@/shared/lib/storage';

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Normalised error surfaced to the UI layer. We always rethrow this shape from
 * the response interceptor so feature code never has to dig through Axios.
 */
export class HttpError extends Error {
  status: number;
  payload: ApiError | undefined;

  constructor(status: number, message: string, payload?: ApiError) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const message =
      payload?.message ??
      (status === 0 ? 'تعذّر الاتصال بالخادم. تأكد من الاتصال بالإنترنت.' : error.message);

    if (status === 401) {
      tokenStorage.clear();
    }

    return Promise.reject(new HttpError(status, message, payload));
  },
);
