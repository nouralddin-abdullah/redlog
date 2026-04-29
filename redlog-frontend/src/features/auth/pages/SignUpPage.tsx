import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Divider } from '@/features/auth/components/Divider';
import { GoogleButton } from '@/features/auth/components/GoogleButton';
import { signUpSchema, type SignUpInput } from '@/features/auth/schemas';
import { useSignUp } from '@/features/auth/hooks';
import { detectDefaults } from '@/features/auth/locale-data';
import { Button } from '@/shared/components/ui/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Alert } from '@/shared/components/ui/Alert';
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload';
import { HttpError } from '@/shared/api/client';

export function SignUpPage() {
  const navigate = useNavigate();
  const signUp = useSignUp();

  /** Auto-derived from the browser at mount; users don't pick these. */
  const detected = useMemo(() => detectDefaults(), []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      country: '',
      timezone: '',
      avatar: null,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp.mutateAsync({
        ...values,
        country: detected.country,
        timezone: detected.timezone,
      });
      toast.success('أهلاً بك في Radlog! تم إنشاء حسابك بنجاح');
      navigate('/', { replace: true });
    } catch {
      /* surfaced via signUp.error below */
    }
  });

  const serverError =
    signUp.error instanceof HttpError ? signUp.error.message : null;

  return (
    <AuthLayout
      headline={
        <>
          انضم إلى مجتمع
          <br />
          تعليم الأشعة الأول.
        </>
      }
      description={
        <>
          أنشئ حسابك خلال دقيقة، ابدأ كورسك الأول مجاناً، وانضم لأكثر من
          ٣٫٥٠٠ طالب وممارس يطورون مهاراتهم في تشخيص الأشعة كل يوم.
        </>
      }
      footer={
        <>
          لديك حساب بالفعل؟{' '}
          <Link
            to="/auth/signin"
            className="font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
          >
            سجّل دخول
          </Link>
        </>
      }
    >
      <header className="mb-7">
        <h2 className="text-[28px] font-bold leading-tight tracking-[-0.01em] text-[var(--color-ink-900)]">
          أنشئ حسابك
        </h2>
        <p className="mt-1.5 text-[15px] text-[var(--color-ink-500)]">
          ابدأ رحلتك التعليمية في الأشعة اليوم — مجاناً.
        </p>
      </header>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="avatar"
          render={({ field }) => (
            <AvatarUpload
              value={field.value ?? null}
              onChange={field.onChange}
              error={errors.avatar?.message}
            />
          )}
        />

        <div className="hairline my-1" />

        <TextField
          label="الاسم الكامل"
          autoComplete="name"
          placeholder="مثل: أحمد محمد"
          iconStart={<User />}
          error={errors.name?.message}
          {...register('name')}
        />

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
          autoComplete="new-password"
          placeholder="••••••••"
          hint="8 أحرف على الأقل"
          iconStart={<Lock />}
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && <Alert tone="danger">{serverError}</Alert>}

        <Button
          type="submit"
          size="lg"
          block
          loading={isSubmitting || signUp.isPending}
          iconEnd={<ArrowLeft className="size-4" aria-hidden />}
        >
          إنشاء الحساب
        </Button>

        <Divider label="أو" />
        <GoogleButton label="إنشاء حساب بـ Google" />
      </form>
    </AuthLayout>
  );
}
