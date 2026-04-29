/**
 * Display helpers for course data.
 * The API stores money + ratings as strings — we parse at the edge.
 */

export function parseRating(rating: string): number {
  const n = Number.parseFloat(rating);
  return Number.isNaN(n) ? 0 : n;
}

export function formatRating(rating: string): string {
  const n = parseRating(rating);
  if (!n) return '0.0';
  return n.toFixed(1);
}

export function formatStudents(n: number): string {
  return n.toLocaleString('en-US');
}

/** Round minutes → "ساعة" / "ساعتان" / "X ساعات". Used in card + meta rows. */
export function formatHours(minutes: number): string {
  const hours = Math.round(minutes / 60);
  if (hours <= 0) return `${minutes} دقيقة`;
  if (hours === 1) return 'ساعة';
  if (hours === 2) return 'ساعتان';
  return `${hours} ساعات`;
}

/** Compact module label → "1س 20د" / "45د" / "2س". */
export function formatModuleDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}س ${m}د`;
  if (h) return `${h}س`;
  return `${m}د`;
}

/** mm:ss display for a video lesson. */
export function formatLessonDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** "499 ج.م" — Egyptian pound shorthand. */
export function formatPrice(price: string): string {
  const n = Number.parseFloat(price);
  if (Number.isNaN(n)) return price;
  // Drop trailing .00 for clean prices
  const display = n % 1 === 0 ? n.toString() : n.toFixed(2);
  return `${display} ج.م`;
}

export function discountPercent(price: string, original: string | null): number | null {
  if (!original) return null;
  const p = Number.parseFloat(price);
  const o = Number.parseFloat(original);
  if (!o || o <= p) return null;
  return Math.round((1 - p / o) * 100);
}
