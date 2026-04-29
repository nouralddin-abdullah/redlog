import { cn } from '@/shared/lib/cn';

const PALETTE = [
  '#3B6FA8',
  '#0E2A47',
  '#0284C7',
  '#16A34A',
  '#D97706',
  '#7C3AED',
  '#DC2626',
  '#0891B2',
];

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 36, className }: AvatarProps) {
  const safeName = (name ?? '؟').trim() || '؟';
  const initials = safeName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const bg = PALETTE[hash(safeName) % PALETTE.length];
  const style = { width: size, height: size, fontSize: size * 0.38 } as const;

  if (src) {
    return (
      <img
        src={src}
        alt={safeName}
        style={style}
        className={cn('rounded-full object-cover', className)}
      />
    );
  }
  return (
    <span
      style={{ ...style, background: bg }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        className,
      )}
    >
      {initials}
    </span>
  );
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
