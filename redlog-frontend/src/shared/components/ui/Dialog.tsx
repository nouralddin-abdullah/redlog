import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: Size;
  /** Click on the backdrop closes the dialog. Defaults to true. */
  closeOnBackdrop?: boolean;
  children: ReactNode;
  /** Slot rendered at the bottom of the dialog with a top border. */
  footer?: ReactNode;
  /** Hide the X close button (e.g. for a forced confirmation step). */
  hideClose?: boolean;
}

/**
 * Accessible modal built on the native <dialog> element. Browser handles
 * focus trapping, ESC, and the modal-on-top stacking context. We add body
 * scroll locking and click-outside-to-close on the backdrop.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  hideClose,
  children,
  footer,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        // ESC fires `cancel`; we want our handler to run, not the default.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === ref.current) onClose();
      }}
      dir="rtl"
      className={cn(
        'm-auto w-[calc(100%-32px)] rounded-[var(--radius-lg)] border-0 bg-white p-0 text-[var(--color-ink-800)] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.45)] outline-none',
        'backdrop:bg-[rgba(15,27,45,0.55)] backdrop:backdrop-blur-[2px]',
        SIZE[size],
      )}
    >
      {(title || !hideClose) && (
        <div className="flex items-start gap-4 border-b border-[var(--color-line)] px-5 py-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="m-0 text-[18px] font-bold text-[var(--color-ink-900)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-[13.5px] text-[var(--color-ink-500)]">
                {description}
              </p>
            )}
          </div>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="-mt-1 rounded-md p-1.5 text-[var(--color-ink-500)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-line)] px-5 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
