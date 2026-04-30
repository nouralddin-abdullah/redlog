import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface StarRatingProps {
  value: number;
  size?: number;
  className?: string;
}

export function StarRating({ value, size = 14, className }: StarRatingProps) {
  return (
    <span className={cn('inline-flex gap-0.5 text-[#F59E0B]', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          style={{ width: size, height: size }}
          className={i < value ? 'fill-current' : 'text-[var(--color-line-strong)]'}
        />
      ))}
    </span>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  size = 32,
  disabled,
}: StarRatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="التقييم"
      className={cn(
        'inline-flex gap-1',
        disabled && 'pointer-events-none opacity-60',
      )}
      onMouseLeave={() => setHover(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= display;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} نجوم`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className={cn(
              'rounded transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-blue)]',
              hover === star && 'scale-110',
            )}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                'transition-colors',
                active
                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                  : 'text-[var(--color-line-strong)]',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
