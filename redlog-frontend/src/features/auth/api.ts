import { api, type ApiSuccess } from '@/shared/api/client';
import type { AuthSession, User } from './types';
import type { SignInInput, SignUpInput } from './schemas';

export const authApi = {
  async signIn(input: Pick<SignInInput, 'email' | 'password'>): Promise<AuthSession> {
    const { data } = await api.post<ApiSuccess<AuthSession>>('/users/signin', {
      email: input.email,
      password: input.password,
    });
    return data.data;
  },

  async signUp(input: SignUpInput): Promise<AuthSession> {
    const fd = new FormData();
    fd.append('email', input.email);
    fd.append('name', input.name);
    fd.append('password', input.password);
    if (input.country) fd.append('country', input.country);
    if (input.timezone) fd.append('timezone', input.timezone);
    if (input.avatar) fd.append('avatar', input.avatar);

    const { data } = await api.post<ApiSuccess<AuthSession>>('/users/signup', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiSuccess<User>>('/users/me');
    return data.data;
  },
};
