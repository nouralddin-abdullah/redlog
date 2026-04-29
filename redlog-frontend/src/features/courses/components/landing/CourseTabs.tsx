import { cn } from '@/shared/lib/cn';

export type LandingTabKey = 'overview' | 'curriculum' | 'instructor' | 'reviews';

const TABS: ReadonlyArray<{ key: LandingTabKey; label: string }> = [
  { key: 'overview', label: 'نظرة عامة' },
  { key: 'curriculum', label: 'محتوى الكورس' },
  { key: 'instructor', label: 'عن المحاضر' },
  { key: 'reviews', label: 'التقييمات' },
];

interface CourseTabsProps {
  value: LandingTabKey;
  onChange: (key: LandingTabKey) => void;
}

export function CourseTabs({ value, onChange }: CourseTabsProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-white">
      <div className="mx-auto flex max-w-[1280px] gap-1 px-8">
        {TABS.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cn(
                'border-b-[3px] px-5 py-4 text-[14px] font-semibold transition-colors',
                active
                  ? 'border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]'
                  : 'border-transparent text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)]',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
