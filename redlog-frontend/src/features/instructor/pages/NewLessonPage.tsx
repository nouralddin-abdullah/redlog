import { useEffect, useRef, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowRight,
  Check,
  FileText,
  Info,
  ListChecks,
  Loader2,
  Paperclip,
  Pencil,
  Play,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { useLesson } from '@/features/lessons/hooks';
import {
  useCreateLesson,
  useDeleteAttachment,
  useInstructorCourse,
  useRenameAttachment,
  useUpdateLesson,
  useUploadAttachment,
} from '@/features/instructor/hooks';
import type { LessonAttachment } from '@/features/lessons/types';
import {
  LessonVideoUploader,
  type LessonVideoUploaderHandle,
} from '@/features/instructor/components/LessonVideoUploader';

type LessonKind = 'video' | 'quiz';

/**
 * Single page for both creating and editing a lesson.
 *
 * - Create mode: route is `/lessons/new?moduleId=<id>` — POST /modules/:id/lessons.
 * - Edit mode: route is `/lessons/:lessonId/edit` — pre-fills via GET /lessons/:id
 *   then PATCH /lessons/:id on save.
 *
 * Per the curriculum API spec, the source of truth for the video itself is
 * a Bunny Stream `bunnyVideoId`. The instructor uploads the file in the
 * Bunny dashboard, then pastes the GUID here. The backend auto-pulls
 * `durationSeconds` and `thumbnailUrl` from Bunny on save — those fields
 * are read-only in this UI.
 *
 * Quiz authoring (`questions`, `passThresholdPercent`, etc.) lives behind a
 * separate set of endpoints documented in the spec; this page intentionally
 * doesn't expose them yet.
 */
export function NewLessonPage() {
  const { slug, lessonId } = useParams<{
    slug: string;
    lessonId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const moduleIdFromQuery = searchParams.get('moduleId');
  const navigate = useNavigate();
  const isEditMode = Boolean(lessonId);

  const { data: course } = useInstructorCourse(slug);
  // Public lesson endpoint — backend bypasses `assertCanView` for the
  // course owner, so the same hook works for instructor edits per the spec.
  const lessonQuery = useLesson(isEditMode ? lessonId : undefined);

  const createLesson = useCreateLesson(slug ?? '');
  const updateLesson = useUpdateLesson(slug ?? '');
  const saving = createLesson.isPending || updateLesson.isPending;

  const [kind, setKind] = useState<LessonKind>('video');
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [hasStagedFile, setHasStagedFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill from server in edit mode. Re-runs when `lessonId` changes (the
  // URL identity), not on every refetch — preserves in-progress edits if
  // the user is mid-typing while the cache invalidates.
  const lastSyncedLessonId = useRef<string | null>(null);
  useEffect(() => {
    const lesson = lessonQuery.data;
    if (!lesson) return;
    if (lesson.id === lastSyncedLessonId.current) return;
    lastSyncedLessonId.current = lesson.id;
    setKind(lesson.type);
    setTitle(lesson.title);
    setTranscript(lesson.transcript ?? '');
    setIsPreview(lesson.isPreview);
  }, [lessonQuery.data]);

  // Ref into the uploader so the save chain can call `startUpload` after
  // the lesson is created/updated. Lifts upload control up without prop-
  // drilling the file blob through everything.
  const uploaderRef = useRef<LessonVideoUploaderHandle | null>(null);

  const backHref = course
    ? `/instructor/courses/${course.slug}`
    : '/instructor/courses';

  const goBackToCourse = () => navigate(backHref);

  /**
   * Save chain:
   *   1) Create or update the lesson with metadata only (no bunnyVideoId).
   *      The video is attached server-side by the upload endpoint, so we
   *      never PATCH `bunnyVideoId` from this form.
   *   2) If the user staged a video file, kick off the direct-to-Bunny
   *      TUS upload against the resulting lesson id, then poll until
   *      Bunny reports the encoding is ready.
   *   3) Navigate back to the curriculum tab.
   *
   * Errors from either phase abort and stay on the page so the user can
   * retry without losing typed metadata.
   */
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('عنوان الدرس مطلوب');
      return;
    }

    try {
      let resolvedLessonId: string | null = lessonId ?? null;

      if (isEditMode) {
        if (!lessonId) return;
        await updateLesson.mutateAsync({
          lessonId,
          body: {
            title: trimmedTitle.slice(0, 200),
            transcript: transcript.trim()
              ? transcript.trim().slice(0, 50_000)
              : null,
            isPreview,
          },
        });
      } else {
        if (!moduleIdFromQuery) {
          toast.error(
            'لا يوجد moduleId في الرابط — افتح الصفحة من زر "إضافة درس" داخل الوحدة.',
          );
          return;
        }
        const created = await createLesson.mutateAsync({
          moduleId: moduleIdFromQuery,
          body: {
            title: trimmedTitle.slice(0, 200),
            type: kind,
            transcript: transcript.trim()
              ? transcript.trim().slice(0, 50_000)
              : null,
            isPreview,
          },
        });
        resolvedLessonId = created.id;
      }

      // Phase 2: video upload, only if a file is staged AND we're on a
      // video lesson. Quiz lessons don't get videos.
      const stagedFile = uploaderRef.current?.getStagedFile() ?? null;
      if (stagedFile && resolvedLessonId && kind === 'video') {
        setIsUploading(true);
        try {
          await uploaderRef.current!.startUpload(resolvedLessonId);
        } finally {
          setIsUploading(false);
        }
      }

      toast.success(isEditMode ? 'تم حفظ التعديلات' : 'تم إضافة الدرس');

      // Stay on the page after save. On a fresh create we still need to
      // swap the URL from `/lessons/new` to `/lessons/:id/edit` so the
      // page's mode (and the back button) match the just-saved lesson.
      // `replace: true` keeps the create URL out of history.
      if (!isEditMode && resolvedLessonId && slug) {
        navigate(
          `/instructor/courses/${slug}/lessons/${resolvedLessonId}/edit`,
          { replace: true },
        );
      }
    } catch (e) {
      // Both upload and metadata save errors land here. The uploader
      // surfaces its own inline error UI, so we only toast for the
      // metadata-side failures (HttpError) and ignore tus errors that
      // already rendered locally.
      if (e instanceof HttpError) {
        toast.error(e.message);
      }
    }
  };

  // Edit mode: while the lesson detail is loading, hold off rendering the
  // form so we don't flash a blank one then snap to the prefilled values.
  if (isEditMode && lessonQuery.isLoading) {
    return <LoadingSkeleton backHref={backHref} />;
  }

  if (isEditMode && (lessonQuery.error || !lessonQuery.data)) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-16 text-center">
        <h1 className="mb-2 text-[22px] font-bold text-[var(--color-ink-900)]">
          الدرس غير موجود
        </h1>
        <p className="mb-5 text-[14px] text-[var(--color-ink-500)]">
          {lessonQuery.error instanceof HttpError
            ? lessonQuery.error.message
            : 'ربما تم حذف الدرس أو الرابط غير صحيح.'}
        </p>
        <Link
          to={backHref}
          className="text-[13.5px] font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
        >
          العودة للمنهج
        </Link>
      </div>
    );
  }

  // Bunny-derived read-only fields — only meaningful in edit mode (after a
  // first save). Show them so the instructor can verify the auto-pulled
  // duration / thumbnail.
  const lesson = lessonQuery.data;

  return (
    <div className="mx-auto max-w-[960px] px-6 py-8 lg:px-10 lg:py-10">
      <Link
        to={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
      >
        <ArrowRight className="size-3.5" />
        {course ? `العودة إلى ${course.title}` : 'العودة لكورساتي'}
      </Link>

      <header className="mb-8">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          {isEditMode ? 'تعديل الدرس' : 'إضافة درس جديد'}
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          {isEditMode
            ? 'حدّث بيانات الدرس. التعديلات الجوهرية على كورس منشور قد تتطلب إعادة المراجعة.'
            : 'اختر نوع الدرس ثم أكمل تفاصيله. الدروس الجديدة تخضع للمراجعة كجزء من الكورس.'}
        </p>
      </header>

      {/* === Lesson kind picker — disabled in edit mode (type is fixed
            after creation per the API). =================================== */}
      {!isEditMode && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <KindCard
            active={kind === 'video'}
            onSelect={() => setKind('video')}
            icon={Video}
            title="درس فيديو"
            subtitle="فيديو على Bunny Stream + نص مكتوب اختياري."
          />
          <KindCard
            active={kind === 'quiz'}
            onSelect={() => setKind('quiz')}
            icon={ListChecks}
            title="اختبار"
            subtitle="قريباً — أسئلة الاختبار تُدار من صفحة منفصلة."
            disabled
          />
        </div>
      )}

      {/* === Lesson form ================================================== */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-xs)]">
        <div className="mb-6">
          <label className="mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-700)]">
            عنوان الدرس <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="مثال: تفسير صور الصدر — الجزء الأول"
            maxLength={200}
            className="input-base h-11 w-full text-[14px]"
          />
        </div>

        {kind === 'video' && (
          <>
            {/* Direct-to-Bunny TUS uploader. Pre-create-lesson, the
                uploader stays in `staged` mode (no lessonId yet) and the
                save chain calls `startUpload` after the create response
                returns. In edit mode, the uploader is fully active and
                can replace the existing video. */}
            <div className="mb-6">
              <label className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-ink-700)]">
                  فيديو الدرس
                  {!isEditMode && (
                    <span className="text-[var(--color-danger)]"> *</span>
                  )}
                </span>
                <span className="text-[11px] text-[var(--color-ink-400)]">
                  يُرفع مباشرة إلى Bunny Stream
                </span>
              </label>
              <LessonVideoUploader
                slug={slug ?? ''}
                current={
                  lesson
                    ? {
                        bunnyVideoId: lesson.bunnyVideoId,
                        thumbnailUrl: lesson.thumbnailUrl,
                        durationSeconds: lesson.durationSeconds,
                      }
                    : null
                }
                onFileStaged={(file) => setHasStagedFile(file !== null)}
                uploaderRef={uploaderRef}
              />
            </div>

            <div className="mb-6">
              <label className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--color-ink-700)]">
                  النص المكتوب
                </span>
                <span className="text-[11px] text-[var(--color-ink-400)]">
                  اختياري
                </span>
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.currentTarget.value)}
                rows={6}
                maxLength={50_000}
                placeholder="نص الدرس المكتوب — يظهر للطلاب في تبويب «النص المكتوب» أثناء المشاهدة."
                className="input-base w-full resize-y px-3.5 py-2.5 text-[14px] leading-relaxed"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] p-4 transition-colors hover:bg-[var(--color-surface-soft)]">
                <input
                  type="checkbox"
                  checked={isPreview}
                  onChange={(e) => setIsPreview(e.currentTarget.checked)}
                  className="mt-0.5 size-4 accent-[var(--color-brand-blue)]"
                />
                <span className="flex-1">
                  <span className="block text-[13.5px] font-semibold text-[var(--color-ink-900)]">
                    معاينة مجانية
                  </span>
                  <span className="block text-[12.5px] text-[var(--color-ink-500)]">
                    عند التفعيل، يستطيع أي زائر مشاهدة هذا الدرس قبل الاشتراك
                    في الكورس.
                  </span>
                </span>
              </label>
            </div>

            <AttachmentsSection
              lessonId={isEditMode ? (lessonId ?? null) : null}
              attachments={lesson?.attachments ?? []}
            />
          </>
        )}

        {kind === 'quiz' && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-soft)] p-5 text-[13px] text-[var(--color-warning)]">
            <div className="mb-1 flex items-center gap-2 font-bold">
              <Info className="size-4" />
              منشئ الاختبارات قيد التطوير
            </div>
            <p className="leading-relaxed">
              يمكنك إنشاء الدرس الآن وستتم إدارة أسئلة الاختبار من صفحة
              منفصلة قريباً. إعدادات الاختبار (نسبة النجاح، المحاولات
              القصوى) تُضبط عبر endpoints مخصصة وليست هنا.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-5">
          <button
            type="button"
            onClick={goBackToCourse}
            disabled={saving}
            className="inline-flex h-10 items-center rounded-[10px] px-4 text-[13.5px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isUploading}
            className="btn-base inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[13.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)] disabled:opacity-50"
          >
            {saving || isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isEditMode ? (
              <Check className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {isUploading
              ? 'جاري الرفع...'
              : isEditMode
                ? hasStagedFile
                  ? 'حفظ ورفع الفيديو'
                  : 'حفظ التعديلات'
                : hasStagedFile
                  ? 'إضافة الدرس ورفع الفيديو'
                  : 'إضافة الدرس'}
          </button>
        </div>
      </section>

      {/* Helpful banner in create mode without a moduleId — happens if the
          user lands on /lessons/new directly without the query param. */}
      {!isEditMode && !moduleIdFromQuery && (
        <div className="mt-4">
          <Alert tone="warning">
            افتح هذه الصفحة من زر "إضافة درس" داخل وحدة محددة حتى يتم تعيين
            الدرس على الوحدة الصحيحة.
          </Alert>
        </div>
      )}
    </div>
  );
}

/* ============================== sub-components ============================== */

/**
 * Lesson attachments — PDFs, slides, ZIPs, audio, images. Wired against
 * the four endpoints in `lesson-attachments-api.md`:
 *
 *   - existing list:  `lesson.attachments[]` (embedded in lesson detail)
 *   - upload:         `POST /lessons/:lessonId/attachments` (multipart)
 *   - rename:         `PATCH /lesson-attachments/:id`
 *   - delete:         `DELETE /lesson-attachments/:id`
 *
 * The list embedded on the lesson detail is the source of truth here —
 * no separate fetch — and mutations invalidate `lessonsKeys.detail` so
 * the embedded array refreshes after each change. Disabled before the
 * lesson exists (create mode pre-save) since the endpoints need a real
 * `:lessonId`.
 */
function AttachmentsSection({
  lessonId,
  attachments,
}: {
  lessonId: string | null;
  attachments: LessonAttachment[];
}) {
  const upload = useUploadAttachment(lessonId ?? '');
  const rename = useRenameAttachment(lessonId ?? '');
  const remove = useDeleteAttachment(lessonId ?? '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingTitle, setPendingTitle] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const lessonReady = Boolean(lessonId);
  const hasAny = attachments.length > 0;

  const handlePick = () => {
    if (!lessonReady) {
      toast.message('احفظ الدرس أولاً ثم أضف المرفقات.');
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileChosen = (file: File) => {
    setPendingFile(file);
    // Default the title to the filename without extension; user can edit
    // before confirming. Caps at the spec's 200-char limit.
    const dot = file.name.lastIndexOf('.');
    const stem = dot > 0 ? file.name.slice(0, dot) : file.name;
    setPendingTitle(stem.slice(0, 200));
  };

  const submitUpload = () => {
    if (!pendingFile || !lessonId) return;
    const title = pendingTitle.trim();
    if (!title) {
      toast.error('عنوان المرفق مطلوب');
      return;
    }
    upload.mutate(
      { file: pendingFile, title: title.slice(0, 200) },
      {
        onSuccess: () => {
          toast.success('تم رفع المرفق');
          setPendingFile(null);
          setPendingTitle('');
        },
        onError: (e) =>
          toast.error(e instanceof HttpError ? e.message : 'فشل رفع المرفق'),
      },
    );
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setPendingTitle('');
  };

  const startRename = (att: LessonAttachment) => {
    setRenamingId(att.id);
    setRenameDraft(att.title);
  };

  const submitRename = () => {
    if (!renamingId) return;
    const title = renameDraft.trim();
    if (!title) {
      toast.error('عنوان المرفق مطلوب');
      return;
    }
    const id = renamingId;
    rename.mutate(
      { attachmentId: id, title: title.slice(0, 200) },
      {
        onSuccess: () => {
          toast.success('تم تعديل الاسم');
          setRenamingId(null);
          setRenameDraft('');
        },
        onError: (e) =>
          toast.error(
            e instanceof HttpError ? e.message : 'تعذّر تعديل الاسم',
          ),
      },
    );
  };

  const handleDelete = (att: LessonAttachment) => {
    if (!window.confirm(`سيتم حذف "${att.title}". هل أنت متأكد؟`)) return;
    remove.mutate(
      { attachmentId: att.id },
      {
        onSuccess: () => toast.success('تم حذف المرفق'),
        onError: (e) =>
          toast.error(
            e instanceof HttpError ? e.message : 'تعذّر حذف المرفق',
          ),
      },
    );
  };

  return (
    <div className="mb-2">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-semibold text-[var(--color-ink-700)]">
          المرفقات
        </label>
        <span className="text-[11px] text-[var(--color-ink-400)]">
          اختياري · حد أقصى 50 ميجا
        </span>
      </div>

      {hasAny && (
        <ul className="mb-3 flex flex-col gap-1.5">
          {attachments.map((att) => {
            const sizeBytes = Number(att.fileSizeBytes) || 0;
            const isRenaming = renamingId === att.id;
            return (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-[8px] border border-[var(--color-line)] bg-white px-3 py-2"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-muted)] text-[var(--color-ink-600)]">
                  <FileText className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          submitRename();
                        }
                        if (e.key === 'Escape') {
                          setRenamingId(null);
                          setRenameDraft('');
                        }
                      }}
                      maxLength={200}
                      className="input-base h-8 w-full text-[13px]"
                    />
                  ) : (
                    <>
                      <div className="truncate text-[13px] font-semibold text-[var(--color-ink-900)]">
                        {att.title}
                      </div>
                      <div className="text-[11px] text-[var(--color-ink-500)]">
                        {formatBytes(sizeBytes)}
                      </div>
                    </>
                  )}
                </div>
                {isRenaming ? (
                  <>
                    <button
                      type="button"
                      onClick={submitRename}
                      disabled={rename.isPending}
                      className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-success)] hover:bg-[var(--color-success-soft)] disabled:opacity-50"
                      aria-label="حفظ"
                    >
                      {rename.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingId(null);
                        setRenameDraft('');
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-surface-muted)]"
                      aria-label="إلغاء"
                    >
                      <X className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
                    >
                      فتح
                    </a>
                    <button
                      type="button"
                      onClick={() => startRename(att)}
                      className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
                      aria-label="تعديل الاسم"
                      title="تعديل الاسم"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(att)}
                      disabled={remove.isPending}
                      className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] disabled:opacity-50"
                      aria-label="حذف"
                      title="حذف"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Pending-upload form: appears once a file is picked, lets the
          instructor confirm or edit the title before posting. */}
      {pendingFile ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] p-3">
          <div className="mb-2 flex items-center gap-2 text-[12.5px] text-[var(--color-brand-navy)]">
            <FileText className="size-3.5" />
            <span className="truncate font-semibold">{pendingFile.name}</span>
            <span className="text-[var(--color-ink-500)]">
              · {formatBytes(pendingFile.size)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              autoFocus
              value={pendingTitle}
              onChange={(e) => setPendingTitle(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitUpload();
                }
                if (e.key === 'Escape') cancelUpload();
              }}
              placeholder="عنوان المرفق..."
              maxLength={200}
              className="input-base h-9 flex-1 text-[13px]"
            />
            <button
              type="button"
              onClick={submitUpload}
              disabled={upload.isPending || !pendingTitle.trim()}
              className="btn-base inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[var(--color-brand-navy)] px-3 text-[12.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)] disabled:opacity-50"
            >
              {upload.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UploadCloud className="size-3.5" />
              )}
              رفع
            </button>
            <button
              type="button"
              onClick={cancelUpload}
              disabled={upload.isPending}
              className="inline-flex size-9 items-center justify-center rounded-[8px] text-[var(--color-ink-600)] hover:bg-white disabled:opacity-50"
              aria-label="إلغاء"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePick}
            disabled={!lessonReady}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-dashed border-[var(--color-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-[var(--color-ink-700)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--color-line-strong)] disabled:hover:text-[var(--color-ink-700)]"
          >
            <UploadCloud className="size-4" />
            إضافة ملف PDF أو شريحة
            <Paperclip className="size-3.5 opacity-60" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.tar,.gz,.json,.txt,.csv,.md,image/*,audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) onFileChosen(file);
              e.currentTarget.value = ''; // allow re-pick of same file
            }}
          />
          {!hasAny && (
            <p className="mt-1.5 text-[11.5px] text-[var(--color-ink-500)]">
              {lessonReady
                ? 'ملفات إضافية تظهر للطلاب أسفل الدرس — مفيدة لشرائح المحاضرة والمراجع.'
                : 'احفظ الدرس أولاً ثم تستطيع إضافة المرفقات.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} ب`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كب`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجا`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجا`;
}

function KindCard({
  active,
  onSelect,
  icon: Icon,
  title,
  subtitle,
  disabled,
}: {
  active: boolean;
  onSelect: () => void;
  icon: typeof Video;
  title: string;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={
        'flex items-start gap-3 rounded-[var(--radius-lg)] border p-5 text-start transition-colors ' +
        (active
          ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] shadow-[0_0_0_3px_var(--color-brand-blue-100)]'
          : 'border-[var(--color-line)] bg-white hover:border-[var(--color-line-strong)]') +
        (disabled ? ' cursor-not-allowed opacity-70' : ' cursor-pointer')
      }
    >
      <span
        className={
          'flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ' +
          (active
            ? 'bg-[var(--color-brand-blue)] text-white'
            : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-600)]')
        }
      >
        <Icon className="size-5" />
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-[14.5px] font-bold text-[var(--color-ink-900)]">
          {title}
          {disabled && (
            <span className="rounded-full bg-[var(--color-warning-soft)] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-warning)]">
              قريباً
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-ink-500)]">
          {subtitle}
        </p>
      </div>
    </button>
  );
}

function LoadingSkeleton({ backHref }: { backHref: string }) {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-8 lg:px-10 lg:py-10">
      <Link
        to={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)]"
      >
        <ArrowRight className="size-3.5" />
        رجوع
      </Link>
      <div className="mb-8 h-9 w-[260px] animate-pulse rounded bg-[var(--color-surface-muted)]" />
      <div className="h-[420px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white" />
    </div>
  );
}
