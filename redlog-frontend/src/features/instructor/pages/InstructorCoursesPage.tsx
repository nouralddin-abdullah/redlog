import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
} from 'lucide-react';

import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { CourseStatusBadge } from '@/features/instructor/components/CourseStatusBadge';
import { useInstructorCourses } from '@/features/instructor/hooks';
import { useTweaks } from '@/features/instructor/tweaks-context';
import {
  formatCompact,
  formatEgp,
  formatTotalDuration,
  timeAgo,
} from '@/features/instructor/utils';
import type {
  CourseStatus,
  InstructorCourseListItem,
  InstructorCoursesStatusCounts,
} from '@/features/instructor/types';

const PAGE_LIMIT = 20;

export function InstructorCoursesPage() {
  const { tweaks } = useTweaks();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // 300ms debounce so we don't fire a request per keystroke. Also resets
  // pagination on every change — re-search shouldn't strand the user on
  // page 5 of a result set that no longer has 5 pages.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // Reset pagination when the status filter flips, same reasoning.
  useEffect(() => {
    setPage(1);
  }, [tweaks.courseStatusFilter]);

  const queryParams = useMemo(
    () => ({
      ...(tweaks.courseStatusFilter !== 'all'
        ? { status: tweaks.courseStatusFilter as CourseStatus }
        : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      page,
      limit: PAGE_LIMIT,
    }),
    [tweaks.courseStatusFilter, debouncedSearch, page],
  );

  const coursesQuery = useInstructorCourses(queryParams);
  const data = coursesQuery.data;

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
            كورساتي
          </h1>
          <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
            كل ما نشرته، والمسودات، وما هو بانتظار المراجعة.
          </p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="btn-base inline-flex h-11 items-center gap-2 rounded-[10px] bg-[var(--color-brand-navy)] px-5 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-12px_rgba(14,42,71,0.65)] hover:bg-[var(--color-brand-navy-700)]"
        >
          <PlusCircle className="size-4" />
          إنشاء كورس جديد
        </Link>
      </header>

      {/* === Filter bar ==================================================== */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-400)]"
            aria-hidden
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            placeholder="ابحث عن كورس..."
            className="input-base h-10 w-full ps-10 text-[14px]"
          />
        </div>
        <StatusChips counts={data?.statusCounts} />
      </div>

      {coursesQuery.error ? (
        <Alert tone="warning">
          تعذّر تحميل الكورسات
          {coursesQuery.error instanceof HttpError
            ? ` — ${coursesQuery.error.message}`
            : ''}
        </Alert>
      ) : coursesQuery.isLoading ? (
        <SkeletonTable />
      ) : !data || data.data.length === 0 ? (
        debouncedSearch || tweaks.courseStatusFilter !== 'all' ? (
          <NoMatchesState />
        ) : (
          <EmptyState />
        )
      ) : (
        <>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)]">
            <table className="w-full text-[13.5px]">
              <thead className="bg-[var(--color-surface-soft)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                <tr>
                  <th className="px-5 py-3 text-start">الكورس</th>
                  <th className="px-3 py-3 text-start">الحالة</th>
                  <th className="px-3 py-3 text-start">الطلاب</th>
                  <th className="px-3 py-3 text-start">السعر</th>
                  <th className="px-3 py-3 text-start">الأرباح</th>
                  <th className="px-3 py-3 text-start">آخر تعديل</th>
                  <th className="px-5 py-3 text-end" aria-label="إجراءات" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((c, i) => (
                  <CourseRow
                    key={c.id}
                    course={c}
                    bordered={i > 0}
                    hideMoney={tweaks.hideMoney || tweaks.zeroEarnings}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              onPage={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ============================== row ============================== */

function CourseRow({
  course: c,
  bordered,
  hideMoney,
}: {
  course: InstructorCourseListItem;
  bordered: boolean;
  hideMoney: boolean;
}) {
  return (
    <tr className={bordered ? 'border-t border-[var(--color-line)]' : ''}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <CourseThumb thumbnail={c.thumbnail} title={c.title} />
          <div className="min-w-0">
            <Link
              to={`/instructor/courses/${c.slug}`}
              className="line-clamp-1 font-semibold text-[var(--color-ink-900)] hover:text-[var(--color-brand-blue)]"
            >
              {c.title}
            </Link>
            <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-500)]">
              {c.totalLessons} درس · {formatTotalDuration(c.durationMinutes)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-1.5">
          <CourseStatusBadge status={c.status} />
          {c.status === 'rejected' && c.adminNote && (
            <span
              title={c.adminNote}
              className="inline-flex size-5 items-center justify-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
              aria-label="عرض ملاحظة المراجعة"
            >
              <AlertTriangle className="size-3" />
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-4 tabular-nums text-[var(--color-ink-800)]">
        {formatCompact(c.studentsCount)}
      </td>
      <td className="px-3 py-4 tabular-nums text-[var(--color-ink-800)]">
        {formatEgp(c.price)}
      </td>
      <td className="px-3 py-4 tabular-nums text-[var(--color-ink-800)]">
        {hideMoney ? '••••' : formatEgp(c.totalEarnings)}
      </td>
      <td className="px-3 py-4 text-[12.5px] text-[var(--color-ink-500)]">
        {timeAgo(c.updatedAt)}
      </td>
      <td className="px-5 py-4 text-end">
        <div className="inline-flex items-center gap-1">
          <Link
            to={`/instructor/courses/${c.slug}`}
            className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
            aria-label="تعديل"
          >
            <Pencil className="size-4" />
          </Link>
          <Link
            to={`/courses/${c.slug}`}
            className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
            aria-label="معاينة"
          >
            <Eye className="size-4" />
          </Link>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
            aria-label="المزيد"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================== filter chips ============================== */

function StatusChips({
  counts,
}: {
  counts: InstructorCoursesStatusCounts | undefined;
}) {
  const { tweaks, setTweak } = useTweaks();
  const items: Array<{
    value: typeof tweaks.courseStatusFilter;
    label: string;
    countKey: keyof InstructorCoursesStatusCounts;
  }> = [
    { value: 'all', label: 'الكل', countKey: 'all' },
    { value: 'published', label: 'منشور', countKey: 'published' },
    { value: 'draft', label: 'مسودة', countKey: 'draft' },
    { value: 'pending_review', label: 'قيد المراجعة', countKey: 'pendingReview' },
    { value: 'rejected', label: 'مرفوض', countKey: 'rejected' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it) => {
        const active = tweaks.courseStatusFilter === it.value;
        const count = counts?.[it.countKey];
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => setTweak('courseStatusFilter', it.value)}
            className={
              'inline-flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-[12.5px] font-semibold transition-colors ' +
              (active
                ? 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]'
                : 'text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)]')
            }
          >
            {it.label}
            {count !== undefined && (
              <span
                className={
                  'tabular-nums ' +
                  (active
                    ? 'text-[var(--color-brand-blue-700)]'
                    : 'text-[var(--color-ink-400)]')
                }
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================== pager ============================== */

function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={!canPrev}
        className="inline-flex h-9 items-center gap-1 rounded-[8px] px-3 text-[12.5px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-3.5" />
        السابق
      </button>
      <span className="px-3 text-[12.5px] text-[var(--color-ink-600)] tabular-nums">
        {page} من {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={!canNext}
        className="inline-flex h-9 items-center gap-1 rounded-[8px] px-3 text-[12.5px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:hover:bg-transparent"
      >
        التالي
        <ChevronLeft className="size-3.5" />
      </button>
    </div>
  );
}

/* ============================== thumb / states ============================== */

function CourseThumb({
  thumbnail,
  title,
}: {
  thumbnail: string | null;
  title: string;
}) {
  const initials = title.slice(0, 2);
  return (
    <div
      className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] text-white"
      style={{
        background:
          'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-navy) 100%)',
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <span className="font-display text-[14px] font-bold tracking-wide">
        {initials}
      </span>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={
            'flex items-center gap-4 px-5 py-4 ' +
            (i === 0 ? '' : 'border-t border-[var(--color-line)]')
          }
        >
          <div className="size-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]" />
          <div className="flex-1">
            <div className="mb-2 h-3.5 w-[60%] animate-pulse rounded bg-[var(--color-surface-muted)]" />
            <div className="h-2.5 w-[40%] animate-pulse rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoMatchesState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white px-6 py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
        <Search className="size-5" />
      </div>
      <h2 className="m-0 mb-1 text-[16px] font-bold text-[var(--color-ink-900)]">
        لا توجد نتائج مطابقة
      </h2>
      <p className="text-[13.5px] text-[var(--color-ink-500)]">
        جرّب كلمة بحث أخرى أو غيّر الفلتر.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
        <BookOpen className="size-6" />
      </div>
      <h2 className="m-0 mb-1.5 text-[18px] font-bold text-[var(--color-ink-900)]">
        لم تنشئ أي كورس بعد
      </h2>
      <p className="mb-5 max-w-[420px] text-[14px] text-[var(--color-ink-500)]">
        ابدأ بإنشاء كورسك الأول. ستحتاج لكتابة الوصف، رفع الفيديوهات، وضبط
        السعر قبل تقديمه للمراجعة.
      </p>
      <Link
        to="/instructor/courses/new"
        className="btn-base inline-flex h-11 items-center gap-2 rounded-[10px] bg-[var(--color-brand-navy)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-brand-navy-700)]"
      >
        <PlusCircle className="size-4" />
        إنشاء كورسي الأول
      </Link>
    </div>
  );
}
