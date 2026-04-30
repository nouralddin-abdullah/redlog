import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Copy, ImageIcon, Loader2, AlertCircle, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import {
  usePaymentInfo,
  useSubmitPaymentRequest,
} from '@/features/courses/hooks';
import type { Course, PaymentInfo } from '@/features/courses/types';
import {
  egyptianE164ToLocal,
  egyptianLocalToE164,
  isEgyptianMobile,
} from '@/shared/lib/phone';
import { cn } from '@/shared/lib/cn';

interface PaymentDialogProps {
  open: boolean;
  course: Course;
  onClose: () => void;
}

const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;

const paymentSchema = z.object({
  senderPhoneNumber: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .refine(isEgyptianMobile, 'أدخل رقم محمول مصري صحيح (مثل 01012345678)'),
  screenshot: z
    .instanceof(File, { message: 'يجب رفع لقطة شاشة من إثبات التحويل' })
    .refine((f) => f.type.startsWith('image/'), 'الملف يجب أن يكون صورة')
    .refine((f) => f.size <= MAX_SCREENSHOT_BYTES, 'الحجم الأقصى 10MB'),
});

type PaymentInput = z.infer<typeof paymentSchema>;

export function PaymentDialog({ open, course, onClose }: PaymentDialogProps) {
  const infoQuery = usePaymentInfo(open ? course.slug : undefined);
  const submitMut = useSubmitPaymentRequest(course.id, course.slug);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { senderPhoneNumber: '' },
  });

  // Reset form & error state every time the dialog (re)opens
  useEffect(() => {
    if (open) {
      reset({ senderPhoneNumber: '' });
      submitMut.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submitMut.mutateAsync({
        senderPhoneNumber: egyptianLocalToE164(values.senderPhoneNumber),
        screenshot: values.screenshot,
      });
      toast.success('تم إرسال طلبك. سيتم مراجعته خلال 24 ساعة.');
      onClose();
    } catch {
      /* surfaced inline */
    }
  });

  const submitError =
    submitMut.error instanceof HttpError ? submitMut.error.message : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="إتمام الاشتراك"
      description={course.title}
      size="md"
      closeOnBackdrop={!submitMut.isPending}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitMut.isPending}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            form="payment-form"
            loading={submitMut.isPending}
            disabled={infoQuery.isLoading}
          >
            تأكيد إرسال الطلب
          </Button>
        </>
      }
    >
      {infoQuery.isLoading && <PaymentInfoSkeleton />}

      {infoQuery.error && (
        <Alert tone="danger">
          تعذّر تحميل تعليمات الدفع
          {infoQuery.error instanceof HttpError
            ? ` — ${infoQuery.error.message}`
            : ''}
        </Alert>
      )}

      {infoQuery.data && (
        <>
          <PaymentInfoBlock info={infoQuery.data} />

          <div className="my-4 h-px bg-[var(--color-line)]" />

          <form id="payment-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <TextField
              label="رقم الهاتف الذي حوّلت منه"
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="01012345678"
              hint="رقم محمول مصري (11 رقم)"
              iconStart={<Phone />}
              error={errors.senderPhoneNumber?.message}
              {...register('senderPhoneNumber')}
            />

            <Controller
              control={control}
              name="screenshot"
              render={({ field }) => (
                <ScreenshotPicker
                  value={(field.value as File | undefined) ?? null}
                  onChange={field.onChange}
                  error={errors.screenshot?.message as string | undefined}
                />
              )}
            />

            {submitError && (
              <Alert tone="danger">
                <AlertCircle className="mt-0.5 inline size-3.5" /> {submitError}
              </Alert>
            )}
          </form>
        </>
      )}
    </Dialog>
  );
}

/* =================== sub-components =================== */

function PaymentInfoBlock({ info }: { info: PaymentInfo }) {
  const localPhone = egyptianE164ToLocal(info.recipientPhone);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localPhone);
      toast.success('تم نسخ الرقم');
    } catch {
      toast.error('تعذّر النسخ — انسخه يدوياً');
    }
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-4">
      <div className="mb-3 text-[13px] font-bold text-[var(--color-ink-700)]">
        خطوات الاشتراك
      </div>

      <ol className="flex flex-col gap-3 text-[13.5px] text-[var(--color-ink-700)]">
        <Step number={1} title="حوّل المبلغ إلى الرقم التالي:">
          <div className="mt-1.5 flex items-center justify-between gap-3 rounded-md border border-[var(--color-line-strong)] bg-white px-3 py-2">
            <span dir="ltr" className="font-mono text-[15px] font-bold text-[var(--color-ink-900)] tabular-nums">
              {localPhone}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-semibold text-[var(--color-brand-blue)] transition-colors hover:bg-[var(--color-brand-blue-100)]"
            >
              <Copy className="size-3.5" /> نسخ
            </button>
          </div>
        </Step>

        <Step number={2} title="المبلغ المطلوب:">
          <div dir="ltr" className="mt-0.5 inline-flex items-baseline gap-1 font-bold text-[var(--color-ink-900)]">
            <span className="text-[18px] tabular-nums">{info.amount}</span>
            <span className="text-[13px] text-[var(--color-ink-500)]">{info.currency}</span>
          </div>
        </Step>

        <Step number={3} title="ارفع لقطة شاشة من إثبات التحويل:">
          <p className="m-0 mt-0.5 text-[13px] leading-[1.7] text-[var(--color-ink-600)]">
            {info.instructions}
          </p>
        </Step>
      </ol>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-blue)] text-[12px] font-bold text-white tabular-nums">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[var(--color-ink-800)]">{title}</div>
        {children}
      </div>
    </li>
  );
}

function ScreenshotPicker({
  value,
  onChange,
  error,
}: {
  value: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div>
      <div className="mb-1.5 text-[13px] font-semibold text-[var(--color-ink-700)]">
        لقطة شاشة من إثبات التحويل
      </div>

      {preview ? (
        <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line-strong)]">
          <img
            src={preview}
            alt="معاينة لقطة الشاشة"
            className="block h-[180px] w-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute end-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85"
            aria-label="إزالة الصورة"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed bg-[var(--color-surface-muted)] p-6 text-center transition-colors hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-50)]',
            error
              ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]'
              : 'border-[var(--color-line-strong)]',
          )}
        >
          <ImageIcon className="size-7 text-[var(--color-ink-400)]" aria-hidden />
          <div className="text-[13.5px] font-semibold text-[var(--color-ink-700)]">
            اضغط لاختيار صورة
          </div>
          <div className="text-[11.5px] text-[var(--color-ink-500)]">
            PNG / JPG · حتى 10MB
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

function PaymentInfoSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-[var(--color-ink-400)]">
      <Loader2 className="size-5 animate-spin" />
      <span className="text-[13px]">جاري تحميل تعليمات الدفع…</span>
    </div>
  );
}
