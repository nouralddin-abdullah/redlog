import { create } from 'zustand';
import { tokenStorage } from '@/shared/lib/storage';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: tokenStorage.get(),
  setToken: (token) => {
    tokenStorage.set(token);
    set({ token });
  },
  clear: () => {
    tokenStorage.clear();
    set({ token: null });
  },
}));
