const TOKEN_KEY = 'redlog.access_token';

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* swallow — Safari private mode */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* swallow */
    }
  },
};
