import { useMemo } from 'react';

import type { EarningsMonth } from '@/features/instructor/types';

interface Props {
  data: EarningsMonth[];
  /** Inline svg dimensions. The component is responsive via viewBox. */
  width?: number;
  height?: number;
}

/**
 * Lightweight earnings line — pure SVG, no chart library. Sized for the
 * dashboard's earnings panel; on the dedicated earnings page we render it
 * larger via `width` / `height`. Renders a smooth area below the line for a
 * mini-cardiogram feel that fits the radiology aesthetic.
 */
export function EarningsSparkline({ data, width = 600, height = 180 }: Props) {
  const { linePath, areaPath, points, max } = useMemo(() => {
    if (data.length === 0) {
      return { linePath: '', areaPath: '', points: [], max: 0 };
    }
    const padX = 16;
    const padY = 18;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;
    const max = Math.max(...data.map((d) => d.amount));
    const min = Math.min(...data.map((d) => d.amount));
    const range = max - min || 1;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const points = data.map((d, i) => {
      const x = padX + step * i;
      const y = padY + innerH - ((d.amount - min) / range) * innerH;
      return { x, y, amount: d.amount, month: d.month };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');

    const areaPath =
      `${linePath} L ${points[points.length - 1]!.x.toFixed(2)} ${(padY + innerH).toFixed(2)} ` +
      `L ${points[0]!.x.toFixed(2)} ${(padY + innerH).toFixed(2)} Z`;

    return { linePath, areaPath, points, max };
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] text-[13px] text-[var(--color-ink-500)]">
        لا توجد بيانات أرباح بعد.
      </div>
    );
  }

  return (
    <div className="relative w-full" dir="ltr">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="earnings-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-brand-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#earnings-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-brand-blue-700)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p) => (
          <circle
            key={p.month}
            cx={p.x}
            cy={p.y}
            r={p.amount === max ? 4 : 3}
            fill="white"
            stroke="var(--color-brand-blue-700)"
            strokeWidth={2}
          />
        ))}
      </svg>
      <div
        className="mt-2 grid text-[11px] text-[var(--color-ink-500)]"
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
      >
        {data.map((d) => (
          <div key={d.month} className="text-center tabular-nums">
            {formatMonthLabel(d.month)}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMonthLabel(iso: string): string {
  // Expect YYYY-MM. Render as Arabic short month (مار، أبر، …).
  const [year, mm] = iso.split('-');
  const month = Number(mm);
  const labels = [
    'ينا',
    'فبر',
    'مار',
    'أبر',
    'ماي',
    'يون',
    'يول',
    'أغس',
    'سبت',
    'أكت',
    'نوف',
    'ديس',
  ];
  return `${labels[month - 1] ?? mm} ${year?.slice(2) ?? ''}`;
}
