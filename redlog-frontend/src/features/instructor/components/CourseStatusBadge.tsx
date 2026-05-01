import { CheckCircle2, Clock, FileText, ShieldAlert } from 'lucide-react';

import type { CourseStatus } from '@/features/instructor/types';
import { statusClasses, statusLabel } from '@/features/instructor/utils';
import { cn } from '@/shared/lib/cn';

interface Props {
  status: CourseStatus;
  /** When true, render a slightly larger pill — for use in headers. */
  size?: 'sm' | 'md';
}

const ICON: Record<CourseStatus, typeof CheckCircle2> = {
  published: CheckCircle2,
  draft: FileText,
  pending_review: Clock,
  rejected: ShieldAlert,
};

export function CourseStatusBadge({ status, size = 'sm' }: Props) {
  const cls = statusClasses(status);
  const Icon = ICON[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        cls.bg,
        cls.fg,
        size === 'sm'
          ? 'px-2.5 py-0.5 text-[11.5px]'
          : 'px-3 py-1 text-[12.5px]',
      )}
    >
      <Icon
        className={cn(size === 'sm' ? 'size-3' : 'size-3.5')}
        aria-hidden
      />
      {statusLabel(status)}
    </span>
  );
}
