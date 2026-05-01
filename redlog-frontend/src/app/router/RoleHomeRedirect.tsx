import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/auth/hooks';

/**
 * Bare `/` route. Reads the current user's role and forwards them to the
 * matching home — instructors land in their authoring dashboard, everyone
 * else lands on the learner catalog. Loading is rendered as a tiny splash so
 * the redirect doesn't flash through the wrong route while `/users/me`
 * resolves.
 *
 * Both halves of the app are reachable cross-role:
 *   - learner → /instructor (gated by InstructorRoute, but still navigable)
 *   - instructor → /courses, /my-courses, /certificates, … (always allowed)
 * The redirect just sets the *default* landing; it doesn't restrict navigation.
 */
export function RoleHomeRedirect() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-soft)]">
        <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-brand-blue)]" />
      </div>
    );
  }

  const target =
    user?.role === 'instructor' || user?.role === 'admin'
      ? '/instructor/dashboard'
      : '/courses';
  return <Navigate to={target} replace />;
}
