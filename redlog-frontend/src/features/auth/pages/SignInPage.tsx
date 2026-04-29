import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Divider } from '@/features/auth/components/Divider';
import { GoogleButton } from '@/features/auth/components/GoogleButton';
import { signInSchema, type SignInInput } from '@/features/auth/schemas';
import { useSignIn } from '@/features/auth/hooks';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn.mutateAsync({ email: values.email, password: values.password });
      toast.success('تم تسجيل الدخول بنجاح');
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(redirectTo, { replace: true });
    } catch {
      /* surfaced via signIn.error below */
    }
  });

  const serverError =
    signIn.error instanceof HttpError ? signIn.error.message : null;

  return (
    <AuthLayout
      headline={
        <>
          ابنِ خبرتك في الأشعة
          <br />
          خطوة بخطوة.
        </>
      }
      description={
        <>
          منصة Radlog هي بيتك التعليمي لتعلم الأشعة التشخيصية والعلاجية،
          بمحاضرات مبسطة، اختبارات تفاعلية، ومجتمع نشط من الطلبة والمحاضرين.
        </>
      }
      footer={
        <>
          ليس لديك حساب؟{' '}
          <Link
            to="/auth/signup"
            className="font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
          >
            أنشئ حساباً جديداً
          </Link>
        </>
      }
    >
      <header className="mb-9">
        <h2 className="text-[28px] font-bold leading-tight tracking-[-0.01em] text-[var(--color-ink-900)]">
          أهلاً بعودتك
        </h2>
        <p className="mt-1.5 text-[15px] text-[var(--color-ink-500)]">
          ادخل لمتابعة كورساتك ومناقشاتك في المجتمع.
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

        <TextField
          label="كلمة السر"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          iconStart={<Lock />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="-mt-1 flex items-center justify-between text-[13px]">
          <label className="flex cursor-pointer items-center gap-2 text-[var(--color-ink-600)]">
            <input
              type="checkbox"
              className="size-4 cursor-pointer rounded border-[var(--color-line-strong)] accent-[var(--color-brand-blue)]"
              {...register('remember')}
            />
            <span>تذكرني</span>
          </label>
          <Link
            to="/auth/forgot-password"
            className="font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
          >
            نسيت كلمة السر؟
          </Link>
        </div>

        {serverError && <Alert tone="danger">{serverError}</Alert>}

        <Button
          type="submit"
          size="lg"
          block
          loading={isSubmitting || signIn.isPending}
          iconEnd={<ArrowLeft className="size-4" aria-hidden />}
        >
          تسجيل الدخول
        </Button>

        <Divider label="أو" />
        <GoogleButton />
      </form>
    </AuthLayout>
  );
}
