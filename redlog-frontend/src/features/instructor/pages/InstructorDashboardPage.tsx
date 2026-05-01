import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Star,
  Users as UsersIcon,
  Wallet,
} from 'lucide-react';

import { Avatar } from '@/shared/components/ui/Avatar';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { useCurrentUser } from '@/features/auth/hooks';
import { StatTile } from '@/features/instructor/components/StatTile';
import { CourseStatusBadge } from '@/features/instructor/components/CourseStatusBadge';
import { EarningsSparkline } from '@/features/instructor/components/EarningsSparkline';
import { useInstructorDashboard } from '@/features/instructor/hooks';
import { useTweaks } from '@/features/instructor/tweaks-context';
import {
  formatCompact,
  formatEgp,
  parseEgp,
  timeAgo,
} from '@/features/instructor/utils';
import type {
  CourseStatus,
  DashboardActivity,
  DashboardPendingQuestion,
  DashboardStatusCounts,
  DashboardTopCourse,
  InstructorDashboard,
} from '@/features/instructor/types';

export function InstructorDashboardPage() {
  const { tweaks } = useTweaks();
  const dashboardQuery = useInstructorDashboard();
  const { data: user } = useCurrentUser();

  if (dashboardQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-12">
        <Alert tone="warning">
          تعذّر تحميل لوحة التحكم
          {dashboardQuery.error instanceof HttpError
            ? ` — ${dashboardQuery.error.message}`
            : ''}
        </Alert>
      </div>
    );
  }

  // Apply tweaks as overlays on top of real data so the design panel stays
  // useful for previewing edge states without round-tripping the backend.
  const data = applyTweaks(dashboardQuery.data, tweaks);

  const earningsForChart = data.earningsSeries.map((p) => ({
    month: p.monthIso.slice(0, 7),
    amount: parseEgp(p.amount),
  }));

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      {/* === Greeting ======================================================= */}
      <header className="mb-8 flex flex-col gap-1.5">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          أهلاً، {firstName(user?.name ?? '')} 👋
        </h1>
        <p className="text-[15px] text-[var(--color-ink-500)]">
          هذه نظرة سريعة على أداء كورساتك خلال الفترة الأخيرة.
        </p>
      </header>

      {/* === Stat tiles ===================================================== */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="الطلاب النشطون"
          value={formatCompact(data.kpis.activeStudents)}
          hint="عبر كل كورساتك"
          icon={UsersIcon}
          tone="blue"
        />
        <StatTile
          label="أرباح هذا الشهر"
          value={
            tweaks.hideMoney ? '••••' : formatEgp(data.kpis.thisMonthEarnings)
          }
          hint="مقارنةً بالشهر الماضي"
          icon={Wallet}
          tone="success"
          // Spec: null when last month was zero (avoid +∞%). Render no chip.
          trendPercent={data.kpis.earningsPercentChange ?? undefined}
        />
        <StatTile
          label="أسئلة في انتظار الرد"
          value={data.kpis.pendingQuestionsCount.toString()}
          hint={
            data.kpis.pendingQuestionsCount === 0
              ? 'كل شيء تمام'
              : 'تحتاج إجابة'
          }
          icon={HelpCircle}
          tone="warning"
        />
        <StatTile
          label="متوسط التقييم"
          value={data.kpis.averageRating ? data.kpis.averageRating.toFixed(1) : '—'}
          hint={`${data.kpis.reviewsCount.toLocaleString('en-US')} تقييم`}
          icon={Star}
          tone="amber"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* === Earnings panel ============================================== */}
        <Panel
          title="الأرباح خلال آخر 6 أشهر"
          subtitle={
            tweaks.hideMoney
              ? 'الأرقام مخفية'
              : `إجمالي ${formatEgp(data.totalEarningsLast6Months)}`
          }
          actionHref="/instructor/earnings"
          actionLabel="عرض التفاصيل"
        >
          {tweaks.hideMoney ? (
            <div className="flex h-[200px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[13px] text-[var(--color-ink-500)]">
              الأرقام مخفية حالياً
            </div>
          ) : (
            <EarningsSparkline data={earningsForChart} />
          )}
        </Panel>

        {/* === Pending questions ===========================================
            Renders at most 5 items; the subtitle shows the *true* total
            (`kpis.pendingQuestionsCount`) so a backlog of 8 still reads as
            "8 أسئلة تحتاج إجابة" even though the panel only shows 5. */}
        <Panel
          title="أسئلة الطلاب"
          subtitle={
            data.kpis.pendingQuestionsCount === 0
              ? 'لا توجد أسئلة بانتظار الرد'
              : `${data.kpis.pendingQuestionsCount} ${
                  data.kpis.pendingQuestionsCount === 1
                    ? 'سؤال يحتاج'
                    : 'أسئلة تحتاج'
                } إجابة`
          }
          actionHref="/instructor/dashboard"
          actionLabel="عرض الكل"
        >
          {data.pendingQuestions.length === 0 ? (
            <EmptyMini
              icon={CheckCircle2}
              text="ممتاز — لا أسئلة في الانتظار."
            />
          ) : (
            <ul className="-my-2 flex flex-col">
              {data.pendingQuestions.slice(0, 5).map((q, i) => (
                <PendingQuestionRow
                  key={q.id}
                  q={q}
                  bordered={i > 0}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* === Course performance ========================================== */}
        <Panel
          title="أداء أفضل كورساتك"
          subtitle="مرتب حسب عدد الطلاب"
          actionHref="/instructor/courses"
          actionLabel="كل الكورسات"
        >
          {data.topCourses.length === 0 ? (
            <EmptyMini
              icon={GraduationCap}
              text="لا توجد كورسات منشورة بعد."
            />
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-start text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
                  <th className="pb-3 ps-0 text-start">الكورس</th>
                  <th className="pb-3 text-center">الطلاب</th>
                  <th className="pb-3 text-center">الإكمال</th>
                  <th className="pb-3 pe-0 text-center">التقييم</th>
                </tr>
              </thead>
              <tbody>
                {data.topCourses.map((c, i) => (
                  <TopCourseRow key={c.id} course={c} bordered={i > 0} />
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* === Recent activity feed ======================================== */}
        <Panel
          title="أحدث الأنشطة"
          subtitle="اشتراكات وتقييمات"
          actionHref="/instructor/students"
          actionLabel="كل الطلاب"
        >
          {data.recentActivity.length === 0 ? (
            <EmptyMini icon={UsersIcon} text="لا يوجد نشاط حتى الآن." />
          ) : (
            <ul className="-my-2 flex flex-col">
              {data.recentActivity.slice(0, 5).map((a, i) => (
                <ActivityRow
                  // No id on the wire — composite key is stable enough for the
                  // 5-row cap we render here.
                  key={`${a.type}-${a.createdAt}-${a.courseId}-${i}`}
                  activity={a}
                  hideMoney={tweaks.hideMoney}
                  bordered={i > 0}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* === Course-statuses summary ====================================== */}
      <section className="mt-6 grid grid-cols-1 gap-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)] sm:grid-cols-4">
        {STATUS_CARDS.map((card) => (
          <div
            key={card.status}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-4 py-3"
          >
            <CourseStatusBadge status={card.status} size="md" />
            <span className="text-[18px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {data.statusCounts[card.dataKey]}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ============================== sub-components ============================== */

function Panel({
  title,
  subtitle,
  children,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="m-0 text-[15px] font-bold text-[var(--color-ink-900)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-500)]">
              {subtitle}
            </p>
          )}
        </div>
        {actionHref && actionLabel && (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
          >
            {actionLabel}
            <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function ProgressBar({ value }: { value: number | null }) {
  // Per spec: `completionPercent` is null for courses with 0 enrollments.
  // Render an empty rail with "—" instead of a 0% bar to make the difference
  // legible.
  if (value === null) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-[var(--color-surface-muted)]" />
        <span className="text-[11.5px] text-[var(--color-ink-400)]">—</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
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

function TopCourseRow({
  course,
  bordered,
}: {
  course: DashboardTopCourse;
  bordered: boolean;
}) {
  return (
    <tr className={bordered ? 'border-t border-[var(--color-line)]' : ''}>
      <td className="py-3.5 ps-0">
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/instructor/courses/${course.slug}`}
            className="font-semibold text-[var(--color-ink-900)] hover:text-[var(--color-brand-blue)]"
          >
            {course.title}
          </Link>
        </div>
      </td>
      <td className="py-3.5 text-center tabular-nums text-[var(--color-ink-800)]">
        {formatCompact(course.studentsCount)}
      </td>
      <td className="py-3.5">
        <ProgressBar value={course.completionPercent} />
      </td>
      <td className="py-3.5 pe-0 text-center">
        <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-[var(--color-ink-800)]">
          <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
          {course.rating.toFixed(1)}
        </span>
      </td>
    </tr>
  );
}

function PendingQuestionRow({
  q,
  bordered,
}: {
  q: DashboardPendingQuestion;
  bordered: boolean;
}) {
  return (
    <li className={bordered ? 'border-t border-[var(--color-line)] py-3' : 'py-3'}>
      <div className="flex items-start gap-3">
        <Avatar name={q.studentName} size={32} />
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[13px] font-semibold text-[var(--color-ink-900)]">
              {q.studentName}
            </span>
            <span className="text-[11.5px] text-[var(--color-ink-500)]">
              {timeAgo(q.createdAt)}
            </span>
          </div>
          <div className="line-clamp-2 text-[13px] leading-relaxed text-[var(--color-ink-700)]">
            {q.text}
          </div>
          <div className="mt-1 truncate text-[11.5px] text-[var(--color-ink-500)]">
            {q.courseTitle} · {q.lessonTitle}
          </div>
        </div>
      </div>
    </li>
  );
}

function ActivityRow({
  activity,
  hideMoney,
  bordered,
}: {
  activity: DashboardActivity;
  hideMoney: boolean;
  bordered: boolean;
}) {
  const dotColor =
    activity.type === 'enrollment'
      ? 'bg-[var(--color-success)]'
      : 'bg-[#F59E0B]';
  return (
    <li className={bordered ? 'border-t border-[var(--color-line)] py-3' : 'py-3'}>
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar name={activity.studentName} size={32} />
          <span
            className={`absolute -bottom-0.5 -end-0.5 size-2.5 rounded-full ring-2 ring-white ${dotColor}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] leading-relaxed text-[var(--color-ink-800)]">
            {activity.type === 'enrollment' ? (
              <>
                <strong>{activity.studentName}</strong>{' '}
                <span className="text-[var(--color-ink-600)]">اشترك في</span>{' '}
                <strong>{activity.courseTitle}</strong>
              </>
            ) : (
              <>
                <strong>{activity.studentName}</strong>{' '}
                <span className="text-[var(--color-ink-600)]">قيّم</span>{' '}
                <strong>{activity.courseTitle}</strong>
              </>
            )}
          </div>
          <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-500)]">
            {activity.type === 'enrollment' ? (
              hideMoney || activity.amount === null ? (
                timeAgo(activity.createdAt)
              ) : (
                `${formatEgp(activity.amount)} · ${timeAgo(activity.createdAt)}`
              )
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-ink-800)]">
                  <Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" />
                  {activity.rating}
                </span>
                <span aria-hidden>·</span>
                <span>{timeAgo(activity.createdAt)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyMini({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] py-8 text-center">
      <Icon className="size-6 text-[var(--color-ink-400)]" />
      <p className="text-[13px] text-[var(--color-ink-500)]">{text}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-8 h-9 w-[260px] animate-pulse rounded bg-[var(--color-surface-muted)]" />
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[130px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-[280px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white" />
        <div className="h-[280px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white" />
      </div>
    </div>
  );
}

/* ============================== helpers ============================== */

const STATUS_CARDS: Array<{
  status: CourseStatus;
  dataKey: keyof DashboardStatusCounts;
}> = [
  { status: 'published', dataKey: 'published' },
  { status: 'draft', dataKey: 'draft' },
  { status: 'pending_review', dataKey: 'pendingReview' },
  { status: 'rejected', dataKey: 'rejected' },
];

function firstName(full: string): string {
  // Drop a leading honorific ("د.") + take the first word after it. Empty
  // input falls back to a neutral honorific so the greeting still reads.
  const stripped = full.replace(/^د\.?\s*/, '').trim();
  if (!stripped) return 'بك';
  return stripped.split(/\s+/)[0] ?? full;
}

/**
 * Apply the design-tweaks panel as transforms on the live dashboard payload.
 * Lets a reviewer flip into empty / zero / hidden states without touching
 * the API. Money zeroing returns "0.00" so the existing string-money
 * formatters still work.
 */
function applyTweaks(
  data: InstructorDashboard,
  tweaks: {
    emptyActivity: boolean;
    zeroEarnings: boolean;
  },
): InstructorDashboard {
  let next = data;
  if (tweaks.emptyActivity) {
    next = {
      ...next,
      recentActivity: [],
      pendingQuestions: [],
      kpis: { ...next.kpis, pendingQuestionsCount: 0 },
    };
  }
  if (tweaks.zeroEarnings) {
    next = {
      ...next,
      earningsSeries: next.earningsSeries.map((p) => ({ ...p, amount: '0.00' })),
      totalEarningsLast6Months: '0.00',
      kpis: {
        ...next.kpis,
        thisMonthEarnings: '0.00',
        lastMonthEarnings: '0.00',
        earningsPercentChange: null,
      },
    };
  }
  return next;
}
