import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Sliders } from 'lucide-react';

import { useTweaks, type TweaksState } from '@/features/instructor/tweaks-context';
import { cn } from '@/shared/lib/cn';

/**
 * Floating control panel that lets a reviewer flip the data shape behind the
 * instructor pages without editing fixtures. Lives bottom-end on every
 * instructor page (mounted by `<InstructorShell>`). Pure presentation — the
 * actual selectors live in `TweaksProvider`.
 */
export function TweaksPanel() {
  const { tweaks, setTweak, reset } = useTweaks();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="pointer-events-none fixed bottom-4 end-4 z-50 flex w-[300px] flex-col items-end gap-2"
      dir="rtl"
    >
      {open && (
        <div className="pointer-events-auto w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line-strong)] bg-white shadow-[var(--shadow-lg)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
            <div>
              <div className="text-[13.5px] font-bold text-[var(--color-ink-900)]">
                لوحة التجارب
              </div>
              <div className="text-[11px] text-[var(--color-ink-500)]">
                لمراجعة الحالات بدون تعديل البيانات
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-semibold text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)]"
              title="إعادة الضبط"
            >
              <RotateCcw className="size-3" />
              ضبط
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[var(--color-line)] text-[12.5px]">
            <ToggleRow
              label="قائمة كورسات فارغة"
              tweakKey="emptyCourses"
              tweaks={tweaks}
              setTweak={setTweak}
            />
            <ToggleRow
              label="قائمة طلاب فارغة"
              tweakKey="emptyStudents"
              tweaks={tweaks}
              setTweak={setTweak}
            />
            <ToggleRow
              label="نشاط فارغ"
              tweakKey="emptyActivity"
              tweaks={tweaks}
              setTweak={setTweak}
            />
            <ToggleRow
              label="أرباح صفرية"
              tweakKey="zeroEarnings"
              tweaks={tweaks}
              setTweak={setTweak}
            />
            <ToggleRow
              label="إخفاء الأرقام المالية"
              tweakKey="hideMoney"
              tweaks={tweaks}
              setTweak={setTweak}
            />

            <div className="px-4 py-3">
              <div className="mb-1.5 font-semibold text-[var(--color-ink-700)]">
                فلتر حالة الكورس
              </div>
              <select
                value={tweaks.courseStatusFilter}
                onChange={(e) =>
                  setTweak(
                    'courseStatusFilter',
                    e.target.value as TweaksState['courseStatusFilter'],
                  )
                }
                className="h-9 w-full rounded-[8px] border border-[var(--color-line-strong)] bg-white px-2.5 text-[12.5px] text-[var(--color-ink-800)] outline-none focus:border-[var(--color-brand-blue)]"
              >
                <option value="all">الكل</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
                <option value="pending_review">قيد المراجعة</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full bg-[var(--color-brand-navy)] px-4 text-[12.5px] font-semibold text-white shadow-[var(--shadow-md)] hover:bg-[var(--color-brand-navy-700)]"
      >
        <Sliders className="size-4" />
        لوحة التجارب
        {open ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronUp className="size-3.5" />
        )}
      </button>
    </div>
  );
}

function ToggleRow({
  label,
  tweakKey,
  tweaks,
  setTweak,
}: {
  label: string;
  tweakKey: keyof Omit<TweaksState, 'courseStatusFilter'>;
  tweaks: TweaksState;
  setTweak: <K extends keyof TweaksState>(key: K, value: TweaksState[K]) => void;
}) {
  const value = tweaks[tweakKey];
  return (
    <label className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-[var(--color-surface-soft)]">
      <span className="text-[var(--color-ink-700)]">{label}</span>
      <span
        className={cn(
          'relative inline-block h-[20px] w-[34px] rounded-full transition-colors',
          value ? 'bg-[var(--color-brand-blue)]' : 'bg-[var(--color-line-strong)]',
        )}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => setTweak(tweakKey, e.target.checked)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <span
          className={cn(
            'absolute top-[2px] size-[16px] rounded-full bg-white transition-[inset-inline-end] duration-150',
            value ? 'end-[2px]' : 'end-[16px]',
          )}
        />
      </span>
    </label>
  );
}
