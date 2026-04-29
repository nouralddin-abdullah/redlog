import { Check } from 'lucide-react';
import type { Course } from '@/features/courses/types';

interface OverviewTabProps {
  course: Course;
}

export function OverviewTab({ course }: OverviewTabProps) {
  const paragraphs = course.longDescription
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      <h2 className="m-0 mb-4 text-[22px] font-bold">ماذا ستتعلم في هذا الكورس؟</h2>
      <div className="learnings-grid mb-8 grid grid-cols-1 gap-3.5 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-6 sm:grid-cols-2">
        {course.whatYouWillLearn.map((l) => (
          <div
            key={l}
            className="flex items-start gap-2.5 text-[14px] leading-[1.6]"
          >
            <Check
              className="mt-0.5 size-[18px] shrink-0 text-[var(--color-success)]"
              aria-hidden
            />
            <span>{l}</span>
          </div>
        ))}
      </div>

      {course.prerequisites.length > 0 && (
        <>
          <h2 className="m-0 mb-3 text-[22px] font-bold">المتطلبات الأساسية</h2>
          <ul className="mb-8 list-disc pe-5 leading-[1.9] text-[var(--color-ink-700)]">
            {course.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}

      <h2 className="m-0 mb-3 text-[22px] font-bold">وصف الكورس</h2>
      <div className="text-[15px] leading-[1.9] text-[var(--color-ink-700)]">
        {paragraphs.map((p, i) => (
          <p key={i} className={i > 0 ? 'mt-3.5' : ''}>
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
