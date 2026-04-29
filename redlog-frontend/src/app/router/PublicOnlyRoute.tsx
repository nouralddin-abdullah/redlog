import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

/** Redirects already-authed users away from auth pages. */
export function PublicOnlyRoute() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
