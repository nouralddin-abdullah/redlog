import { Inbox } from 'lucide-react';
import { useLessonAttachments } from '@/features/attachments/hooks';
import { AttachmentCard } from '@/features/attachments/components/AttachmentCard';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';

interface FilesTabProps {
  lessonId: string | null;
}

export function FilesTab({ lessonId }: FilesTabProps) {
  const query = useLessonAttachments(lessonId ?? undefined);

  if (!lessonId) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] py-12 text-center text-[14px] text-[var(--color-ink-500)]">
        اختر درساً لعرض المرفقات.
      </div>
    );
  }

  if (query.error) {
    return (
      <Alert tone="warning">
        تعذّر تحميل المرفقات
        {query.error instanceof HttpError ? ` — ${query.error.message}` : ''}
      </Alert>
    );
  }

  if (query.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
          />
        ))}
      </div>
    );
  }

  if (!query.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-400)]">
          <Inbox className="size-6" aria-hidden />
        </div>
        <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-ink-800)]">
          لا توجد مرفقات
        </h3>
        <p className="mt-1 text-[13px] text-[var(--color-ink-500)]">
          هذا الدرس لا يحتوي على ملفات قابلة للتنزيل.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {query.data.map((attachment) => (
        <AttachmentCard key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}
