import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Award, CheckCircle2, Search, ShieldX } from 'lucide-react';

import { useVerifyCertificate } from '@/features/certificates/hooks';
import type { CertificateVerifyResult } from '@/features/certificates/types';
import { Logo } from '@/shared/components/branding/Logo';
import { Button } from '@/shared/components/ui/Button';
import { HttpError } from '@/shared/api/client';

/**
 * Public certificate verification — no auth required. Two modes:
 *   - With a `:code` route param: looks up + renders the result.
 *   - Without: shows a search box so a verifier can paste a code in.
 *
 * The route is rendered outside the auth-gated tree so an HR reviewer can
 * land here from a printed PDF or LinkedIn link without signing in.
 */
export function VerifyCertificatePage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    navigate(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-soft)]">
      <header className="border-b border-[var(--color-line)] bg-white px-6 py-4 sm:px-10">
        <Link to="/" className="inline-flex">
          <Logo size={30} />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]">
            <Award className="size-7" />
          </div>
          <h1 className="text-[26px] font-bold text-[var(--color-ink-900)] sm:text-[32px]">
            التحقق من الشهادة
          </h1>
          <p className="mt-1.5 text-[14px] text-[var(--color-ink-500)] sm:text-[15px]">
            أدخل رقم الشهادة للتأكد من صحتها وعرض بياناتها العامة.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[480px] flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="cert-code" className="sr-only">
            رقم الشهادة
          </label>
          <input
            id="cert-code"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="RDLG-2026-XXXX-XXXX"
            dir="ltr"
            autoFocus
            className="h-11 flex-1 rounded-[10px] border border-[var(--color-line-strong)] bg-white px-3.5 font-mono text-[14px] text-[var(--color-ink-900)] outline-none transition-shadow focus:border-[var(--color-brand-blue)] focus:shadow-[var(--color-brand-blue-100)_0_0_0_3px]"
          />
          <Button type="submit" iconStart={<Search className="size-4" />}>
            تحقق
          </Button>
        </form>

        {code && <VerifyResult code={code} />}
      </main>
    </div>
  );
}

function VerifyResult({ code }: { code: string }) {
  const query = useVerifyCertificate(code);

  if (query.isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-6">
        <span className="size-6 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-brand-blue)]" />
      </div>
    );
  }

  // 404 (or any other error) → invalid card. We don't distinguish 404 from
  // network errors in the UI here — both end up at "we couldn't verify this"
  // and the user can retry.
  if (query.error) {
    const status = query.error instanceof HttpError ? query.error.status : 0;
    return <InvalidCard reason={status === 404 ? 'not-found' : 'network'} />;
  }

  if (!query.data) return null;
  return <ValidCard cert={query.data} />;
}

function ValidCard({ cert }: { cert: CertificateVerifyResult }) {
  const issued = new Date(cert.issuedAt).toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <section className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-white shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-3 border-b border-[var(--color-success)] bg-[var(--color-success-soft)] px-5 py-3.5">
        <CheckCircle2 className="size-5 text-[var(--color-success)]" />
        <span className="font-semibold text-[var(--color-success)]">
          الشهادة سارية وموثّقة
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2">
        <Field label="اسم الطالب" value={cert.studentName} />
        <Field label="المحاضر" value={cert.instructorName} />
        <Field label="الكورس" value={cert.courseTitle} span2 />
        <Field label="تاريخ الإصدار" value={issued} />
        <Field
          label="رقم الشهادة"
          value={cert.certificateNumber}
          mono
        />
      </dl>
    </section>
  );
}

function InvalidCard({ reason }: { reason: 'not-found' | 'network' }) {
  return (
    <section className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-danger)] bg-white shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-3 border-b border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-5 py-3.5">
        <ShieldX className="size-5 text-[var(--color-danger)]" />
        <span className="font-semibold text-[var(--color-danger)]">
          {reason === 'not-found'
            ? 'هذه الشهادة غير موجودة'
            : 'تعذّر التحقق من الشهادة'}
        </span>
      </div>
      <div className="px-5 py-5 text-[14px] text-[var(--color-ink-600)]">
        {reason === 'not-found'
          ? 'تحقّق من الرقم وحاول مرة أخرى. الأرقام تأتي بالشكل RDLG-YYYY-XXXX-XXXX.'
          : 'حدثت مشكلة في الاتصال. حاول مجدداً بعد قليل.'}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
  span2,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <dt className="mb-1 text-[12px] text-[var(--color-ink-500)]">{label}</dt>
      <dd
        className={
          'text-[15px] font-semibold text-[var(--color-ink-900)]' +
          (mono ? ' font-mono tracking-[0.05em]' : '')
        }
        dir={mono ? 'ltr' : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
