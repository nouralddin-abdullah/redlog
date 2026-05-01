import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Eye,
  GripVertical,
  ImagePlus,
  ListChecks,
  Loader2,
  Pencil,
  Play,
  Plus,
  PlusCircle,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { coursesKeys } from '@/features/courses/hooks';
import { CourseStatusBadge } from '@/features/instructor/components/CourseStatusBadge';
import { instructorApi } from '@/features/instructor/api';
import {
  instructorKeys,
  useDeleteLesson,
  useDeleteModule,
  useInstructorCourse,
  useInstructorCurriculum,
  useUpdateCourse,
  useUpdateLesson,
  useUploadThumbnail,
} from '@/features/instructor/hooks';
import { formatEgp, formatTotalDuration } from '@/features/instructor/utils';
import type {
  InstructorCourseDetail,
  InstructorCurriculumLesson,
  InstructorCurriculumModule,
  ReorderCurriculumInput,
  UpdateCourseInput,
} from '@/features/instructor/types';

type Tab = 'curriculum' | 'metadata' | 'pricing' | 'thumbnail';

/**
 * Local "draft" of the curriculum tree. Mirrors the server shape but with
 * one key difference: new modules added via the editor have a temp `id`
 * (prefixed `new-`) and `isNew = true`. The save flow swaps the temp id
 * for the real one returned by `POST /modules` before sending the bulk
 * reorder.
 *
 * Lessons aren't mutable here — title/preview edits and lesson creation
 * happen on the dedicated lesson pages. The curriculum tab only stages the
 * order of lessons within a module.
 */
type DraftLesson = InstructorCurriculumLesson;

interface DraftModule {
  id: string;
  isNew: boolean;
  title: string;
  durationMinutes: number;
  lessons: DraftLesson[];
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

/**
 * Per-field length limits enforced server-side and mirrored here as
 * `maxLength` on the inputs (so the user gets typing-time feedback rather
 * than a 400 on save). Sourced from the instructor-dashboard-api spec.
 *
 * `features` is editable per the API but intentionally NOT exposed in this
 * UI — those bullets ("certificate", "lifetime access", "money-back…") are
 * treated as platform-level and managed elsewhere. PATCH bodies omit the
 * key entirely, so backend keeps whatever's there.
 */
const LIMITS = {
  badge: 50,
  whatYouWillLearnItem: 300,
  prerequisitesItem: 300,
} as const;

export function CourseEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const courseQuery = useInstructorCourse(slug);
  const curriculumQuery = useInstructorCurriculum(slug);
  const [tab, setTab] = useState<Tab>('curriculum');

  if (courseQuery.isLoading) {
    return <LoadingSkeleton />;
  }

  if (courseQuery.error || !courseQuery.data) {
    const status =
      courseQuery.error instanceof HttpError ? courseQuery.error.status : 0;
    return (
      <div className="mx-auto max-w-[640px] px-6 py-16 text-center">
        <h1 className="mb-2 text-[22px] font-bold text-[var(--color-ink-900)]">
          {status === 404 ? 'الكورس غير موجود' : 'تعذّر تحميل الكورس'}
        </h1>
        <p className="mb-5 text-[14px] text-[var(--color-ink-500)]">
          {status === 403
            ? 'لا تملك صلاحية الوصول لهذا الكورس.'
            : status === 404
              ? 'ربما تم حذف هذا الكورس أو الرابط غير صحيح.'
              : courseQuery.error instanceof HttpError
                ? courseQuery.error.message
                : 'حاول التحديث، أو ارجع لاحقاً.'}
        </p>
        <Link
          to="/instructor/courses"
          className="text-[13.5px] font-semibold text-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
        >
          العودة لكورساتي
        </Link>
      </div>
    );
  }

  const course = courseQuery.data;

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      <Link
        to="/instructor/courses"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
      >
        <ArrowRight className="size-3.5" />
        كل الكورسات
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <CourseStatusBadge status={course.status} size="md" />
            <CurriculumBreakdownChip
              totalLessons={course.totalLessons}
              durationMinutes={course.durationMinutes}
              modules={curriculumQuery.data}
            />
          </div>
          <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/courses/${course.slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-[var(--color-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)]"
          >
            <Eye className="size-4" />
            معاينة
          </Link>
        </div>
      </header>

      {course.status === 'rejected' && course.adminNote && (
        <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-[13px] text-[var(--color-danger)]">
          <div className="mb-1 font-bold">ملاحظات المراجعة</div>
          <p className="leading-relaxed">{course.adminNote}</p>
        </div>
      )}

      <nav className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
        <TabBtn id="curriculum" tab={tab} setTab={setTab}>
          المنهج
        </TabBtn>
        <TabBtn id="metadata" tab={tab} setTab={setTab}>
          المعلومات الأساسية
        </TabBtn>
        <TabBtn id="pricing" tab={tab} setTab={setTab}>
          السعر
        </TabBtn>
        <TabBtn id="thumbnail" tab={tab} setTab={setTab}>
          الصورة
        </TabBtn>
      </nav>

      {tab === 'curriculum' && (
        <CurriculumTabPanel
          courseId={course.id}
          slug={course.slug}
          modules={curriculumQuery.data}
          loading={curriculumQuery.isLoading}
          error={curriculumQuery.error}
        />
      )}
      {tab === 'metadata' && <MetadataTabPanel course={course} />}
      {tab === 'pricing' && <PricingTabPanel course={course} />}
      {tab === 'thumbnail' && <ThumbnailTabPanel course={course} />}
    </div>
  );
}

/**
 * Header chip line. `totalLessons` and `durationMinutes` are server-computed
 * (and read-only); the video / quiz split is derived client-side from the
 * curriculum tree, since the backend doesn't denormalize those onto Course.
 * Hides the per-type chips while curriculum is still loading so the line
 * doesn't flicker between two states.
 */
function CurriculumBreakdownChip({
  totalLessons,
  durationMinutes,
  modules,
}: {
  totalLessons: number;
  durationMinutes: number;
  modules: InstructorCurriculumModule[] | undefined;
}) {
  const breakdown = useMemo(() => {
    if (!modules) return null;
    const lessons = modules.flatMap((m) => m.lessons);
    const videos = lessons.filter((l) => l.type === 'video');
    const quizzes = lessons.filter((l) => l.type === 'quiz');
    return { videoCount: videos.length, quizCount: quizzes.length };
  }, [modules]);

  return (
    <span className="text-[12.5px] text-[var(--color-ink-500)]">
      {totalLessons} درس · {formatTotalDuration(durationMinutes)}
      {breakdown && breakdown.videoCount > 0 && (
        <> · {breakdown.videoCount} فيديو</>
      )}
      {breakdown && breakdown.quizCount > 0 && (
        <> · {breakdown.quizCount} اختبار</>
      )}
    </span>
  );
}

/* ============================== tabs ============================== */

function TabBtn({
  id,
  tab,
  setTab,
  children,
}: {
  id: Tab;
  tab: Tab;
  setTab: (t: Tab) => void;
  children: string;
}) {
  const active = id === tab;
  return (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={
        'relative px-4 py-3 text-[13.5px] font-semibold transition-colors ' +
        (active
          ? 'text-[var(--color-brand-blue-700)]'
          : 'text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]')
      }
    >
      {children}
      {active && (
        <span className="absolute bottom-[-1px] start-3 end-3 h-[2px] rounded-full bg-[var(--color-brand-blue)]" />
      )}
    </button>
  );
}

/**
 * Generic HTML5 drag-reorder helper. Shared between the modules list and
 * each module's lessons list. Tracks which item is being dragged + which
 * target the cursor is over, computes the new array on drop (insert the
 * dragged item just before the target), and calls back so the caller can
 * fire the reorder mutation.
 */
function useDragReorder<T extends { id: string }>(
  items: T[] | undefined,
  onReorder: (next: T[]) => void,
) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    if (!draggedId || draggedId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetId(id);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!items || !draggedId || draggedId === targetId) {
      onDragEnd();
      return;
    }
    const fromIdx = items.findIndex((x) => x.id === draggedId);
    const toIdx = items.findIndex((x) => x.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      onDragEnd();
      return;
    }
    const next = [...items];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved!);
    onReorder(next);
    onDragEnd();
  };

  return { draggedId, dropTargetId, onDragStart, onDragOver, onDragEnd, onDrop };
}

function CurriculumTabPanel({
  courseId,
  slug,
  modules,
  loading,
  error,
}: {
  courseId: string;
  slug: string;
  modules: InstructorCurriculumModule[] | undefined;
  loading: boolean;
  error: unknown;
}) {
  const qc = useQueryClient();
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [showNewModuleInput, setShowNewModuleInput] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // ---- Draft state ------------------------------------------------------
  // Local mirror of the server tree. Module add / rename / reorder + lesson
  // reorder all mutate `draft` in place — nothing hits the network until
  // the user clicks "حفظ التغييرات". Module/lesson DELETE and lesson
  // PREVIEW toggle still go through their own auto-mutations (destructive
  // / single-field changes — staging adds friction without value).
  const [draft, setDraft] = useState<DraftModule[] | null>(null);
  const [hasUserChanges, setHasUserChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync draft from server while the user hasn't edited anything. Once a
  // change is staged, freeze local state so a background refetch (e.g. an
  // auto-mutation like delete) doesn't blow away in-progress edits.
  useEffect(() => {
    if (!modules) return;
    if (hasUserChanges) return;
    setDraft(modules.map(serverToDraftModule));
  }, [modules, hasUserChanges]);

  // Open the first module by default once data lands. Re-runs only when
  // the module set changes, so manual collapses survive a refetch.
  useEffect(() => {
    if (!draft) return;
    setOpenModuleId((prev) => {
      if (prev && draft.some((m) => m.id === prev)) return prev;
      return draft[0]?.id ?? null;
    });
  }, [draft]);

  const moduleDrag = useDragReorder(draft ?? undefined, (next) => {
    setDraft(next);
    setHasUserChanges(true);
  });

  const handleRenameModule = (moduleId: string, nextTitle: string) => {
    if (!draft) return;
    setDraft(
      draft.map((m) =>
        m.id === moduleId ? { ...m, title: nextTitle.slice(0, 200) } : m,
      ),
    );
    setHasUserChanges(true);
  };

  const handleReorderLessons = (
    moduleId: string,
    nextLessons: DraftLesson[],
  ) => {
    if (!draft) return;
    setDraft(
      draft.map((m) =>
        m.id === moduleId ? { ...m, lessons: nextLessons } : m,
      ),
    );
    setHasUserChanges(true);
  };

  const handleAddModule = () => {
    if (!draft) return;
    const title = newModuleTitle.trim();
    if (!title) return;
    const tempId = `new-${
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    }`;
    setDraft([
      ...draft,
      {
        id: tempId,
        isNew: true,
        title: title.slice(0, 200),
        durationMinutes: 0,
        lessons: [],
      },
    ]);
    setHasUserChanges(true);
    setNewModuleTitle('');
    setShowNewModuleInput(false);
    setOpenModuleId(tempId);
  };

  /**
   * Save chain — sends staged work in dependency order:
   *
   *   1) `POST /modules` for every `isNew` module (collect server ids).
   *   2) `PATCH /modules/:id` for every existing module whose title shifted.
   *   3) `PUT /curriculum/order` with the final tree, mapping temp ids to
   *      the real ones.
   *
   * Errors abort the chain mid-flight; whatever has already landed on the
   * server stays committed (refetch on the way out picks up the partial
   * state). The reorder endpoint is the only one with strict-set semantics
   * — it'll 400 if our snapshot is out of date, which is good: surfacing
   * that to the user is better than silently dropping their reorder.
   */
  const handleSave = async () => {
    if (!draft || !modules || isSaving) return;
    setIsSaving(true);
    try {
      const idMap = new Map<string, string>();

      for (const m of draft.filter((d) => d.isNew)) {
        const created = await instructorApi.createModule(courseId, {
          title: m.title,
        });
        idMap.set(m.id, created.id);
      }

      const serverTitles = new Map(modules.map((m) => [m.id, m.title]));
      for (const m of draft) {
        if (m.isNew) continue;
        const serverTitle = serverTitles.get(m.id);
        if (serverTitle !== undefined && serverTitle !== m.title) {
          await instructorApi.updateModule(m.id, { title: m.title });
        }
      }

      const body: ReorderCurriculumInput = {
        modules: draft.map((m) => ({
          id: idMap.get(m.id) ?? m.id,
          lessonIds: m.lessons.map((l) => l.id),
        })),
      };
      await instructorApi.reorderCurriculum(courseId, body);

      void qc.invalidateQueries({ queryKey: instructorKeys.curriculum(slug) });
      void qc.invalidateQueries({ queryKey: instructorKeys.course(slug) });
      void qc.invalidateQueries({ queryKey: instructorKeys.courses() });
      void qc.invalidateQueries({ queryKey: coursesKeys.curriculum(slug) });
      void qc.invalidateQueries({ queryKey: coursesKeys.detail(slug) });

      toast.success('تم حفظ التغييرات');
      setHasUserChanges(false); // useEffect will re-sync once refetch lands
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!modules) return;
    setDraft(modules.map(serverToDraftModule));
    setHasUserChanges(false);
    setShowNewModuleInput(false);
    setNewModuleTitle('');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[68px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="warning">
        تعذّر تحميل المنهج
        {error instanceof HttpError ? ` — ${error.message}` : ''}
      </Alert>
    );
  }

  if (!draft) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Save bar — sticky so reorder + rename feedback stays in view */}
      <CurriculumSaveBar
        dirty={hasUserChanges}
        saving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {draft.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-white py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]">
            <ListChecks className="size-5" />
          </div>
          <h3 className="m-0 mb-1.5 text-[16px] font-bold text-[var(--color-ink-900)]">
            ابدأ بإضافة وحدتك الأولى
          </h3>
          <p className="mb-5 max-w-[420px] text-[13.5px] text-[var(--color-ink-500)]">
            الوحدات تنظم دروسك في مجموعات منطقية. أضف وحدة ثم وزع الدروس
            عليها.
          </p>
          <NewModuleInline
            show
            title={newModuleTitle}
            setTitle={setNewModuleTitle}
            onSubmit={handleAddModule}
            onCancel={() => {
              setNewModuleTitle('');
              setShowNewModuleInput(false);
            }}
            // Staging — no network call; the inline submit is instant
            loading={false}
          />
        </div>
      ) : (
        <>
          {draft.map((mod) => (
            <ModuleCard
              key={mod.id}
              slug={slug}
              mod={mod}
              open={mod.id === openModuleId}
              onToggle={() =>
                setOpenModuleId(mod.id === openModuleId ? null : mod.id)
              }
              isDragging={moduleDrag.draggedId === mod.id}
              isDropTarget={moduleDrag.dropTargetId === mod.id}
              onDragStart={(e) => moduleDrag.onDragStart(e, mod.id)}
              onDragOver={(e) => moduleDrag.onDragOver(e, mod.id)}
              onDragEnd={moduleDrag.onDragEnd}
              onDrop={(e) => moduleDrag.onDrop(e, mod.id)}
              onRename={(next) => handleRenameModule(mod.id, next)}
              onReorderLessons={(next) => handleReorderLessons(mod.id, next)}
              onSavedChangesNeeded={() => setHasUserChanges(true)}
            />
          ))}

          {showNewModuleInput ? (
            <NewModuleInline
              show
              title={newModuleTitle}
              setTitle={setNewModuleTitle}
              onSubmit={handleAddModule}
              onCancel={() => {
                setNewModuleTitle('');
                setShowNewModuleInput(false);
              }}
              loading={false}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNewModuleInput(true)}
              className="flex h-12 items-center justify-center gap-1.5 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-line-strong)] bg-white text-[13.5px] font-semibold text-[var(--color-ink-700)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
            >
              <PlusCircle className="size-4" />
              إضافة وحدة جديدة
            </button>
          )}
        </>
      )}

      <div className="rounded-[var(--radius-md)] border border-[var(--color-brand-blue-100)] bg-[var(--color-brand-blue-50)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--color-brand-blue-700)]">
        <strong className="font-bold">معلومة:</strong> تعديل المنهج على كورس
        منشور لا يظهر للطلاب فوراً — التغييرات الجوهرية قد تتطلب إعادة إرسال
        الكورس للمراجعة.
      </div>
    </div>
  );
}

/**
 * Sticky save bar at the top of the curriculum tab. Stays out of the way
 * when there are no pending changes; turns blue + active once the user
 * starts editing. Cancel reverts to the last server snapshot.
 */
function CurriculumSaveBar({
  dirty,
  saving,
  onSave,
  onCancel,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className={
        'sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border bg-white px-4 py-2.5 shadow-[var(--shadow-xs)] transition-colors ' +
        (dirty
          ? 'border-[var(--color-brand-blue)] ring-2 ring-[var(--color-brand-blue-100)]'
          : 'border-[var(--color-line)]')
      }
    >
      <div className="text-[13px] text-[var(--color-ink-700)]">
        {dirty ? (
          <span className="font-semibold text-[var(--color-brand-blue-700)]">
            هناك تغييرات غير محفوظة
          </span>
        ) : (
          <span className="text-[var(--color-ink-500)]">لا توجد تغييرات</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={!dirty || saving}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-[12.5px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCcw className="size-3.5" />
          إلغاء
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="btn-base inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-[var(--color-brand-navy)] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)] disabled:opacity-40 disabled:hover:bg-[var(--color-brand-navy)]"
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

function serverToDraftModule(m: InstructorCurriculumModule): DraftModule {
  return {
    id: m.id,
    isNew: false,
    title: m.title,
    durationMinutes: m.durationMinutes,
    lessons: m.lessons.map((l) => ({ ...l })),
  };
}

function NewModuleInline({
  show,
  title,
  setTitle,
  onSubmit,
  onCancel,
  loading,
}: {
  show: boolean;
  title: string;
  setTitle: (s: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-50)] p-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSubmit();
          }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="عنوان الوحدة الجديدة..."
        maxLength={200}
        className="input-base h-10 flex-1 bg-white text-[13.5px]"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !title.trim()}
        className="btn-base inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[12.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)] disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        إضافة
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex size-10 items-center justify-center rounded-[10px] text-[var(--color-ink-600)] hover:bg-white"
        aria-label="إلغاء"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

interface ModuleCardProps {
  slug: string;
  mod: DraftModule;
  open: boolean;
  onToggle: () => void;
  // Drag-and-drop (module-level)
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  // Staged-edit callbacks
  onRename: (next: string) => void;
  onReorderLessons: (next: InstructorCurriculumLesson[]) => void;
  /** Bumps the dirty flag on the parent — used by the auto-mutated
   *  delete/preview-toggle paths so the save bar still reflects activity
   *  if a refetch fires while the user has other staged edits. */
  onSavedChangesNeeded: () => void;
}

function ModuleCard({
  slug,
  mod,
  open,
  onToggle,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onRename,
  onReorderLessons,
}: ModuleCardProps) {
  const navigate = useNavigate();
  const deleteModule = useDeleteModule(slug);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(mod.title);
  const lastTitleSync = useRef(mod.title);

  // Re-sync local input draft if the parent's view of the module title
  // changed (e.g. cancel restored from server).
  useEffect(() => {
    if (mod.title !== lastTitleSync.current) {
      lastTitleSync.current = mod.title;
      setTitleDraft(mod.title);
    }
  }, [mod.title]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    setEditingTitle(false);
    if (!trimmed || trimmed === mod.title) {
      setTitleDraft(mod.title);
      return;
    }
    // Stage the rename — no network call here; the save bar's "حفظ" sends
    // a `PATCH /modules/:id` for every module whose title shifted.
    onRename(trimmed);
  };

  const handleDelete = () => {
    if (mod.isNew) {
      // Local-only — never went to the server. Drop it from the draft via
      // the same rename->staged path? Cleaner: we don't expose deleteModule
      // here for new modules. Instead, ask parent (via `onRename('')` is
      // not right). We can't easily delete from this component without a
      // parent callback. For simplicity, rely on the staged-deletion path:
      // a future `onRemove` prop is the proper API. For now, prevent
      // deletion of new-but-unsaved modules until a save lands.
      toast.message('احفظ التغييرات أولاً ثم احذف الوحدة.');
      return;
    }
    if (!window.confirm(`سيتم حذف "${mod.title}" وكل دروسها. هل أنت متأكد؟`))
      return;
    deleteModule.mutate(
      { moduleId: mod.id },
      {
        onSuccess: () => toast.success('تم حذف الوحدة'),
        onError: (e) =>
          toast.error(
            e instanceof HttpError ? e.message : 'تعذّر حذف الوحدة',
          ),
      },
    );
  };

  // Per-module lesson drag — scoped here so each module manages its own
  // dragged/drop-target state without bleeding across modules. Reorders
  // hit the parent's draft via `onReorderLessons` (staged, not networked).
  const lessonDrag = useDragReorder(mod.lessons, onReorderLessons);

  return (
    <article
      // Drop zone covers the whole article so the cursor doesn't have to
      // land on a 1-pixel border. Drag is initiated from the grip handle
      // only via the `draggable` attribute on the row container — see below.
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={
        'overflow-hidden rounded-[var(--radius-lg)] border bg-white shadow-[var(--shadow-xs)] transition-[border-color,opacity] ' +
        (isDragging ? 'opacity-50 ' : '') +
        (isDropTarget
          ? 'border-[var(--color-brand-blue)] ring-2 ring-[var(--color-brand-blue-100)]'
          : 'border-[var(--color-line)]')
      }
    >
      <header
        // Whole header is draggable; clicking the title-area toggles
        // open/close (separate handler). Edit is gated behind the pen icon.
        draggable={!editingTitle}
        onDragStart={onDragStart}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        <span
          aria-hidden
          className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded text-[var(--color-ink-400)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-700)] active:cursor-grabbing"
          title="اسحب لإعادة الترتيب"
        >
          <GripVertical className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.currentTarget.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
                if (e.key === 'Escape') {
                  setTitleDraft(mod.title);
                  setEditingTitle(false);
                }
              }}
              maxLength={200}
              className="h-9 w-full rounded-[6px] bg-white px-2 text-[14.5px] font-bold text-[var(--color-ink-900)] outline-none ring-2 ring-[var(--color-brand-blue-100)] focus:ring-[var(--color-brand-blue)]"
            />
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-[6px] px-2 py-1 text-start hover:bg-[var(--color-surface-soft)]"
            >
              <span className="line-clamp-1 text-[14.5px] font-bold text-[var(--color-ink-900)]">
                {mod.title}
              </span>
              <span className="text-[11.5px] text-[var(--color-ink-500)]">
                {mod.lessons.length} درس
                {mod.durationMinutes > 0 &&
                  ` · ${formatTotalDuration(mod.durationMinutes)}`}
              </span>
            </button>
          )}
        </div>

        {!editingTitle && (
          <>
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
              aria-label={open ? 'طي الوحدة' : 'فتح الوحدة'}
            >
              {open ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]"
              aria-label="تعديل الاسم"
              title="تعديل الاسم"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteModule.isPending}
              className="inline-flex size-9 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] disabled:opacity-50"
              aria-label="حذف الوحدة"
              title="حذف الوحدة"
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        )}
      </header>

      {open && (
        // Soft-surface panel with a small start-inline indent — the indent
        // is what tells the eye "these belong to the module above" without
        // turning every lesson into its own card.
        <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-soft)] ps-4">
          {mod.lessons.length === 0 ? (
            <div className="px-5 py-6 text-center text-[12.5px] text-[var(--color-ink-500)]">
              لا توجد دروس في هذه الوحدة بعد.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {mod.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  slug={slug}
                  lesson={lesson}
                  isDragging={lessonDrag.draggedId === lesson.id}
                  isDropTarget={lessonDrag.dropTargetId === lesson.id}
                  onDragStart={(e) => lessonDrag.onDragStart(e, lesson.id)}
                  onDragOver={(e) => lessonDrag.onDragOver(e, lesson.id)}
                  onDragEnd={lessonDrag.onDragEnd}
                  onDrop={(e) => lessonDrag.onDrop(e, lesson.id)}
                />
              ))}
            </ul>
          )}

          <div className="border-t border-[var(--color-line)] px-4 py-3">
            {/* Add-lesson navigation. The full lesson form (video upload,
                preview toggle, attachments, etc.) lives on the dedicated
                NewLessonPage — too rich to fit a curriculum row. New
                modules can't host lessons until they're saved (no real
                moduleId yet on the server). */}
            {mod.isNew ? (
              <div className="text-[12.5px] text-[var(--color-ink-500)]">
                احفظ التغييرات قبل إضافة دروس لهذه الوحدة.
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/instructor/courses/${slug}/lessons/new?moduleId=${mod.id}`,
                  )
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-dashed border-[var(--color-line-strong)] bg-white px-3 text-[12.5px] font-semibold text-[var(--color-ink-700)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
              >
                <PlusCircle className="size-3.5" />
                إضافة درس
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

interface LessonRowProps {
  slug: string;
  lesson: InstructorCurriculumLesson;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}

function LessonRow({
  slug,
  lesson,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: LessonRowProps) {
  const navigate = useNavigate();
  const updateLesson = useUpdateLesson(slug);
  const deleteLesson = useDeleteLesson(slug);

  const togglePreview = () => {
    updateLesson.mutate(
      { lessonId: lesson.id, body: { isPreview: !lesson.isPreview } },
      {
        onError: (e) =>
          toast.error(
            e instanceof HttpError ? e.message : 'تعذّر تعديل الدرس',
          ),
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`سيتم حذف "${lesson.title}". هل أنت متأكد؟`)) return;
    deleteLesson.mutate(
      { lessonId: lesson.id },
      {
        onSuccess: () => toast.success('تم حذف الدرس'),
        onError: (e) =>
          toast.error(e instanceof HttpError ? e.message : 'تعذّر حذف الدرس'),
      },
    );
  };

  const handleEdit = () => {
    navigate(`/instructor/courses/${slug}/lessons/${lesson.id}/edit`);
  };

  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      // Flat row — no per-row border or card. The parent's `divide-y`
      // handles separation; the surface tint already says "I'm a child of
      // this module". Drop-target gets a subtle blue wash so we don't have
      // to add visual weight that wasn't there before.
      className={
        'flex items-center gap-3 px-4 py-2.5 transition-colors ' +
        (isDragging ? 'opacity-40 ' : '') +
        (isDropTarget ? 'bg-[var(--color-brand-blue-50)]' : '')
      }
    >
      <span
        aria-hidden
        className="cursor-grab text-[var(--color-ink-400)] hover:text-[var(--color-ink-700)] active:cursor-grabbing"
        title="اسحب لإعادة الترتيب"
      >
        <GripVertical className="size-4" />
      </span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-muted)] text-[var(--color-ink-600)]">
        {lesson.type === 'video' ? (
          <Play className="size-3.5" />
        ) : (
          <ListChecks className="size-3.5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-[var(--color-ink-900)]">
          {lesson.title}
        </div>
        <div className="text-[11.5px] text-[var(--color-ink-500)]">
          {lesson.type === 'video' ? 'فيديو' : 'اختبار'}
          {lesson.durationSeconds > 0 &&
            ` · ${Math.round(lesson.durationSeconds / 60)}د`}
        </div>
      </div>

      <button
        type="button"
        onClick={togglePreview}
        disabled={updateLesson.isPending}
        className={
          'inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ' +
          (lesson.isPreview
            ? 'bg-[var(--color-success-soft)] text-[var(--color-success)] hover:brightness-95'
            : 'bg-white text-[var(--color-ink-500)] ring-1 ring-[var(--color-line)] hover:text-[var(--color-ink-800)]')
        }
        title="معاينة مجانية للزوار"
      >
        {lesson.isPreview ? 'معاينة' : 'مغلق'}
      </button>
      {/* Pen → dedicated lesson editor page (full form: title, video,
          attachments, transcript, etc.). Inline title edit was too thin
          for what the lesson form actually needs to expose. */}
      <button
        type="button"
        onClick={handleEdit}
        className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-white hover:text-[var(--color-ink-900)]"
        aria-label="تعديل الدرس"
        title="تعديل الدرس"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteLesson.isPending}
        className="inline-flex size-8 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] disabled:opacity-50"
        aria-label="حذف الدرس"
        title="حذف الدرس"
      >
        <Trash2 className="size-3.5" />
      </button>
    </li>
  );
}

function MetadataTabPanel({ course }: { course: InstructorCourseDetail }) {
  const updateCourse = useUpdateCourse(course.slug);
  // Arrays are stored as arrays here — not as `\n`-delimited strings — so a
  // row can hold an empty value mid-edit without disappearing from the list.
  // Empty / over-length items are filtered + clamped at save time.
  const [form, setForm] = useState({
    title: course.title,
    description: course.description ?? '',
    longDescription: course.longDescription ?? '',
    badge: course.badge ?? '',
    whatYouWillLearn: course.whatYouWillLearn,
    prerequisites: course.prerequisites,
  });

  // Re-sync local state if the course refetches mid-edit (e.g. invalidation
  // after thumbnail upload). Only resets when `updatedAt` changes — don't
  // blow away in-progress edits on every render.
  const lastSync = useRef(course.updatedAt);
  useEffect(() => {
    if (course.updatedAt === lastSync.current) return;
    lastSync.current = course.updatedAt;
    setForm({
      title: course.title,
      description: course.description ?? '',
      longDescription: course.longDescription ?? '',
      badge: course.badge ?? '',
      whatYouWillLearn: course.whatYouWillLearn,
      prerequisites: course.prerequisites,
    });
  }, [course]);

  const handleSave = () => {
    // `features` is intentionally absent from the body — the backend
    // accepts it on PATCH, but the editor doesn't expose those platform-
    // level bullets to instructors. Partial PATCH means the existing
    // values stay untouched on the server.
    const body: UpdateCourseInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription.trim(),
      badge: form.badge.trim()
        ? form.badge.trim().slice(0, LIMITS.badge)
        : null,
      whatYouWillLearn: cleanList(
        form.whatYouWillLearn,
        LIMITS.whatYouWillLearnItem,
      ),
      prerequisites: cleanList(form.prerequisites, LIMITS.prerequisitesItem),
    };
    updateCourse.mutate(
      { courseId: course.id, body },
      {
        onSuccess: () => toast.success('تم حفظ التعديلات'),
        onError: (e) =>
          toast.error(
            e instanceof HttpError ? e.message : 'تعذّر حفظ التعديلات',
          ),
      },
    );
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-xs)]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="عنوان الكورس" full>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
            className="input-base h-11 w-full text-[14px]"
          />
        </Field>
        <Field label="عنوان فرعي / وصف قصير" full hint="جملة قصيرة تظهر تحت العنوان">
          <input
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.currentTarget.value })
            }
            className="input-base h-11 w-full text-[14px]"
          />
        </Field>
        <Field
          label="شارة الكورس (اختياري)"
          hint={`مثال: الأكثر طلباً · ${form.badge.length}/${LIMITS.badge}`}
        >
          <input
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.currentTarget.value })}
            maxLength={LIMITS.badge}
            className="input-base h-11 w-full text-[14px]"
          />
        </Field>
        <Field label="الوصف التفصيلي" full>
          <textarea
            value={form.longDescription}
            onChange={(e) =>
              setForm({ ...form, longDescription: e.currentTarget.value })
            }
            rows={6}
            className="input-base w-full resize-y px-3.5 py-2.5 text-[14px] leading-relaxed"
          />
        </Field>
        <ListField
          label="ماذا سيتعلم الطالب"
          hint={`حد أقصى ${LIMITS.whatYouWillLearnItem} حرف لكل عنصر`}
          maxItemLength={LIMITS.whatYouWillLearnItem}
          full
          value={form.whatYouWillLearn}
          onChange={(v) => setForm({ ...form, whatYouWillLearn: v })}
        />
        <ListField
          label="المتطلبات السابقة"
          hint={`حد أقصى ${LIMITS.prerequisitesItem} حرف لكل عنصر`}
          maxItemLength={LIMITS.prerequisitesItem}
          full
          value={form.prerequisites}
          onChange={(v) => setForm({ ...form, prerequisites: v })}
        />
      </div>

      <SaveBar
        loading={updateCourse.isPending}
        onSave={handleSave}
        error={updateCourse.error}
      />
    </div>
  );
}

function PricingTabPanel({ course }: { course: InstructorCourseDetail }) {
  const updateCourse = useUpdateCourse(course.slug);
  const [price, setPrice] = useState(course.price);
  const [originalPrice, setOriginalPrice] = useState(course.originalPrice ?? '');

  const lastSync = useRef(course.updatedAt);
  useEffect(() => {
    if (course.updatedAt === lastSync.current) return;
    lastSync.current = course.updatedAt;
    setPrice(course.price);
    setOriginalPrice(course.originalPrice ?? '');
  }, [course]);

  const handleSave = () => {
    const body: UpdateCourseInput = {
      price,
      originalPrice: originalPrice.trim() ? originalPrice : null,
    };
    updateCourse.mutate(
      { courseId: course.id, body },
      {
        onSuccess: () => toast.success('تم حفظ السعر'),
        onError: (e) =>
          toast.error(e instanceof HttpError ? e.message : 'تعذّر حفظ السعر'),
      },
    );
  };

  const netRevenue = (Number.parseFloat(price) || 0) * 0.7;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-xs)]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="السعر النهائي (ج.م)">
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.currentTarget.value)}
              className="input-base h-11 w-full ps-12 text-[14px] tabular-nums"
              min="0"
              step="1"
            />
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[var(--color-ink-400)]">
              ج.م
            </span>
          </div>
        </Field>
        <Field label="السعر قبل الخصم (ج.م)" hint="اختياري">
          <div className="relative">
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.currentTarget.value)}
              className="input-base h-11 w-full ps-12 text-[14px] tabular-nums"
              min="0"
              step="1"
            />
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[var(--color-ink-400)]">
              ج.م
            </span>
          </div>
        </Field>
      </div>
      <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-4 text-[13px] text-[var(--color-ink-700)]">
        <div className="mb-1 font-bold text-[var(--color-ink-900)]">
          عمولة المنصة
        </div>
        <p className="leading-relaxed">
          تحتفظ Radlog بنسبة 30% من قيمة كل اشتراك. صافي ربحك من السعر الحالي:{' '}
          <span className="font-bold text-[var(--color-brand-blue-700)]">
            {formatEgp(netRevenue)}
          </span>{' '}
          لكل طالب.
        </p>
      </div>

      <SaveBar
        loading={updateCourse.isPending}
        onSave={handleSave}
        error={updateCourse.error}
      />
    </div>
  );
}

function ThumbnailTabPanel({ course }: { course: InstructorCourseDetail }) {
  const upload = useUploadThumbnail(course.slug);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Free the object URL when it changes / the component unmounts. Without
  // this the browser holds onto the file blob.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const onFileChosen = (file: File) => {
    setValidationError(null);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setValidationError('الصيغة غير مدعومة — JPG / PNG / GIF / WEBP فقط.');
      return;
    }
    if (file.size > MAX_THUMBNAIL_BYTES) {
      setValidationError('حجم الملف يتجاوز 5 ميجا.');
      return;
    }
    // Optimistic preview while the upload is in flight.
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    upload.mutate(
      { courseId: course.id, file },
      {
        onSuccess: () => {
          toast.success('تم رفع الصورة');
          // The next refetch swaps the preview for the real CDN URL via the
          // course query invalidation in `useUploadThumbnail`. Clear the
          // local preview so the swap is clean.
          setPreviewUrl(null);
        },
        onError: (e) => {
          toast.error(e instanceof HttpError ? e.message : 'فشل رفع الصورة');
          setPreviewUrl(null);
        },
      },
    );
  };

  const displayedThumbnail = previewUrl ?? course.thumbnail;
  // Reset on URL change so a fresh upload's blob preview gets one fair
  // shot to render before we fall back to the placeholder.
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [displayedThumbnail]);
  const showImage = Boolean(displayedThumbnail) && !imgFailed;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-xs)]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {showImage ? (
            <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-soft)]">
              <img
                src={displayedThumbnail!}
                alt="صورة الكورس"
                onError={() => setImgFailed(true)}
                className="aspect-video w-full object-cover"
              />
              {upload.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-line)] bg-white px-4 py-3">
                <span className="text-[12px] text-[var(--color-ink-500)]">
                  تظهر هذه الصورة في صفحة الكورس وفي قوائم البحث.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={upload.isPending}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-[var(--color-line-strong)] bg-white px-3 text-[12.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                  >
                    <Upload className="size-3.5" />
                    استبدال
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] py-16 text-center transition-colors hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-50)] disabled:opacity-60"
            >
              {upload.isPending ? (
                <Loader2 className="size-7 animate-spin text-[var(--color-ink-500)]" />
              ) : (
                <ImagePlus className="size-7 text-[var(--color-ink-500)]" />
              )}
              <span className="text-[13.5px] font-semibold text-[var(--color-ink-800)]">
                رفع صورة جديدة
              </span>
              <span className="text-[12px] text-[var(--color-ink-500)]">
                JPG / PNG / WEBP · 1280×720 على الأقل
              </span>
            </button>
          )}

          {validationError && (
            <div className="mt-3 rounded-[8px] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-3 py-2 text-[12.5px] text-[var(--color-danger)]">
              {validationError}
            </div>
          )}
          {upload.error && !validationError && (
            <div className="mt-3 rounded-[8px] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-3 py-2 text-[12.5px] text-[var(--color-danger)]">
              {upload.error instanceof HttpError
                ? upload.error.message
                : 'فشل رفع الصورة'}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              if (file) onFileChosen(file);
              // Reset so picking the same file again still fires onChange.
              e.currentTarget.value = '';
            }}
          />
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-4">
          <div className="mb-2 text-[13px] font-bold text-[var(--color-ink-900)]">
            توصيات الصورة
          </div>
          <ul className="m-0 list-disc space-y-1.5 ps-5 text-[12.5px] text-[var(--color-ink-600)]">
            <li>أبعاد 16:9 (مثلاً 1920×1080)</li>
            <li>دقة 1280×720 على الأقل</li>
            <li>صورة واضحة لا يحجبها نص أو شعار كبير</li>
            <li>تجنّب الإضاءة الخافتة جداً</li>
            <li>ابتعد عن العلامات التجارية لأطراف ثالثة</li>
            <li>الحد الأقصى للحجم: 5 ميجا</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ============================== shared ============================== */

function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-semibold text-[var(--color-ink-700)]">
          {label}
        </label>
        {hint && (
          <span className="text-[11px] text-[var(--color-ink-400)]">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Inline-editable list. Each row is a real `<input>` bound to its index in
 * the array, so the user can click into any existing item and edit it.
 * Empty rows survive while the user is typing; they're filtered (and
 * clamped to the per-item char cap) at save time, not on every keystroke.
 *
 * The "+ إضافة" button appends a fresh empty row and auto-focuses it.
 * Pressing Enter inside any row also appends + focuses a new row, mimicking
 * the way most checklist editors feel.
 */
function ListField({
  label,
  hint,
  full,
  value,
  onChange,
  maxItemLength,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  /** Per-item character cap — mirrored as the input's `maxLength`. */
  maxItemLength?: number;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // When set, the next render focuses that index and clears the request.
  // Used to land focus on the just-appended empty row.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  useEffect(() => {
    if (focusIndex === null) return;
    inputRefs.current[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex]);

  const updateAt = (idx: number, text: string) => {
    const next = [...value];
    next[idx] = text;
    onChange(next);
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    onChange([...value, '']);
    setFocusIndex(value.length);
  };

  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-semibold text-[var(--color-ink-700)]">
          {label}
        </label>
        {hint && (
          <span className="text-[11px] text-[var(--color-ink-400)]">{hint}</span>
        )}
      </div>

      {value.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1.5">
          {value.map((item, i) => {
            const overLimit =
              maxItemLength !== undefined && item.length >= maxItemLength;
            return (
              <li
                key={i}
                className="flex items-center gap-2 rounded-[8px] border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13.5px] text-[var(--color-ink-800)] focus-within:border-[var(--color-brand-blue)] focus-within:shadow-[0_0_0_3px_var(--color-brand-blue-100)]"
              >
                <input
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={item}
                  onChange={(e) => updateAt(i, e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  maxLength={maxItemLength}
                  placeholder="اكتب العنصر هنا…"
                  className="h-8 flex-1 bg-transparent text-[13.5px] text-[var(--color-ink-800)] outline-none placeholder:text-[var(--color-ink-400)]"
                />
                {maxItemLength !== undefined && item.length > 0 && (
                  <span
                    className={
                      'shrink-0 text-[10.5px] tabular-nums ' +
                      (overLimit
                        ? 'text-[var(--color-warning)]'
                        : 'text-[var(--color-ink-400)]')
                    }
                  >
                    {item.length}/{maxItemLength}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--color-ink-500)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                  aria-label="حذف"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex h-10 items-center gap-1 rounded-[10px] border border-dashed border-[var(--color-line-strong)] bg-white px-3 text-[12.5px] font-semibold text-[var(--color-ink-700)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue-700)]"
      >
        <Plus className="size-3.5" />
        إضافة عنصر
      </button>
    </div>
  );
}

function SaveBar({
  loading,
  onSave,
  error,
}: {
  loading: boolean;
  onSave: () => void;
  error: unknown;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--color-line)] pt-5">
      <div className="text-[12.5px] text-[var(--color-danger)]">
        {error instanceof HttpError ? error.message : ''}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="btn-base inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[13.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        حفظ
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-4 h-4 w-[120px] animate-pulse rounded bg-[var(--color-surface-muted)]" />
      <div className="mb-2 h-6 w-[180px] animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
      <div className="mb-8 h-9 w-[420px] animate-pulse rounded bg-[var(--color-surface-muted)]" />
      <div className="mb-6 h-12 w-full animate-pulse rounded bg-[var(--color-surface-muted)]" />
      <div className="h-[320px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white" />
    </div>
  );
}

/** Trim, drop empties, and clamp to the per-item char cap. Last line of
 *  defense before sending the array to `PATCH /courses/:id`. */
function cleanList(items: string[], maxItemLength: number): string[] {
  return items
    .map((item) => item.trim().slice(0, maxItemLength))
    .filter(Boolean);
}
