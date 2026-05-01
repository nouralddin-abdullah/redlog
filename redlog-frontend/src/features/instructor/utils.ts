import type { CourseStatus } from './types';

/**
 * Format an EGP amount with thousands separators — "248,900 ج.م".
 * Accepts a number (mock fixtures) or a JSON string (live API). The API
 * returns money as decimal strings to avoid float drift; we round to the
 * nearest pound for display since cents aren't meaningful in this UI.
 */
export function formatEgp(amount: number | string): string {
  const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return '0 ج.م';
  return `${Math.round(n).toLocaleString('en-US')} ج.م`;
}

/** Same parser the formatter uses — exposed so callers can do their own arithmetic. */
export function parseEgp(amount: number | string): number {
  const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  return Number.isFinite(n) ? n : 0;
}

/** Compact short numbers — "1.2K" / "12.4K" / "1.2M". Used on stat tiles. */
export function formatCompact(n: number): string {
  if (n < 1_000) return n.toString();
  if (n < 1_000_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)}K`;
  }
  const v = n / 1_000_000;
  return `${v % 1 === 0 ? v : v.toFixed(1)}M`;
}

/** "منذ 3 ساعات" / "منذ يومين" — relative time in Egyptian Arabic. */
export function timeAgo(iso: string, nowIso?: string): string {
  const now = nowIso ? new Date(nowIso) : new Date();
  const then = new Date(iso);
  const diffSec = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));

  if (diffSec < 60) return 'الآن';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `منذ ${min} ${min === 1 ? 'دقيقة' : min === 2 ? 'دقيقتين' : 'دقائق'}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${hr} ${hr === 1 ? 'ساعة' : hr === 2 ? 'ساعتين' : 'ساعات'}`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `منذ ${d} ${d === 1 ? 'يوم' : d === 2 ? 'يومين' : 'أيام'}`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `منذ ${mo} ${mo === 1 ? 'شهر' : mo === 2 ? 'شهرين' : 'شهور'}`;
  const yr = Math.floor(mo / 12);
  return `منذ ${yr} ${yr === 1 ? 'سنة' : yr === 2 ? 'سنتين' : 'سنوات'}`;
}

/** "12س 30د" / "45د" — total minutes → Arabic compact. */
export function formatTotalDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}س ${m}د`;
  if (h) return `${h}س`;
  return `${m}د`;
}

export function statusLabel(status: CourseStatus): string {
  switch (status) {
    case 'published':
      return 'منشور';
    case 'draft':
      return 'مسودة';
    case 'pending_review':
      return 'قيد المراجعة';
    case 'rejected':
      return 'مرفوض';
  }
}

/** Tailwind class triplet — bg / fg / border — keyed by status. */
export function statusClasses(status: CourseStatus): {
  bg: string;
  fg: string;
  border: string;
} {
  switch (status) {
    case 'published':
      return {
        bg: 'bg-[var(--color-success-soft)]',
        fg: 'text-[var(--color-success)]',
        border: 'border-[var(--color-success)]',
      };
    case 'draft':
      return {
        bg: 'bg-[var(--color-surface-muted)]',
        fg: 'text-[var(--color-ink-600)]',
        border: 'border-[var(--color-line-strong)]',
      };
    case 'pending_review':
      return {
        bg: 'bg-[var(--color-warning-soft)]',
        fg: 'text-[var(--color-warning)]',
        border: 'border-[var(--color-warning)]',
      };
    case 'rejected':
      return {
        bg: 'bg-[var(--color-danger-soft)]',
        fg: 'text-[var(--color-danger)]',
        border: 'border-[var(--color-danger)]',
      };
  }
}
