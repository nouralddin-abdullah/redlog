import type { Category } from '@/features/categories/types';
import { cn } from '@/shared/lib/cn';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string | null) => void;
  loading?: boolean;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
  loading,
}: CategoryFilterProps) {
  if (loading) {
    return (
      <div className="inline-flex w-fit gap-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white p-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-20 animate-pulse rounded-[8px] bg-[var(--color-surface-muted)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white p-1">
      <Pill label="الكل" active={selectedId === null} onClick={() => onSelect(null)} />
      {categories.map((cat) => (
        <Pill
          key={cat.id}
          label={cat.name}
          active={selectedId === cat.id}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-[8px] px-4 py-2 text-[14px] font-semibold transition-colors',
        active
          ? 'bg-[var(--color-brand-blue)] text-white'
          : 'bg-transparent text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)]',
      )}
    >
      {label}
    </button>
  );
}
