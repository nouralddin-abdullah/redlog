import { Hourglass, Phone, Coins, Calendar, ImageIcon } from 'lucide-react';
import type { PaymentRequestSummary } from '@/features/courses/types';
import { formatPrice } from '@/features/courses/utils';
import { formatRelativeTime } from '@/shared/lib/relative-time';
import { egyptianE164ToLocal } from '@/shared/lib/phone';
import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';

interface PaymentRequestDetailsDialogProps {
  open: boolean;
  request: PaymentRequestSummary | null;
  onClose: () => void;
}

export function PaymentRequestDetailsDialog({
  open,
  request,
  onClose,
}: PaymentRequestDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="تفاصيل طلب الاشتراك"
      size="sm"
      footer={<Button variant="ghost" onClick={onClose}>إغلاق</Button>}
    >
      {!request ? (
        <p className="m-0 text-[13.5px] text-[var(--color-ink-500)]">
          لا توجد تفاصيل متاحة.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[#F6DDA9] bg-[var(--color-warning-soft)] p-3.5">
            <Hourglass className="mt-0.5 size-5 shrink-0 text-[var(--color-warning)]" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-bold text-[var(--color-warning)]">
                قيد المراجعة
              </div>
              <p className="m-0 mt-0.5 text-[12.5px] leading-[1.6] text-[var(--color-ink-700)]">
                سنتواصل معك خلال 24 ساعة بعد التحقق من التحويل.
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-3 text-[13.5px]">
            {request.amount && (
              <DetailRow
                icon={<Coins />}
                label="المبلغ"
                value={formatPrice(request.amount)}
              />
            )}
            {request.senderPhoneNumber && (
              <DetailRow
                icon={<Phone />}
                label="من الرقم"
                value={egyptianE164ToLocal(request.senderPhoneNumber)}
                valueLtr
              />
            )}
            {request.createdAt && (
              <DetailRow
                icon={<Calendar />}
                label="تاريخ الإرسال"
                value={formatRelativeTime(request.createdAt)}
              />
            )}
          </ul>

          {request.screenshotUrl && (
            <a
              href={request.screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white px-3 py-2.5 text-[13px] font-semibold text-[var(--color-ink-700)] transition-colors hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink-900)]"
            >
              <ImageIcon className="size-4" aria-hidden />
              عرض لقطة الشاشة المرفقة
            </a>
          )}
        </div>
      )}
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueLtr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueLtr?: boolean;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="text-[var(--color-ink-400)] [&>svg]:size-[16px]">{icon}</span>
      <span className="text-[var(--color-ink-500)]">{label}:</span>
      <strong
        dir={valueLtr ? 'ltr' : undefined}
        className={
          valueLtr
            ? 'ms-auto font-mono font-bold tabular-nums text-[var(--color-ink-900)]'
            : 'ms-auto font-bold text-[var(--color-ink-900)]'
        }
      >
        {value}
      </strong>
    </li>
  );
}
