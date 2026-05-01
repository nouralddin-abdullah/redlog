import { Banknote, Download, TrendingUp, Wallet } from 'lucide-react';

import { EarningsSparkline } from '@/features/instructor/components/EarningsSparkline';
import {
  MOCK_COURSES,
  MOCK_EARNINGS_TIMELINE,
  MOCK_PAYOUTS,
} from '@/features/instructor/mock-data';
import { useTweaks } from '@/features/instructor/tweaks-context';
import { formatEgp } from '@/features/instructor/utils';

export function InstructorEarningsPage() {
  const { tweaks } = useTweaks();

  const timeline = tweaks.zeroEarnings
    ? MOCK_EARNINGS_TIMELINE.map((m) => ({ ...m, amount: 0 }))
    : MOCK_EARNINGS_TIMELINE;

  const total = timeline.reduce((s, m) => s + m.amount, 0);
  const thisMonth = timeline.at(-1)?.amount ?? 0;
  const prev = timeline.at(-2)?.amount ?? 0;
  const trend =
    prev > 0 ? Math.round(((thisMonth - prev) / prev) * 100) : 0;
  const pending = MOCK_PAYOUTS.filter((p) => p.status !== 'paid').reduce(
    (s, p) => s + p.amount,
    0,
  );

  const courseEarnings = MOCK_COURSES.filter((c) => c.earnings > 0)
    .map((c) => ({
      id: c.id,
      title: c.title,
      earnings: tweaks.zeroEarnings ? 0 : c.earnings,
      students: c.studentsCount,
    }))
    .sort((a, b) => b.earnings - a.earnings);

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
            الأرباح والمدفوعات
          </h1>
          <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
            ملخص دخلك من الكورسات وسجل التحويلات البنكية.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-[var(--color-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)]"
        >
          <Download className="size-4" />
          تصدير CSV
        </button>
      </header>

      {/* === Top stats ===================================================== */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigStat
          label="إجمالي الأرباح"
          value={tweaks.hideMoney ? '••••' : formatEgp(total)}
          icon={Wallet}
          tone="navy"
        />
        <BigStat
          label="هذا الشهر"
          value={tweaks.hideMoney ? '••••' : formatEgp(thisMonth)}
          trendPercent={trend}
          icon={TrendingUp}
          tone="success"
        />
        <BigStat
          label="قيد المعالجة"
          value={tweaks.hideMoney ? '••••' : formatEgp(pending)}
          icon={Banknote}
          tone="warning"
          hint="سيتم تحويلها في الخامس من كل شهر"
        />
      </section>

      {/* === Sparkline ===================================================== */}
      <section className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)]">
        <header className="mb-4">
          <h2 className="m-0 text-[15px] font-bold text-[var(--color-ink-900)]">
            تطور الأرباح خلال 6 أشهر
          </h2>
          <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-500)]">
            بعد خصم عمولة المنصة (30%).
          </p>
        </header>
        {tweaks.hideMoney ? (
          <div className="flex h-[200px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[13px] text-[var(--color-ink-500)]">
            الأرقام مخفية حالياً
          </div>
        ) : (
          <EarningsSparkline data={timeline} height={220} />
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* === Per-course breakdown ======================================== */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)]">
          <header className="border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="m-0 text-[15px] font-bold text-[var(--color-ink-900)]">
              توزيع الأرباح على الكورسات
            </h2>
          </header>
          {courseEarnings.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-[var(--color-ink-500)]">
              لا توجد أرباح حتى الآن.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {courseEarnings.map((c) => {
                const pct =
                  total > 0 ? Math.round((c.earnings / total) * 100) : 0;
                return (
                  <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="truncate text-[13.5px] font-semibold text-[var(--color-ink-900)]">
                          {c.title}
                        </span>
                        <span className="shrink-0 text-[13px] tabular-nums text-[var(--color-ink-800)]">
                          {tweaks.hideMoney ? '••••' : formatEgp(c.earnings)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-brand-blue)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11.5px] font-semibold tabular-nums text-[var(--color-ink-500)]">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* === Payouts =================================================== */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)]">
          <header className="border-b border-[var(--color-line)] px-5 py-4">
            <h2 className="m-0 text-[15px] font-bold text-[var(--color-ink-900)]">
              سجل التحويلات
            </h2>
          </header>
          <ul className="divide-y divide-[var(--color-line)]">
            {MOCK_PAYOUTS.map((p) => (
              <li key={p.id} className="flex items-start gap-3 px-5 py-4">
                <span
                  className={
                    'flex size-9 shrink-0 items-center justify-center rounded-md ' +
                    (p.status === 'paid'
                      ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                      : p.status === 'processing'
                        ? 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]'
                        : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]')
                  }
                >
                  <Banknote className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-bold tabular-nums text-[var(--color-ink-900)]">
                      {tweaks.hideMoney ? '••••' : formatEgp(p.amount)}
                    </span>
                    <PayoutBadge status={p.status} />
                  </div>
                  <div className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
                    {p.method} ·{' '}
                    {new Date(p.date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  hint,
  trendPercent,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  trendPercent?: number;
  icon: typeof Wallet;
  tone: 'navy' | 'success' | 'warning';
}) {
  const accent =
    tone === 'navy'
      ? 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-navy)]'
      : tone === 'success'
        ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
        : 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]';
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-xs)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[13px] font-medium text-[var(--color-ink-500)]">
          {label}
        </div>
        <span
          className={`flex size-10 items-center justify-center rounded-[var(--radius-md)] ${accent}`}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <div className="mt-3 text-[28px] font-bold tabular-nums text-[var(--color-ink-900)]">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-2 text-[12.5px]">
        {trendPercent !== undefined && (
          <span
            className={
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ' +
              (trendPercent >= 0
                ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]')
            }
          >
            <TrendingUp className="size-3" />
            {Math.abs(trendPercent)}%
          </span>
        )}
        {hint && <span className="text-[var(--color-ink-500)]">{hint}</span>}
      </div>
    </div>
  );
}

function PayoutBadge({
  status,
}: {
  status: 'paid' | 'processing' | 'pending';
}) {
  const map = {
    paid: { label: 'تم التحويل', cls: 'bg-[var(--color-success-soft)] text-[var(--color-success)]' },
    processing: {
      label: 'قيد التحويل',
      cls: 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]',
    },
    pending: {
      label: 'قيد الانتظار',
      cls: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
    },
  } as const;
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
