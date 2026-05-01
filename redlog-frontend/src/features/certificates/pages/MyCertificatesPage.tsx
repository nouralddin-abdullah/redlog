import { Link } from 'react-router-dom';
import { Award, ExternalLink } from 'lucide-react';

import { useMyCertificates } from '@/features/certificates/hooks';
import type { Certificate } from '@/features/certificates/types';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';

export function MyCertificatesPage() {
  const certsQuery = useMyCertificates();

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          شهاداتي
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          الشهادات التي حصلت عليها بعد إتمام كورساتك. تُصدر تلقائياً عند إكمال
          آخر درس.
        </p>
      </header>

      {certsQuery.isLoading && <SkeletonGrid />}

      {certsQuery.error && (
        <Alert tone="warning">
          تعذّر تحميل شهاداتك
          {certsQuery.error instanceof HttpError
            ? ` — ${certsQuery.error.message}`
            : ''}
        </Alert>
      )}

      {certsQuery.data && certsQuery.data.length === 0 && <EmptyState />}

      {certsQuery.data && certsQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {certsQuery.data.map((c) => (
            <CertificateCard key={c.id} certificate={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CertificateCard({ certificate: c }: { certificate: Certificate }) {
  const issued = new Date(c.issuedAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <Link
      to={`/certificates/${c.id}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      <div
        className="relative flex h-[140px] items-center justify-center text-white"
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-brand-blue-700) 100%)',
        }}
      >
        {c.course.thumbnail && (
          <img
            src={c.course.thumbnail}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
            className="absolute inset-0 size-full object-cover opacity-30"
          />
        )}
        <span className="relative flex size-14 items-center justify-center rounded-full bg-[var(--color-accent-amber)] text-[var(--color-brand-navy)] shadow-[0_8px_20px_rgba(0,0,0,.25)]">
          <Award className="size-7" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-[18px]">
        <div className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-brand-blue-700)]">
          شهادة إتمام
        </div>
        <h3 className="m-0 mb-2 line-clamp-2 text-[16px] font-bold leading-[1.4] text-[var(--color-ink-900)]">
          {c.courseTitle}
        </h3>
        <div className="mb-3 text-[13px] text-[var(--color-ink-600)]">
          {c.instructorName}
        </div>
        <div className="mb-4 text-[12.5px] text-[var(--color-ink-500)]">
          صدرت في {issued}
        </div>
        <div className="mt-auto flex items-center justify-between text-[12.5px]">
          <span className="font-mono tabular-nums tracking-[0.05em] text-[var(--color-ink-700)]">
            {c.certificateNumber}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand-blue)] group-hover:text-[var(--color-brand-blue-700)]">
            عرض الشهادة
            <ExternalLink className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
        <Award className="size-6" />
      </div>
      <h2 className="m-0 mb-1.5 text-[18px] font-bold text-[var(--color-ink-900)]">
        لا توجد شهادات بعد
      </h2>
      <p className="mb-5 max-w-[420px] text-[14px] text-[var(--color-ink-500)]">
        أكمل أحد كورساتك لتحصل على شهادة إتمام تلقائياً تستطيع طباعتها أو
        مشاركتها مع أي جهة لتأكيد إنجازك.
      </p>
      <Link
        to="/my-courses"
        className="btn-base inline-flex h-11 items-center justify-center rounded-[10px] bg-[var(--color-brand-navy)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-brand-navy-700)]"
      >
        كورساتي
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-[300px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
        />
      ))}
    </div>
  );
}
