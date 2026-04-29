import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from './api';
import { useAuthStore } from './store';
import type { SignInInput, SignUpInput } from './schemas';

const ME_KEY = ['auth', 'me'] as const;

export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ME_KEY,
    queryFn: authApi.me,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });
}

export function useSignIn() {
  const setToken = useAuthStore((s) => s.setToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<SignInInput, 'email' | 'password'>) => authApi.signIn(input),
    onSuccess: (session) => {
      setToken(session.accessToken);
      void qc.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

export function useSignUp() {
  const setToken = useAuthStore((s) => s.setToken);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SignUpInput) => authApi.signUp(input),
    onSuccess: (session) => {
      setToken(session.accessToken);
      void qc.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

export function useSignOut() {
  const clear = useAuthStore((s) => s.clear);
  const qc = useQueryClient();
  return () => {
    clear();
    qc.clear();
  };
}
