import { Link, NavLink } from 'react-router-dom';
import {
  Award,
  GraduationCap,
  LayoutDashboard,
  Compass,
  PlayCircle,
  Users,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/shared/components/branding/Logo';
import { useCurrentUser } from '@/features/auth/hooks';
import { cn } from '@/shared/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const PRIMARY: NavItem[] = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/courses', label: 'استكشف الكورسات', icon: Compass },
  { to: '/my-courses', label: 'كورساتي', icon: PlayCircle },
  { to: '/certificates', label: 'شهاداتي', icon: Award },
  { to: '/community', label: 'مجتمع الكورسات', icon: Users },
];

const SECONDARY: NavItem[] = [
  { to: '/settings', label: 'الإعدادات', icon: SettingsIcon },
];

export function Sidebar() {
  const { data: user } = useCurrentUser();
  const canAuthor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col overflow-y-auto border-s border-[var(--color-line)] bg-white lg:flex">
      <div className="flex items-center gap-2.5 border-b border-[var(--color-line)] px-5 py-[18px]">
        <Logo size={28} />
      </div>

      <nav className="flex-1 px-3 py-3">
        <SectionLabel>القائمة الرئيسية</SectionLabel>
        {PRIMARY.map((item) => (
          <Item key={item.to} item={item} />
        ))}

        <SectionLabel>الحساب</SectionLabel>
        {SECONDARY.map((item) => (
          <Item key={item.to} item={item} />
        ))}
      </nav>

      {/* Cross-link to the authoring area for instructors. Hidden for
          regular learners — they have nothing to author. */}
      {canAuthor && (
        <div className="border-t border-[var(--color-line)] p-4">
          <Link
            to="/instructor/dashboard"
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-blue-100)] bg-[var(--color-brand-blue-50)] p-3.5 transition-colors hover:bg-[var(--color-brand-blue-100)]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-blue)] text-white">
              <GraduationCap className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-[var(--color-brand-navy)]">
                مساحة المحاضر
              </div>
              <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-600)]">
                إدارة كورساتك وأرباحك
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="border-t border-[var(--color-line)] p-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-blue-50)] p-4 text-[13px]">
          <div className="font-semibold text-[var(--color-brand-blue-700)]">
            هل تحتاج مساعدة؟
          </div>
          <p className="mt-1 leading-relaxed text-[var(--color-ink-600)]">
            تواصل مع فريق الدعم الفني
          </p>
          <button
            type="button"
            className="btn-base mt-2.5 h-9 w-full rounded-[8px] bg-[var(--color-brand-blue-100)] px-3.5 text-[13px] text-[var(--color-brand-blue-700)] hover:bg-[#D6E4F2]"
          >
            تواصل معنا
          </button>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-400)]">
      {children}
    </div>
  );
}

function Item({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'mb-0.5 flex items-center gap-3 rounded-[var(--radius-md)] px-3.5 py-2.5 text-[14px] font-medium transition-colors',
          isActive
            ? 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)] font-semibold'
            : 'text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]',
        )
      }
    >
      <item.icon className="size-[19px] shrink-0" aria-hidden />
      <span>{item.label}</span>
    </NavLink>
  );
}
