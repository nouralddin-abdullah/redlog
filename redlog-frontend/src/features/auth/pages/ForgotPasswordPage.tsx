import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/features/auth/schemas';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Alert } from '@/shared/components/ui/Alert';

export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // The reset-password endpoint isn't wired yet — we render the success state
  // optimistically so the flow is testable end-to-end as soon as it lands.
  const onSubmit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmittedEmail(values.email);
  });

  return (
    <AuthLayout
      headline={
        <>
          نسيت كلمة السر؟
          <br />
          لا قلق.
        </>
      }
      description={
        <>
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة السر.
          الرابط صالح لمدة ساعة واحدة فقط لحماية حسابك.
        </>
      }
      footer={
        <>
          تذكرت كلمة السر؟{' '}
          <Link
            to="/auth/signin"
            className="font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
          >
            ارجع لتسجيل الدخول
          </Link>
        </>
      }
    >
      {submittedEmail ? (
        <div>
          <div className="mb-6 inline-flex size-14 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
            <CheckCircle2 className="size-7" />
          </div>
          <h2 className="text-[26px] font-bold leading-tight tracking-[-0.01em] text-[var(--color-ink-900)]">
            تحقّق من بريدك
          </h2>
          <p className="mt-2 text-[15px] leading-[1.75] text-[var(--color-ink-600)]">
            أرسلنا رابط إعادة تعيين كلمة السر إلى{' '}
            <strong className="font-semibold text-[var(--color-ink-900)]">
              {submittedEmail}
            </strong>
            . إن لم تجده خلال دقيقتين، تحقق من مجلد البريد المزعج.
          </p>

          <div className="my-6 hairline" />

          <Alert tone="info">
            لم تتلق الرسالة؟{' '}
            <button
              type="button"
              onClick={() => setSubmittedEmail(null)}
              className="font-semibold underline-offset-2 hover:underline"
            >
              جرب بريداً مختلفاً
            </button>
          </Alert>
        </div>
      ) : (
        <>
          <header className="mb-9">
            <h2 className="text-[28px] font-bold leading-tight tracking-[-0.01em] text-[var(--color-ink-900)]">
              استعادة كلمة السر
            </h2>
            <p className="mt-1.5 text-[15px] text-[var(--color-ink-500)]">
              سنرسل لك رابطاً آمناً لإعادة التعيين.
            </p>
          </header>

          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label="البريد الإلكتروني"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              iconStart={<Mail />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              size="lg"
              block
              loading={isSubmitting}
              iconEnd={<ArrowRight className="size-4" aria-hidden />}
            >
              إرسال رابط الاستعادة
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
