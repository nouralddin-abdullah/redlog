import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Search, Settings as SettingsIcon, User } from 'lucide-react';
import { useCurrentUser, useSignOut } from '@/features/auth/hooks';
import { Avatar } from '@/shared/components/ui/Avatar';
import { cn } from '@/shared/lib/cn';

export function Topbar() {
  const { data: user } = useCurrentUser();
  const signOut = useSignOut();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-[var(--color-line)] bg-white/95 px-6 backdrop-blur">
      <div className="relative w-full max-w-[460px]">
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[var(--color-ink-400)]"
          aria-hidden
        />
        <input
          type="search"
          placeholder="ابحث عن كورس، محاضر، أو موضوع..."
          className="input-base h-10 w-full ps-11 text-[14px]"
        />
      </div>

      <div className="ms-auto flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="الإشعارات"
            className="relative flex size-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-ink-600)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
          >
            <Bell className="size-[20px]" />
          </button>
          {notifOpen && (
            <div className="absolute end-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3 text-[14px] font-semibold">
                <span>الإشعارات</span>
              </div>
              <div className="px-6 py-10 text-center text-[13px] text-[var(--color-ink-500)]">
                لا توجد إشعارات جديدة
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-[var(--radius-md)] p-1 pe-2 transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <Avatar name={user?.name} src={user?.avatar} size={36} />
            <div className="hidden text-start sm:block">
              <div className="text-[13px] font-semibold leading-tight text-[var(--color-ink-900)]">
                {user?.name ?? '...'}
              </div>
              <div className="text-[11.5px] leading-tight text-[var(--color-ink-500)]">
                {user ? roleLabel(user.role) : ''}
              </div>
            </div>
            <ChevronDown className="size-4 text-[var(--color-ink-400)]" aria-hidden />
          </button>

          {profileOpen && (
            <div className="absolute end-0 top-[calc(100%+8px)] z-50 min-w-[240px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-lg">
              <div className="border-b border-[var(--color-line)] px-4 py-3.5">
                <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                  {user?.name ?? '...'}
                </div>
                <div className="mt-0.5 truncate text-[12.5px] text-[var(--color-ink-500)]">
                  {user?.email ?? ''}
                </div>
              </div>
              <div className="p-1.5">
                <DropdownItem icon={User} onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                  الملف الشخصي
                </DropdownItem>
                <DropdownItem icon={SettingsIcon} onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
                  الإعدادات والأجهزة
                </DropdownItem>
                <div className="my-1 h-px bg-[var(--color-line)]" />
                <DropdownItem icon={LogOut} tone="danger" onClick={signOut}>
                  تسجيل الخروج
                </DropdownItem>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  children,
  onClick,
  tone,
}: {
  icon: LucideIconLike;
  children: string;
  onClick: () => void;
  tone?: 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-[14px] font-medium transition-colors',
        tone === 'danger'
          ? 'text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]'
          : 'text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]',
      )}
    >
      <Icon className="size-[18px]" aria-hidden />
      <span>{children}</span>
    </button>
  );
}

type LucideIconLike = (props: { className?: string; 'aria-hidden'?: boolean }) => React.ReactNode;

function roleLabel(role: string): string {
  switch (role) {
    case 'instructor':
      return 'محاضر';
    case 'admin':
      return 'مشرف';
    default:
      return 'طالب أشعة';
  }
}
