import { useState } from 'react';
import { Mail, Search, Users as UsersIcon } from 'lucide-react';

import { Avatar } from '@/shared/components/ui/Avatar';
import { MOCK_STUDENTS } from '@/features/instructor/mock-data';
import { useTweaks } from '@/features/instructor/tweaks-context';
import { formatEgp, timeAgo } from '@/features/instructor/utils';

export function InstructorStudentsPage() {
  const { tweaks } = useTweaks();
  const [search, setSearch] = useState('');

  let students = tweaks.emptyStudents ? [] : MOCK_STUDENTS;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }

  const totals = {
    students: students.length,
    revenue: students.reduce((s, st) => s + st.totalSpent, 0),
    completionRate: students.length
      ? Math.round(
          students.reduce((s, st) => s + st.averageProgress, 0) / students.length,
        )
      : 0,
  };

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          الطلاب
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          الطلاب الذين اشتركوا في كورساتك ومستوى تقدمهم.
        </p>
      </header>

      {/* === Quick stats =================================================== */}
      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="إجمالي الطلاب"
          value={totals.students.toLocaleString('en-US')}
        />
        <Stat
          label="متوسط الإكمال"
          value={`${totals.completionRate}%`}
        />
        <Stat
          label="إجمالي الإيرادات"
          value={tweaks.hideMoney ? '••••' : formatEgp(totals.revenue)}
        />
      </section>

      <div className="mb-5 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-3">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-400)]"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="ابحث بالاسم أو البريد..."
            className="input-base h-10 w-full ps-10 text-[14px]"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)]">
          <table className="w-full text-[13.5px]">
            <thead className="bg-[var(--color-surface-soft)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
              <tr>
                <th className="px-5 py-3 text-start">الطالب</th>
                <th className="px-3 py-3 text-start">الكورسات</th>
                <th className="px-3 py-3 text-start">الإكمال</th>
                <th className="px-3 py-3 text-start">إجمالي الدفعات</th>
                <th className="px-3 py-3 text-start">انضم</th>
                <th className="px-5 py-3 text-end" aria-label="إجراءات" />
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className={i === 0 ? '' : 'border-t border-[var(--color-line)]'}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={36} />
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-[var(--color-ink-900)]">
                          {s.name}
                        </div>
                        <div className="truncate text-[12px] text-[var(--color-ink-500)]">
                          {s.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] text-[var(--color-ink-800)]">
                    <span className="font-semibold tabular-nums">
                      {s.enrolledCoursesCount}
                    </span>
                    <span className="text-[var(--color-ink-500)]">
                      {' '}
                      ({s.completedCoursesCount} مكتمل)
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <ProgressBar value={s.averageProgress} />
                  </td>
                  <td className="px-3 py-4 tabular-nums text-[var(--color-ink-800)]">
                    {tweaks.hideMoney ? '••••' : formatEgp(s.totalSpent)}
                  </td>
                  <td className="px-3 py-4 text-[12.5px] text-[var(--color-ink-500)]">
                    {timeAgo(s.joinedAt)}
                  </td>
                  <td className="px-5 py-4 text-end">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
                      aria-label="مراسلة"
                    >
                      <Mail className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4">
      <div className="text-[12px] text-[var(--color-ink-500)]">{label}</div>
      <div className="mt-1 text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
        {value}
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[140px] overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--color-brand-blue)]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11.5px] font-semibold tabular-nums text-[var(--color-ink-700)]">
        {value}%
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
        <UsersIcon className="size-6" />
      </div>
      <h2 className="m-0 mb-1.5 text-[18px] font-bold text-[var(--color-ink-900)]">
        لا يوجد طلاب بعد
      </h2>
      <p className="max-w-[420px] text-[14px] text-[var(--color-ink-500)]">
        بمجرد أن يشترك الطلاب في كورساتك ستظهر بياناتهم هنا.
      </p>
    </div>
  );
}
