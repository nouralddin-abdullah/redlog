import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  Users,
  Wallet,
  Settings as SettingsIcon,
  PlusCircle,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/shared/components/branding/Logo';
import { cn } from '@/shared/lib/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

/**
 * Standalone instructor navigation. Distinct from the learner Sidebar — both
 * to make role-switching legible and so the two surfaces evolve independently.
 * The "إنشاء كورس" CTA is pinned at the top of the nav (separate from the
 * regular items) since it's the most common authoring entry point.
 */
const PRIMARY: NavItem[] = [
  { to: '/instructor/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/instructor/courses', label: 'كورساتي', icon: BookOpen },
  { to: '/instructor/students', label: 'الطلاب', icon: Users },
  { to: '/instructor/earnings', label: 'الأرباح', icon: Wallet },
];

const SECONDARY: NavItem[] = [
  { to: '/instructor/settings', label: 'الإعدادات', icon: SettingsIcon },
];

export function InstructorSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col overflow-y-auto border-s border-[var(--color-line)] bg-white lg:flex">
      <div className="flex flex-col gap-1.5 border-b border-[var(--color-line)] px-5 py-[18px]">
        <Logo size={28} />
        <div className="inline-flex w-fit items-center rounded-full border border-[var(--color-brand-blue-100)] bg-[var(--color-brand-blue-50)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[var(--color-brand-blue-700)]">
          مساحة المحاضر
        </div>
      </div>

      <div className="px-3 pt-3">
        <NavLink
          to="/instructor/courses/new"
          className="btn-base flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-navy)] px-4 text-[14px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-12px_rgba(14,42,71,0.65)] hover:bg-[var(--color-brand-navy-700)]"
        >
          <PlusCircle className="size-4" />
          إنشاء كورس
        </NavLink>
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

      {/* Cross-link to the learner area — same slot the learner sidebar
          uses for "مساحة المحاضر" so role-switching feels symmetric. */}
      <div className="border-t border-[var(--color-line)] p-4">
        <Link
          to="/courses"
          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-blue-100)] bg-[var(--color-brand-blue-50)] p-3.5 transition-colors hover:bg-[var(--color-brand-blue-100)]"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-blue)] text-white">
            <Compass className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-[var(--color-brand-navy)]">
              عرض كطالب
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-600)]">
              تصفح الكورسات على المنصة
            </div>
          </div>
        </Link>
      </div>

      <div className="border-t border-[var(--color-line)] p-4">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-4 text-[13px]">
          <div className="font-semibold text-[var(--color-ink-800)]">
            دليل المحاضر
          </div>
          <p className="mt-1 leading-relaxed text-[var(--color-ink-600)]">
            تعرف على معايير المراجعة وقواعد جودة الفيديو.
          </p>
          <button
            type="button"
            className="btn-base mt-2.5 h-9 w-full rounded-[8px] bg-white px-3.5 text-[13px] font-semibold text-[var(--color-ink-800)] ring-1 ring-[var(--color-line-strong)] hover:bg-[var(--color-surface-muted)]"
          >
            افتح الدليل
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
