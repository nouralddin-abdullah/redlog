import { Sparkles } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-20 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-amber-soft)] px-3 py-1.5 text-[12px] font-semibold tracking-wide text-[var(--color-accent-amber-700)]">
        <Sparkles className="size-3.5" />
        قريباً
      </div>
      <h1 className="mt-5 text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
        {title}
      </h1>
      <p className="mx-auto mt-2 max-w-[460px] text-pretty text-[15px] leading-[1.8] text-[var(--color-ink-500)]">
        {description ?? 'هذا القسم قيد البناء — سيكون متاحاً في الخطوة القادمة من المشروع.'}
      </p>
    </div>
  );
}
