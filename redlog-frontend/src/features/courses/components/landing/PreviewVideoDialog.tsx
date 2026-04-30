import { Dialog } from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { BunnyPlayer } from '@/features/courses/components/player/BunnyPlayer';
import { useLessonPlayback } from '@/features/lessons/hooks';
import { useCurrentUser } from '@/features/auth/hooks';
import type { Lesson } from '@/features/courses/types';

interface PreviewVideoDialogProps {
  open: boolean;
  /** First video lesson with `isPreview = true`. Null disables playback. */
  lesson: Lesson | null;
  /** Optional thumbnail to show while the playback URL is being minted. */
  posterUrl?: string | null;
  onClose: () => void;
}

export function PreviewVideoDialog({
  open,
  lesson,
  posterUrl,
  onClose,
}: PreviewVideoDialogProps) {
  const { data: currentUser } = useCurrentUser();

  // Mint a fresh playback URL only while the dialog is open AND we have a
  // video preview to show. Closing the dialog stops re-fetches naturally.
  const playbackQuery = useLessonPlayback({
    id: lesson?.id,
    enabled: open && lesson?.type === 'video',
  });

  const watermarkText = currentUser
    ? `${currentUser.name} · ${currentUser.email}`
    : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="معاينة مجانية"
      description={lesson?.title}
      size="lg"
      footer={<Button variant="ghost" onClick={onClose}>إغلاق</Button>}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-md)] bg-black">
        <BunnyPlayer
          embedUrl={playbackQuery.data?.embedUrl ?? null}
          loading={playbackQuery.isLoading}
          posterUrl={posterUrl ?? undefined}
          title={lesson?.title}
          watermarkText={watermarkText}
        />
      </div>
    </Dialog>
  );
}
