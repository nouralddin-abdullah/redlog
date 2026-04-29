export type Role = 'user' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  phoneNumber: string | null;
  name: string;
  avatar: string | null;
  onboarding: boolean;
  country: string | null;
  timezone: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}
