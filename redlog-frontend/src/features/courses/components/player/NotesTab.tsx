import { useEffect, useMemo, useState } from 'react';
import { Clock, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  useCreateNote,
  useDeleteNote,
  useLessonNotes,
  useUpdateNote,
} from '@/features/notes/hooks';
import type { LessonNote } from '@/features/notes/types';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { HttpError } from '@/shared/api/client';
import { cn } from '@/shared/lib/cn';

interface NotesTabProps {
  lessonId: string | null;
  /** Current playback time in seconds — captured when the user creates a note. */
  currentTime: number;
  /** Seek the player to a specific second (used when clicking a timestamp). */
  onSeek: (seconds: number) => void;
}

const NOTE_MAX = 1000;

export function NotesTab({ lessonId, currentTime, onSeek }: NotesTabProps) {
  const notesQuery = useLessonNotes(lessonId ?? undefined);
  const createMut = useCreateNote(lessonId ?? '');
  const updateMut = useUpdateNote(lessonId ?? '');
  const deleteMut = useDeleteNote(lessonId ?? '');

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedNotes = useMemo(
    () =>
      (notesQuery.data ?? [])
        .slice()
        .sort((a, b) => a.timestampSeconds - b.timestampSeconds),
    [notesQuery.data],
  );

  if (!lessonId) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] py-12 text-center text-[14px] text-[var(--color-ink-500)]">
        اختر درساً لبدء كتابة الملاحظات.
      </div>
    );
  }

  const handleCreate = async () => {
    const value = text.trim();
    if (!value) return;
    try {
      await createMut.mutateAsync({
        text: value,
        timestampSeconds: Math.max(0, Math.floor(currentTime)),
      });
      setText('');
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر حفظ الملاحظة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل تريد حذف هذه الملاحظة؟')) return;
    try {
      await deleteMut.mutateAsync(id);
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر حذف الملاحظة');
    }
  };

  const handleUpdate = async (id: string, newText: string) => {
    const value = newText.trim();
    if (!value) return;
    try {
      await updateMut.mutateAsync({ id, input: { text: value } });
      setEditingId(null);
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر حفظ التعديل');
    }
  };

  const createError =
    createMut.error instanceof HttpError ? createMut.error.message : null;

  return (
    <div>
      {/* ====== Composer ====== */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4">
        <textarea
          rows={3}
          maxLength={NOTE_MAX}
          placeholder="اكتب ملاحظتك على هذا الجزء من الدرس…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-base resize-y leading-[1.7]"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleCreate}
            disabled={!text.trim()}
            loading={createMut.isPending}
            size="sm"
          >
            حفظ الملاحظة
          </Button>
        </div>
        {createError && (
          <Alert tone="danger" className="mt-3">
            {createError}
          </Alert>
        )}
      </div>

      {/* ====== List ====== */}
      <div className="mt-5 flex flex-col gap-3">
        {notesQuery.isLoading && <Skeleton />}

        {notesQuery.error && (
          <Alert tone="warning">
            تعذّر تحميل الملاحظات
            {notesQuery.error instanceof HttpError
              ? ` — ${notesQuery.error.message}`
              : ''}
          </Alert>
        )}

        {!notesQuery.isLoading && sortedNotes.length === 0 && (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] py-10 text-center text-[13.5px] text-[var(--color-ink-500)]">
            لا توجد ملاحظات بعد. ابدأ بكتابة ملاحظتك الأولى.
          </div>
        )}

        {sortedNotes.map((note) =>
          editingId === note.id ? (
            <NoteEditCard
              key={note.id}
              note={note}
              saving={updateMut.isPending}
              errorMessage={
                updateMut.error instanceof HttpError ? updateMut.error.message : null
              }
              onSave={(newText) => handleUpdate(note.id, newText)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <NoteRow
              key={note.id}
              note={note}
              deleting={deleteMut.isPending}
              onSeek={() => onSeek(note.timestampSeconds)}
              onEdit={() => setEditingId(note.id)}
              onDelete={() => handleDelete(note.id)}
            />
          ),
        )}
      </div>
    </div>
  );
}

/* ====== sub-components ====== */

function NoteRow({
  note,
  deleting,
  onSeek,
  onEdit,
  onDelete,
}: {
  note: LessonNote;
  deleting: boolean;
  onSeek: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4">
      <button
        type="button"
        onClick={onSeek}
        className="shrink-0 rounded-md bg-[var(--color-brand-blue-100)] px-2.5 py-1.5 text-[12px] font-bold text-[var(--color-brand-blue-700)] transition-colors hover:bg-[#D6E4F2]"
        title="انتقل إلى هذه اللحظة في الفيديو"
      >
        <span dir="ltr" className="font-mono tabular-nums">
          {formatTimecode(note.timestampSeconds)}
        </span>
      </button>
      <p className="m-0 flex-1 whitespace-pre-wrap text-[14px] leading-[1.7] text-[var(--color-ink-800)]">
        {note.text}
      </p>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconBtn label="تعديل" onClick={onEdit}>
          <Pencil className="size-4" />
        </IconBtn>
        <IconBtn
          label="حذف"
          tone="danger"
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="size-4" />
        </IconBtn>
      </div>
    </div>
  );
}

function NoteEditCard({
  note,
  saving,
  errorMessage,
  onSave,
  onCancel,
}: {
  note: LessonNote;
  saving: boolean;
  errorMessage: string | null;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(note.text);

  // Reset the draft if the user edits a different note while this one is open.
  useEffect(() => {
    setDraft(note.text);
  }, [note.id, note.text]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-brand-blue)] bg-white p-4">
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-blue-100)] px-2.5 py-1 text-[12px] font-bold text-[var(--color-brand-blue-700)]">
        <Clock className="size-3.5" />
        <span dir="ltr" className="font-mono tabular-nums">
          {formatTimecode(note.timestampSeconds)}
        </span>
      </div>
      <textarea
        rows={3}
        maxLength={NOTE_MAX}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="input-base resize-y leading-[1.7]"
        autoFocus
      />
      {errorMessage && (
        <Alert tone="danger" className="mt-2">
          {errorMessage}
        </Alert>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onSave(draft)}
          disabled={!draft.trim() || draft === note.text}
          loading={saving}
          iconStart={<Check className="size-4" />}
        >
          حفظ
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
          iconStart={<X className="size-4" />}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'rounded-md p-1.5 transition-colors disabled:opacity-40',
        tone === 'danger'
          ? 'text-[var(--color-ink-500)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]'
          : 'text-[var(--color-ink-500)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]',
      )}
    >
      {children}
    </button>
  );
}

function Skeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-[72px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
        />
      ))}
    </>
  );
}

/* ====== utils ====== */

function formatTimecode(secondsValue: number): string {
  const total = Math.max(0, Math.round(secondsValue));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
