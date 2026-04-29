import { useState } from 'react';
import { Inbox } from 'lucide-react';
import { useCategories } from '@/features/categories/hooks';
import { useCourses } from '@/features/courses/hooks';
import { CategoryFilter } from '@/features/courses/components/CategoryFilter';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';

export function BrowseCoursesPage() {
  const categoriesQuery = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const coursesQuery = useCourses({
    page: 1,
    limit: 24,
    sortBy: 'createdAt',
    order: 'desc',
    ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
  });

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          استكشف الكورسات
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          اكتشف كورسات جديدة من نخبة المحاضرين في تخصصات الأشعة المختلفة
        </p>
      </header>

      <div className="mb-6">
        {categoriesQuery.error ? (
          <Alert tone="warning">
            تعذّر تحميل التصنيفات
            {categoriesQuery.error instanceof HttpError
              ? ` — ${categoriesQuery.error.message}`
              : ''}
          </Alert>
        ) : (
          <CategoryFilter
            categories={categoriesQuery.data ?? []}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            loading={categoriesQuery.isLoading}
          />
        )}
      </div>

      {coursesQuery.error ? (
        <Alert tone="danger">
          تعذّر تحميل الكورسات
          {coursesQuery.error instanceof HttpError
            ? ` — ${coursesQuery.error.message}`
            : ''}
        </Alert>
      ) : coursesQuery.isLoading ? (
        <CardGridSkeleton />
      ) : !coursesQuery.data?.items.length ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {coursesQuery.data.items.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
        >
          <div className="h-[140px] animate-pulse bg-[var(--color-surface-muted)]" />
          <div className="space-y-2 p-[18px]">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-400)]">
        <Inbox className="size-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-[var(--color-ink-800)]">
        لا توجد كورسات
      </h3>
      <p className="mt-1 text-[13.5px] text-[var(--color-ink-500)]">
        جرب تصنيفاً مختلفاً.
      </p>
    </div>
  );
}
