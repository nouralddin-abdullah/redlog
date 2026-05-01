import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, Printer, Share2, Award } from 'lucide-react';
import { toast } from 'sonner';

import { useCertificate } from '@/features/certificates/hooks';
import type { Certificate } from '@/features/certificates/types';
import { Logo } from '@/shared/components/branding/Logo';
import { Button } from '@/shared/components/ui/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';

/**
 * Full-screen certificate render. Backend deliberately does NOT generate
 * PDFs — "Download" is the browser's print dialog (Save as PDF), and we
 * apply a print stylesheet so only the certificate canvas hits paper.
 *
 * Layout sized for A4 landscape (~1123×794 at 96dpi). Certificate scales
 * down on smaller viewports via responsive padding; for print the canvas
 * is fixed-size and centered on the page.
 */
export function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const certQuery = useCertificate(id);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async (cert: Certificate) => {
    const verifyUrl = `${window.location.origin}/verify/${cert.certificateNumber}`;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success('تم نسخ رابط التحقق من الشهادة');
    } catch {
      // Clipboard API unavailable (insecure context, denied permission).
      // Fall back to a prompt the user can copy manually.
      toast.message('انسخ الرابط يدوياً', { description: verifyUrl });
    }
  };

  if (certQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (certQuery.error || !certQuery.data) {
    return (
      <BlockingScreen
        title="تعذّر تحميل الشهادة"
        message={
          certQuery.error instanceof HttpError
            ? certQuery.error.message
            : 'الشهادة غير موجودة أو ليست لك.'
        }
        ctaHref="/certificates"
        ctaLabel="العودة للشهادات"
      />
    );
  }

  const cert = certQuery.data;

  return (
    <div className="min-h-screen bg-[var(--color-surface-soft)]">
      {/* === Top action bar — hidden when printing ============================= */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-white px-6 py-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/certificates')}
          iconStart={<ChevronRight className="size-4" />}
        >
          العودة للشهادات
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare(cert)}
            iconStart={<Share2 className="size-4" />}
          >
            مشاركة
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            iconStart={<Printer className="size-4" />}
          >
            طباعة / حفظ PDF
          </Button>
        </div>
      </header>

      {/* === Certificate canvas =============================================== */}
      <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-10 print:max-w-none print:p-0">
        <CertificateCanvas cert={cert} />
      </main>
    </div>
  );
}

function CertificateCanvas({ cert }: { cert: Certificate }) {
  const issued = new Date(cert.issuedAt).toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${cert.certificateNumber}`;

  return (
    <article
      className="cert-canvas relative mx-auto aspect-[1.414/1] w-full overflow-hidden bg-white text-[var(--color-ink-900)] shadow-[0_24px_60px_rgba(15,27,45,.18)] ring-1 ring-[var(--color-line)] print:aspect-auto print:h-screen print:w-screen print:shadow-none print:ring-0"
      style={{
        // Subtle gradient background for vintage feel.
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(59,111,168,0.05), transparent 40%), radial-gradient(circle at 100% 100%, rgba(232,165,94,0.05), transparent 40%)',
      }}
    >
      {/* Decorative corner ornaments */}
      <CornerOrnament className="absolute start-6 top-6" />
      <CornerOrnament className="absolute end-6 top-6" flip />
      <CornerOrnament className="absolute start-6 bottom-6" flipV />
      <CornerOrnament className="absolute end-6 bottom-6" flip flipV />

      {/* Inner border frame */}
      <div className="absolute inset-[28px] rounded-[8px] border-[3px] border-double border-[var(--color-brand-navy)] sm:inset-[40px]" />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-between px-8 py-12 text-center sm:px-16 sm:py-16">
        {/* Header — logo + title */}
        <header className="flex flex-col items-center gap-3">
          <Logo size={36} />
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-blue-50)] px-4 py-1.5 text-[12px] font-semibold tracking-wider text-[var(--color-brand-blue-700)]">
            <Award className="size-3.5" />
            شهادة إتمام
          </div>
          <h1 className="font-display text-[28px] font-bold leading-tight text-[var(--color-brand-navy)] sm:text-[40px]">
            CERTIFICATE OF COMPLETION
          </h1>
        </header>

        {/* Body */}
        <section className="flex flex-col items-center gap-3 sm:gap-5">
          <p className="text-[14px] text-[var(--color-ink-600)] sm:text-[16px]">
            تشهد منصة Radlog أن
          </p>
          <h2
            className="font-display text-[32px] font-bold leading-tight text-[var(--color-brand-navy)] sm:text-[48px]"
            style={{ letterSpacing: '0.01em' }}
          >
            {cert.studentName}
          </h2>
          <div
            className="h-px w-[260px] sm:w-[360px]"
            style={{
              background:
                'linear-gradient(to left, transparent, var(--color-brand-navy), transparent)',
            }}
          />
          <p className="text-[14px] text-[var(--color-ink-600)] sm:text-[16px]">
            قد أتمّ بنجاح كورس
          </p>
          <h3 className="max-w-[800px] text-[20px] font-bold leading-snug text-[var(--color-ink-900)] sm:text-[26px]">
            {cert.courseTitle}
          </h3>
          <p className="text-[13px] text-[var(--color-ink-600)] sm:text-[15px]">
            بإشراف{' '}
            <span className="font-semibold text-[var(--color-ink-900)]">
              {cert.instructorName}
            </span>
          </p>
        </section>

        {/* Footer — issue date + cert number + verify hint */}
        <footer className="grid w-full grid-cols-3 items-end gap-4 text-[11px] sm:text-[12.5px]">
          <div className="text-start">
            <div className="mb-1 text-[var(--color-ink-500)]">تاريخ الإصدار</div>
            <div className="font-semibold text-[var(--color-ink-900)]">
              {issued}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-[var(--color-ink-500)]">رقم الشهادة</div>
            <div
              className="font-mono font-semibold tracking-[0.05em] text-[var(--color-brand-navy)]"
              style={{ direction: 'ltr' }}
            >
              {cert.certificateNumber}
            </div>
          </div>
          <div className="text-end">
            <div className="mb-1 text-[var(--color-ink-500)]">تحقق من الشهادة</div>
            <div
              className="break-all font-mono text-[10px] font-semibold text-[var(--color-brand-blue-700)] sm:text-[11px]"
              style={{ direction: 'ltr' }}
            >
              {verifyUrl.replace(/^https?:\/\//, '')}
            </div>
          </div>
        </footer>
      </div>

      {/* Print-specific styling: keep colors true, force page size, suppress
          margins added by the browser around print content. */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: #fff !important; }
          .cert-canvas {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </article>
  );
}

function CornerOrnament({
  className = '',
  flip = false,
  flipV = false,
}: {
  className?: string;
  flip?: boolean;
  flipV?: boolean;
}) {
  const transform = `${flip ? 'scaleX(-1)' : ''} ${flipV ? 'scaleY(-1)' : ''}`.trim();
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 56 56"
      aria-hidden
      className={className}
      style={{ transform }}
    >
      <path
        d="M2 2h22M2 2v22M10 10h12M10 10v12"
        stroke="var(--color-accent-amber)"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={2} cy={2} r={2} fill="var(--color-brand-navy)" />
    </svg>
  );
}

/* ============== loading + blocking screens ============== */

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-soft)]">
      <div className="flex flex-col items-center gap-3 text-[var(--color-ink-500)]">
        <span className="size-7 animate-spin rounded-full border-2 border-[var(--color-line-strong)] border-t-[var(--color-brand-blue)]" />
        <span className="text-[13.5px]">جاري التحميل…</span>
      </div>
    </div>
  );
}

function BlockingScreen({
  title,
  message,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-soft)]">
      <header className="border-b border-[var(--color-line)] bg-white px-8 py-5">
        <Logo size={28} />
      </header>
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-[24px] font-bold text-[var(--color-ink-900)]">
          {title}
        </h1>
        <Alert tone="info" className="my-5 w-full text-start">
          {message}
        </Alert>
        <Link
          to={ctaHref}
          className="btn-base h-11 rounded-[10px] bg-[var(--color-brand-navy)] px-5 text-sm text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-12px_rgba(14,42,71,0.65)] hover:bg-[var(--color-brand-navy-700)]"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
