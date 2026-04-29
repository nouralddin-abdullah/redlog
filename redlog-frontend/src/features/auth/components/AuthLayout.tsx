import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Logo } from '@/shared/components/branding/Logo';

interface AuthLayoutProps {
  /** Main heading shown on the brand panel. */
  headline: ReactNode;
  /** Body copy under the headline. */
  description: ReactNode;
  /** Right-rail form content. */
  children: ReactNode;
  /** Optional supplementary content under the form (e.g. footer link). */
  footer?: ReactNode;
}

const STATS = [
  { value: '+12', label: 'كورس متخصص' },
  { value: '+3,500', label: 'طالب نشط' },
  { value: '4.9★', label: 'تقييم المنصة' },
];

export function AuthLayout({
  headline,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* ============== LEFT — brand canvas ============== */}
      <aside
        className="relative isolate overflow-hidden bg-[var(--color-brand-navy)] text-white lg:min-h-screen"
        style={{
          backgroundImage:
            'radial-gradient(900px 600px at 90% 0%, rgba(111,160,209,0.20), transparent 60%),' +
            'linear-gradient(160deg, #0E2A47 0%, #15375E 60%, #234876 100%)',
        }}
      >
        <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-between gap-12 p-10 lg:min-h-screen lg:p-14">
          <Logo size={36} mono />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[520px]"
          >
            <h1 className="text-balance text-[clamp(30px,4vw,44px)] font-bold leading-[1.25] tracking-[-0.01em]">
              {headline}
            </h1>

            <p className="mt-5 text-[16px] leading-[1.85] text-white/75 text-pretty">
              {description}
            </p>

            <div className="mt-12 flex items-end gap-10 text-[14px] text-white/85">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-[26px] font-bold tabular-nums leading-none">
                    {s.value}
                  </div>
                  <div className="mt-2 text-[13px] text-white/55">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-[12.5px] text-white/55">
            © 2026 Radlog. جميع الحقوق محفوظة.
          </div>
        </div>
      </aside>

      {/* ============== RIGHT — form panel ============== */}
      <main className="relative flex min-h-screen flex-col bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="lg:hidden">
          <Logo size={28} />
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {children}
          </motion.div>

          {footer && (
            <div className="mt-8 text-center text-[14px] text-[var(--color-ink-600)]">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
