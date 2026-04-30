import { useState } from 'react';
import {
  Pencil,
  MessageCircle,
  Paperclip,
  FileText,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { NotesTab } from './NotesTab';
import { QATab } from './QATab';
import { FilesTab } from './FilesTab';

type TabKey = 'notes' | 'qa' | 'files' | 'transcript';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { key: 'notes', label: 'الملاحظات', icon: <Pencil className="size-4" /> },
  { key: 'qa', label: 'الأسئلة والمناقشات', icon: <MessageCircle className="size-4" /> },
  { key: 'files', label: 'المرفقات', icon: <Paperclip className="size-4" /> },
  { key: 'transcript', label: 'النص المكتوب', icon: <FileText className="size-4" /> },
];

interface PlayerTabsProps {
  /** Current lesson id (null when curriculum is empty / no lesson selected). */
  lessonId: string | null;
  /** Live playback time in seconds — captured for new notes. */
  currentTime: number;
  /** Seek the player to a given second (used when clicking a note's timestamp). */
  onSeek: (seconds: number) => void;
}

export function PlayerTabs({ lessonId, currentTime, onSeek }: PlayerTabsProps) {
  const [active, setActive] = useState<TabKey>('notes');

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex gap-1 border-b border-[var(--color-line)] bg-white px-6">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-[2px] px-4 py-3.5 text-[14px] font-semibold transition-colors',
                isActive
                  ? 'border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]'
                  : 'border-transparent text-[var(--color-ink-600)] hover:text-[var(--color-ink-900)]',
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6">
        {active === 'notes' && (
          <NotesTab lessonId={lessonId} currentTime={currentTime} onSeek={onSeek} />
        )}
        {active === 'qa' && <QATab lessonId={lessonId} />}
        {active === 'files' && <FilesTab lessonId={lessonId} />}
        {active === 'transcript' && <ComingSoon labelByTab={LABELS.transcript} />}
      </div>
    </div>
  );
}

const LABELS: Record<'transcript', { title: string; body: string }> = {
  transcript: {
    title: 'النص المكتوب',
    body: 'النص الكامل للدرس مع روابط للحظات في الفيديو. سيتم تفعيله بعد إضافة الـ API.',
  },
};

function ComingSoon({ labelByTab }: { labelByTab: { title: string; body: string } }) {
  return (
    <div className="mx-auto max-w-[520px] rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] px-6 py-12 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-amber-soft)] px-3 py-1.5 text-[12px] font-semibold tracking-wide text-[var(--color-accent-amber-700)]">
        <Sparkles className="size-3.5" />
        قريباً
      </div>
      <h3 className="mt-4 text-[18px] font-bold text-[var(--color-ink-900)]">
        {labelByTab.title}
      </h3>
      <p className="m-0 mt-2 text-[13.5px] leading-[1.7] text-[var(--color-ink-500)]">
        {labelByTab.body}
      </p>
    </div>
  );
}
