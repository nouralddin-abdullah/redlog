/**
 * Render an ISO timestamp as a localised relative time
 * (e.g. "منذ يومين"). Falls back to a Y-M-D string if Intl APIs are missing.
 */
const RTF = (() => {
  try {
    return new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });
  } catch {
    return null;
  }
})();

const DIVISIONS: ReadonlyArray<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  if (!RTF) return date.toISOString().slice(0, 10);

  let duration = (date.getTime() - Date.now()) / 1000;
  for (const div of DIVISIONS) {
    if (Math.abs(duration) < div.amount) {
      return RTF.format(Math.round(duration), div.unit);
    }
    duration /= div.amount;
  }
  return RTF.format(Math.round(duration), 'year');
}
