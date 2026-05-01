import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/hooks';

/**
 * Gates the /instructor/* tree to instructors and admins. A learner who
 * lands here (via a stale link or a typed URL) is bounced to their
 * catalog. The auth guard above this still requires a token — this layer
 * only enforces role.
 *
 * Loading state matches RoleHomeRedirect so cold-cache navigation doesn't
 * flash a redirect mid-fetch.
 */
export function InstructorRoute() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-soft)]">
        <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-brand-blue)]" />
      </div>
    );
  }

  const allowed = user?.role === 'instructor' || user?.role === 'admin';
  if (!allowed) {
    return <Navigate to="/courses" replace />;
  }

  return <Outlet />;
}
