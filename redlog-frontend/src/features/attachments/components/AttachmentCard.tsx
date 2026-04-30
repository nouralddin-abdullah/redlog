import { Download } from 'lucide-react';
import type { LessonAttachment } from '@/features/attachments/types';
import { fileLabel, formatBytes } from '@/features/attachments/utils';

interface AttachmentCardProps {
  attachment: LessonAttachment;
}

export function AttachmentCard({ attachment }: AttachmentCardProps) {
  const label = fileLabel(attachment.mimeType, attachment.fileUrl);
  const size = formatBytes(attachment.fileSizeBytes);

  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-3.5 transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-brand-blue-100)] text-[11px] font-bold text-[var(--color-brand-blue-700)]">
        {label}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-[var(--color-ink-900)] group-hover:text-[var(--color-brand-navy)]">
          {attachment.title}
        </div>
        <div className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
          <span>{label}</span>
          <span className="mx-1.5 text-[var(--color-ink-300)]">·</span>
          <span className="tabular-nums" dir="ltr">
            {size}
          </span>
        </div>
      </div>
      <span
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-blue-50)] text-[var(--color-brand-blue-700)] transition-colors group-hover:bg-[var(--color-brand-blue-100)]"
        aria-label="تنزيل"
      >
        <Download className="size-4" />
      </span>
    </a>
  );
}
