import { cn } from '@/shared/lib/cn';

interface LogoProps {
  size?: number;
  /** When true, render the entire mark in currentColor (for dark surfaces). */
  mono?: boolean;
  /** Show the "Build Your Radiology Experience" tagline beneath the wordmark. */
  showTagline?: boolean;
  className?: string;
}

export function Logo({ size = 32, mono = false, showTagline, className }: LogoProps) {
  const blue = mono ? 'currentColor' : 'var(--color-brand-blue)';
  const dark = mono ? 'currentColor' : 'var(--color-brand-navy)';

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)} dir="ltr">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path d="M4 8h14a4 4 0 014 4v22a3 3 0 00-3-3H4V8z" fill={blue} opacity={mono ? '0.25' : '0.15'} />
        <path d="M36 8H22a4 4 0 00-4 4v22a3 3 0 013-3h13V8z" fill={blue} opacity={mono ? '0.4' : '0.25'} />
        <path
          d="M4 8h14a4 4 0 014 4v22M36 8H22a4 4 0 00-4 4v22"
          stroke={dark}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M20 16v8" stroke={blue} strokeWidth={2} strokeLinecap="round" />
        <circle cx={20} cy={13} r={2} fill={blue} />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className="font-display font-bold tracking-[0.02em]"
          style={{ fontSize: size * 0.62, color: dark }}
        >
          RAD<span style={{ color: blue }}>LOG</span>
        </span>
        {showTagline && (
          <span
            className="caps mt-1.5"
            style={{
              color: mono ? 'rgba(255,255,255,0.55)' : 'var(--color-ink-500)',
              fontSize: 9,
            }}
          >
            Build Your Radiology Experience
          </span>
        )}
      </div>
    </div>
  );
}
