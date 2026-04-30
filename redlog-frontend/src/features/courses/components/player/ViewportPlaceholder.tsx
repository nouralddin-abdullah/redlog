import type { ReactNode } from 'react';

interface ViewportPlaceholderProps {
  icon?: ReactNode;
  title: string;
  body?: string;
  loading?: boolean;
}

/**
 * Centered overlay shown inside the lesson viewport when the actual
 * media isn't ready (loading, missing URL, "select a lesson", etc.).
 */
export function ViewportPlaceholder({
  icon,
  title,
  body,
  loading,
}: ViewportPlaceholderProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/65"
      style={{
        background:
          'radial-gradient(circle at center, #1a3a5c 0%, #0a1a2e 80%)',
      }}
    >
      {loading ? (
        <span className="size-7 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      ) : (
        icon && (
          <span className="rounded-full bg-white/10 p-3 text-white/80 [&>svg]:size-7">
            {icon}
          </span>
        )
      )}
      <div className="text-[15px] font-semibold text-white/85">{title}</div>
      {body && (
        <p className="m-0 max-w-[420px] px-6 text-[13px] leading-[1.7] text-white/55">
          {body}
        </p>
      )}
    </div>
  );
}
