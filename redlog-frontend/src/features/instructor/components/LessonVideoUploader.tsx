import { useEffect, useRef, useState } from 'react';
import * as tus from 'tus-js-client';
import {
  Check,
  CircleAlert,
  Loader2,
  Play,
  Upload as UploadIcon,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { HttpError } from '@/shared/api/client';
import { instructorApi } from '@/features/instructor/api';
import { instructorKeys } from '@/features/instructor/hooks';
import { coursesKeys } from '@/features/courses/hooks';
import { lessonsKeys } from '@/features/lessons/hooks';

type Phase =
  | 'idle' // no file selected, no upload running
  | 'staged' // file picked, waiting for caller to trigger
  | 'requesting' // POST /video/upload — minting TUS creds
  | 'uploading' // TUS in flight; progress in [0..1]
  | 'encoding' // upload done, polling /video/status
  | 'ready' // status === ready; lesson.duration is synced
  | 'failed';

interface UploadState {
  phase: Phase;
  progress: number;
  statusLabel: string;
  errorMessage: string | null;
  /** Bunny status code from the latest poll, if any. */
  statusCode: number | null;
  durationSeconds: number;
  thumbnailUrl: string | null;
}

interface Props {
  /** Course slug — needed for cache invalidation after a successful upload. */
  slug: string;
  /** Current state of the lesson on the server. Drives the "current video"
   *  preview when no new file is staged. Null in the create flow before
   *  the lesson exists. */
  current: {
    bunnyVideoId: string | null;
    thumbnailUrl: string | null;
    durationSeconds: number;
  } | null;
  /** Fired whenever the staged file changes. Parent can use this to mark
   *  the form dirty / trigger save chain. */
  onFileStaged?: (file: File | null) => void;
}

export interface LessonVideoUploaderHandle {
  /** Returns the staged file or null. Caller chooses whether to upload it. */
  getStagedFile: () => File | null;
  /** Kick off the full upload + poll chain against `lessonId`. Resolves
   *  once Bunny reports `isReady`, or rejects on any failure. */
  startUpload: (lessonId: string) => Promise<void>;
}

const POLL_INTERVAL_MS = 5_000;
const POLL_LIMIT = 60; // 5 minutes
const MAX_FILE_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB
const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

/**
 * Direct-to-Bunny lesson video uploader. Handles the full state machine
 * documented in `lesson-video-upload-api.md`:
 *
 *   1) `POST /lessons/:id/video/upload` to mint short-lived TUS creds
 *   2) `tus-js-client` uploads the file straight to Bunny (no backend bandwidth)
 *   3) After tus `onSuccess`, poll `GET /lessons/:id/video/status` every 5s
 *   4) Stop polling when `isReady` flips true; cache invalidate
 *
 * The component is "controlled-ish": it owns its own phase + progress
 * state, but exposes `startUpload` via a ref so the parent can sequence
 * "create lesson, then upload" in one click.
 */
export function LessonVideoUploader({
  slug,
  current,
  onFileStaged,
  uploaderRef,
}: Props & {
  uploaderRef?: React.MutableRefObject<LessonVideoUploaderHandle | null>;
}) {
  const qc = useQueryClient();
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>({
    phase: 'idle',
    progress: 0,
    statusLabel: '',
    errorMessage: null,
    statusCode: null,
    durationSeconds: current?.durationSeconds ?? 0,
    thumbnailUrl: current?.thumbnailUrl ?? null,
  });

  // Re-sync the displayed thumbnail / duration if the server view of
  // `current` changes (e.g. parent re-fetched the lesson after a save).
  useEffect(() => {
    if (state.phase === 'idle' || state.phase === 'staged') {
      setState((prev) => ({
        ...prev,
        durationSeconds: current?.durationSeconds ?? 0,
        thumbnailUrl: current?.thumbnailUrl ?? null,
      }));
    }
  }, [current?.durationSeconds, current?.thumbnailUrl, state.phase]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tusUploadRef = useRef<tus.Upload | null>(null);
  const pollAbortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return 'الصيغة غير مدعومة — استخدم MP4 أو MOV أو WEBM.';
    }
    if (file.size > MAX_FILE_BYTES) {
      return 'حجم الملف يتجاوز 4 جيجا.';
    }
    return null;
  };

  const stageFile = (file: File) => {
    const err = validate(file);
    if (err) {
      toast.error(err);
      return;
    }
    setStagedFile(file);
    setState((prev) => ({
      ...prev,
      phase: 'staged',
      errorMessage: null,
    }));
    onFileStaged?.(file);
  };

  const clearFile = () => {
    setStagedFile(null);
    setState((prev) => ({
      ...prev,
      phase: 'idle',
      progress: 0,
      errorMessage: null,
    }));
    onFileStaged?.(null);
  };

  /** TUS upload + status poll. Resolves on ready, rejects on failure. */
  const startUpload = async (id: string): Promise<void> => {
    if (!stagedFile) return;

    setState((prev) => ({
      ...prev,
      phase: 'requesting',
      progress: 0,
      statusLabel: 'جاري التحضير...',
      errorMessage: null,
      statusCode: null,
    }));

    let creds;
    try {
      creds = await instructorApi.requestVideoUpload(id);
    } catch (e) {
      const message =
        e instanceof HttpError ? e.message : 'تعذّر تحضير الرفع.';
      setState((prev) => ({
        ...prev,
        phase: 'failed',
        errorMessage: message,
      }));
      throw e;
    }

    setState((prev) => ({
      ...prev,
      phase: 'uploading',
      progress: 0,
      statusLabel: '0%',
    }));

    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(stagedFile, {
        endpoint: creds.tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
        headers: {
          AuthorizationSignature: creds.signature,
          AuthorizationExpire: String(creds.expirationTime),
          VideoId: creds.videoId,
          LibraryId: creds.libraryId,
        },
        metadata: {
          filetype: stagedFile.type,
          title: stagedFile.name,
        },
        onError: (err) => {
          setState((prev) => ({
            ...prev,
            phase: 'failed',
            errorMessage: err.message ?? 'فشل رفع الفيديو',
          }));
          reject(err);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const ratio = bytesTotal > 0 ? bytesUploaded / bytesTotal : 0;
          setState((prev) => ({
            ...prev,
            progress: ratio,
            statusLabel: `${(ratio * 100).toFixed(1)}%`,
          }));
        },
        onSuccess: () => resolve(),
      });
      tusUploadRef.current = upload;
      upload.start();
    });

    // Poll encoding status. Spec: every 5s, stop on isReady or status=5,
    // cap at ~60 polls (5 minutes).
    setState((prev) => ({
      ...prev,
      phase: 'encoding',
      progress: 1,
      statusLabel: 'جاري المعالجة...',
    }));

    pollAbortRef.current = { cancelled: false };
    const myAbort = pollAbortRef.current;

    let polls = 0;
    while (polls < POLL_LIMIT && !myAbort.cancelled) {
      polls += 1;
      try {
        const status = await instructorApi.getVideoStatus(id);
        if (status.status === 5) {
          setState((prev) => ({
            ...prev,
            phase: 'failed',
            statusCode: 5,
            errorMessage: 'فشل ترميز الفيديو على Bunny.',
          }));
          throw new Error('encoding-failed');
        }
        setState((prev) => ({
          ...prev,
          statusCode: status.status,
          statusLabel: arabicStatusLabel(status.status),
          durationSeconds: status.lessonDurationSeconds,
          thumbnailUrl: status.thumbnailUrl ?? prev.thumbnailUrl,
        }));
        if (status.isReady) {
          setState((prev) => ({
            ...prev,
            phase: 'ready',
            statusLabel: 'تم بنجاح',
          }));
          // Cache invalidations per spec — lesson detail, curriculum,
          // course detail (totalLessons / durationMinutes), courses list.
          void qc.invalidateQueries({ queryKey: lessonsKeys.detail(id) });
          void qc.invalidateQueries({
            queryKey: instructorKeys.curriculum(slug),
          });
          void qc.invalidateQueries({ queryKey: instructorKeys.course(slug) });
          void qc.invalidateQueries({ queryKey: instructorKeys.courses() });
          void qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });
          void qc.invalidateQueries({ queryKey: coursesKeys.curriculum(slug) });
          // Clean up so the parent's Save / next-action button doesn't see
          // a "still staged" file after the upload landed.
          setStagedFile(null);
          onFileStaged?.(null);
          return;
        }
      } catch (e) {
        // Network blip on a single poll — sleep and retry. Failed-encoding
        // status is handled above by throwing.
        if (e instanceof Error && e.message === 'encoding-failed') throw e;
      }
      await new Promise((res) => setTimeout(res, POLL_INTERVAL_MS));
    }

    if (myAbort.cancelled) return;

    // Hit the cap. Likely just slow encoding — keep the lesson but tell
    // the user to come back later.
    setState((prev) => ({
      ...prev,
      phase: 'encoding',
      statusLabel: 'لا يزال يعالج، تحقق لاحقاً',
    }));
    toast.message(
      'الفيديو لا يزال قيد المعالجة. ستظهر المدة بعد اكتمال الترميز.',
    );
  };

  // Expose startUpload + getStagedFile via the parent's ref so the parent
  // can sequence "create lesson → upload" without prop drilling state up.
  useEffect(() => {
    if (!uploaderRef) return;
    uploaderRef.current = {
      getStagedFile: () => stagedFile,
      startUpload,
    };
    return () => {
      uploaderRef.current = null;
      if (tusUploadRef.current) {
        tusUploadRef.current.abort();
        tusUploadRef.current = null;
      }
      pollAbortRef.current.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagedFile]);

  const onPick = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) stageFile(file);
    e.currentTarget.value = ''; // allow re-picking the same file
  };

  // Drag-and-drop directly onto the picker zone.
  const [dragOver, setDragOver] = useState(false);
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) stageFile(file);
  };

  const hasExistingVideo =
    !!current?.bunnyVideoId && state.phase !== 'staged';
  const showProgress =
    state.phase === 'requesting' ||
    state.phase === 'uploading' ||
    state.phase === 'encoding';

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={onFileChange}
        disabled={showProgress}
      />

      {/* Existing-video preview (no new file staged, no upload running) */}
      {hasExistingVideo && state.phase !== 'staged' && !showProgress && (
        <ExistingVideoPanel
          thumbnailUrl={state.thumbnailUrl}
          durationSeconds={state.durationSeconds}
          ready={state.phase === 'ready' || state.phase === 'idle'}
          onReplace={onPick}
        />
      )}

      {/* Drop zone for picking a new file */}
      {!hasExistingVideo && state.phase !== 'staged' && !showProgress && (
        <button
          type="button"
          onClick={onPick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={
            'flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed bg-[var(--color-surface-soft)] py-12 text-center transition-colors ' +
            (dragOver
              ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)]'
              : 'border-[var(--color-line-strong)] hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-50)]')
          }
        >
          <UploadIcon className="size-8 text-[var(--color-ink-500)]" />
          <span className="text-[14px] font-semibold text-[var(--color-ink-800)]">
            اسحب الفيديو هنا أو اضغط لاختياره
          </span>
          <span className="text-[12px] text-[var(--color-ink-500)]">
            MP4 / MOV / WEBM — حجم أقصى 4 جيجا
          </span>
        </button>
      )}

      {/* Staged file — pending parent's save click */}
      {state.phase === 'staged' && stagedFile && (
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-[var(--color-brand-blue)] text-white">
              <Video className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold text-[var(--color-brand-navy)]">
                {stagedFile.name}
              </div>
              <div className="text-[12px] text-[var(--color-ink-700)]">
                {formatBytes(stagedFile.size)} — سيُرفع بعد الحفظ
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-ink-600)] hover:bg-white"
            aria-label="إزالة الملف"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Progress (uploading) / spinner (requesting / encoding) */}
      {showProgress && (
        <ProgressPanel
          phase={state.phase}
          progress={state.progress}
          statusLabel={state.statusLabel}
        />
      )}

      {/* Ready confirmation */}
      {state.phase === 'ready' && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-success)] bg-[var(--color-success-soft)] p-4 text-[13.5px] text-[var(--color-success)]">
          <Check className="size-5" />
          تم رفع الفيديو ومعالجته. المدة:{' '}
          {formatDuration(state.durationSeconds)}.
        </div>
      )}

      {/* Failure */}
      {state.phase === 'failed' && state.errorMessage && (
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-[13.5px] text-[var(--color-danger)]">
          <CircleAlert className="mt-0.5 size-5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">{state.errorMessage}</div>
            <button
              type="button"
              onClick={onPick}
              className="mt-1.5 text-[12.5px] font-semibold underline-offset-2 hover:underline"
            >
              اختر ملفاً آخر
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== sub-panels ============================== */

function ExistingVideoPanel({
  thumbnailUrl,
  durationSeconds,
  ready,
  onReplace,
}: {
  thumbnailUrl: string | null;
  durationSeconds: number;
  ready: boolean;
  onReplace: () => void;
}) {
  // Bunny generates the thumbnail JPG a few seconds AFTER upload, so the
  // URL on the lesson can briefly point at a not-yet-existent file (404).
  // Track failed loads + reset whenever the URL itself changes so the
  // placeholder shows instead of the browser's broken-image icon.
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [thumbnailUrl]);

  const showImage = Boolean(thumbnailUrl) && !imgFailed;

  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-3">
      <div className="relative aspect-video w-[140px] shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-black">
        {showImage ? (
          <img
            src={thumbnailUrl!}
            alt="thumbnail"
            onError={() => setImgFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center px-2 text-center text-[10.5px] text-white/60">
            {thumbnailUrl
              ? 'لم تكتمل المعالجة بعد'
              : 'ستظهر بعد المعالجة'}
          </div>
        )}
        <span className="absolute bottom-1 end-1 inline-flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          <Play className="size-2.5" />
          {durationSeconds > 0 ? formatDuration(durationSeconds) : '—'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-[var(--color-ink-900)]">
          الفيديو الحالي
        </div>
        <div className="text-[11.5px] text-[var(--color-ink-500)]">
          {ready
            ? 'تمت المعالجة وجاهز للعرض.'
            : 'لا تزال البيانات الأولية قيد التحديث.'}
        </div>
      </div>
      <button
        type="button"
        onClick={onReplace}
        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[var(--color-line-strong)] bg-white px-3 text-[12.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)]"
      >
        <UploadIcon className="size-3.5" />
        استبدال
      </button>
    </div>
  );
}

function ProgressPanel({
  phase,
  progress,
  statusLabel,
}: {
  phase: Phase;
  progress: number;
  statusLabel: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const isUploading = phase === 'uploading';
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] p-4">
      <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[var(--color-brand-navy)]">
        {phase === 'uploading' ? (
          <UploadIcon className="size-4" />
        ) : (
          <Loader2 className="size-4 animate-spin" />
        )}
        {phase === 'requesting'
          ? 'جاري التحضير...'
          : phase === 'uploading'
            ? `جاري الرفع · ${statusLabel}`
            : `جاري معالجة الفيديو · ${statusLabel}`}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[var(--color-brand-blue)] transition-[width] duration-150"
          style={{
            width: isUploading ? `${pct}%` : '100%',
            opacity: isUploading ? 1 : 0.6,
          }}
        />
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-ink-600)]">
        {phase === 'uploading'
          ? 'لا تغلق هذه الصفحة حتى يكتمل الرفع. يمكنك استئناف الرفع تلقائياً عند انقطاع الاتصال.'
          : 'بعد اكتمال المعالجة، ستظهر مدة الفيديو وصورة المعاينة تلقائياً.'}
      </p>
    </div>
  );
}

/* ============================== helpers ============================== */

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كب`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} ميجا`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجا`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} ثانية`;
  if (s === 0) return `${m} دقيقة`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function arabicStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return 'في الانتظار';
    case 1:
      return 'يبدأ المعالجة';
    case 2:
      return 'جاري الترميز';
    case 3:
    case 4:
      return 'تم بنجاح';
    case 5:
      return 'فشلت العملية';
    default:
      return '...';
  }
}
