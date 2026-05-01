import { Bell, Search } from 'lucide-react';

import { Avatar } from '@/shared/components/ui/Avatar';
import { useCurrentUser } from '@/features/auth/hooks';

/**
 * Instructor topbar. Binds the avatar block to the live user record so an
 * instructor sees their actual name + role label here. The role-switching
 * affordance lives in the sidebar (mirroring the learner "مساحة المحاضر"
 * card position) so both surfaces are symmetric.
 */
export function InstructorTopbar() {
  const { data: user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[var(--color-line)] bg-white/95 px-6 backdrop-blur">
      <div className="relative w-full max-w-[460px]">
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[var(--color-ink-400)]"
          aria-hidden
        />
        <input
          type="search"
          placeholder="ابحث في كورساتك أو طلابك..."
          className="input-base h-10 w-full ps-11 text-[14px]"
        />
      </div>

      <div className="ms-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="الإشعارات"
          className="relative flex size-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-600)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
        >
          <Bell className="size-[20px]" />
          <span className="absolute end-2 top-2 size-2 rounded-full bg-[var(--color-danger)] ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] p-1 pe-2">
          <Avatar
            name={user?.name ?? '...'}
            src={user?.avatar}
            size={36}
          />
          <div className="hidden text-start sm:block">
            <div className="text-[13px] font-semibold leading-tight text-[var(--color-ink-900)]">
              {user?.name ?? '...'}
            </div>
            <div className="text-[11.5px] leading-tight text-[var(--color-ink-500)]">
              {user ? roleLabel(user.role) : ''}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function roleLabel(role: string): string {
  switch (role) {
    case 'instructor':
      return 'محاضر';
    case 'admin':
      return 'مشرف';
    default:
      return 'طالب';
  }
}
