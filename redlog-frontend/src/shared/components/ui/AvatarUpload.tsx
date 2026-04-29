import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface AvatarUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({ value, onChange, error }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFile = (file: File | undefined) => {
    setLocalError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalError('يجب أن يكون الملف صورة');
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('الحجم الأقصى للصورة 5 ميجابايت');
      return;
    }
    onChange(file);
  };

  const displayError = error ?? localError;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative size-[68px] shrink-0 overflow-hidden rounded-full border border-dashed transition-all',
          preview
            ? 'border-[var(--color-line-strong)]'
            : 'border-[var(--color-line-strong)] bg-[var(--color-surface-muted)] hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-50)]',
          displayError && 'border-[var(--color-danger)]',
        )}
        aria-label="رفع صورة شخصية"
      >
        {preview ? (
          <img src={preview} alt="معاينة الصورة" className="size-full object-cover" />
        ) : (
          <Camera className="absolute inset-0 m-auto size-6 text-[var(--color-ink-400)] transition-colors group-hover:text-[var(--color-brand-blue)]" />
        )}
        {preview && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-white" />
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-[var(--color-ink-700)]">
          الصورة الشخصية
          <span className="mr-1.5 text-[11px] font-medium text-[var(--color-ink-400)]">
            (اختياري)
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-[var(--color-ink-500)]">
          PNG / JPG ، حتى 5MB
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-[12.5px] font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
          >
            {value ? 'تغيير الصورة' : 'اختر صورة'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--color-ink-500)] hover:text-[var(--color-danger)]"
            >
              <X className="size-3.5" /> إزالة
            </button>
          )}
        </div>

        {displayError && (
          <p role="alert" className="mt-1 text-[12.5px] font-medium text-[var(--color-danger)]">
            {displayError}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
