import { useEffect, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Pencil,
  Trash2,
  Send,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useCreateQuestion,
  useCreateReply,
  useDeleteQuestion,
  useDeleteReply,
  useLessonQuestions,
  useToggleQuestionLike,
  useUpdateQuestion,
  useUpdateReply,
} from '@/features/questions/hooks';
import type {
  LessonQuestion,
  QuestionReply,
} from '@/features/questions/types';
import { useCurrentUser } from '@/features/auth/hooks';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Button } from '@/shared/components/ui/Button';
import { Alert } from '@/shared/components/ui/Alert';
import { HttpError } from '@/shared/api/client';
import { formatRelativeTime } from '@/shared/lib/relative-time';
import { cn } from '@/shared/lib/cn';

interface QATabProps {
  lessonId: string | null;
}

const TEXT_MAX = 2000;

export function QATab({ lessonId }: QATabProps) {
  const { data: currentUser } = useCurrentUser();
  const questionsQuery = useLessonQuestions(lessonId ?? undefined);

  const createMut = useCreateQuestion(lessonId ?? '');

  const [draft, setDraft] = useState('');

  if (!lessonId) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] py-12 text-center text-[14px] text-[var(--color-ink-500)]">
        اختر درساً لطرح الأسئلة.
      </div>
    );
  }

  const handleAsk = async () => {
    const value = draft.trim();
    if (!value) return;
    try {
      await createMut.mutateAsync({ text: value });
      setDraft('');
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر نشر السؤال');
    }
  };

  const askError =
    createMut.error instanceof HttpError ? createMut.error.message : null;

  return (
    <div>
      {/* ====== composer ====== */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4">
        <div className="flex items-start gap-3">
          <Avatar name={currentUser?.name} src={currentUser?.avatar} size={40} />
          <div className="min-w-0 flex-1">
            <textarea
              rows={2}
              maxLength={TEXT_MAX}
              placeholder="اطرح سؤالاً يراه المحاضر وباقي الطلاب…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="input-base resize-y leading-[1.7]"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button
                onClick={handleAsk}
                disabled={!draft.trim()}
                loading={createMut.isPending}
                size="sm"
              >
                نشر السؤال
              </Button>
            </div>
          </div>
        </div>
        {askError && (
          <Alert tone="danger" className="mt-3">
            {askError}
          </Alert>
        )}
      </div>

      {/* ====== list ====== */}
      <div className="mt-5 flex flex-col gap-3">
        {questionsQuery.isLoading && <Skeleton />}

        {questionsQuery.error && (
          <Alert tone="warning">
            تعذّر تحميل الأسئلة
            {questionsQuery.error instanceof HttpError
              ? ` — ${questionsQuery.error.message}`
              : ''}
          </Alert>
        )}

        {!questionsQuery.isLoading &&
          questionsQuery.data?.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] py-10 text-center text-[13.5px] text-[var(--color-ink-500)]">
              لم يطرح أحد سؤالاً بعد. كن أول من يبدأ النقاش.
            </div>
          )}

        {questionsQuery.data?.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            currentUserId={currentUser?.id}
            lessonId={lessonId}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   Question card — view + edit + like + replies
   ========================================================= */

function QuestionCard({
  question,
  currentUserId,
  lessonId,
}: {
  question: LessonQuestion;
  currentUserId: string | undefined;
  lessonId: string;
}) {
  const isOwn = currentUserId === question.userId;

  const updateMut = useUpdateQuestion(lessonId);
  const deleteMut = useDeleteQuestion(lessonId);
  const toggleLike = useToggleQuestionLike(lessonId);

  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('هل تريد حذف السؤال؟ سيتم حذف كل الردود معه.')) return;
    try {
      await deleteMut.mutateAsync(question.id);
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر الحذف');
    }
  };

  const handleSaveEdit = async (newText: string) => {
    try {
      await updateMut.mutateAsync({
        id: question.id,
        input: { text: newText },
      });
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر حفظ التعديل');
    }
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-4">
      {/* header */}
      <div className="mb-2 flex items-start gap-3">
        <Avatar name={question.user.name} src={question.user.avatar} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[14px] font-bold text-[var(--color-ink-900)]">
              {question.user.name}
            </span>
            <span className="text-[12px] text-[var(--color-ink-500)]">
              · {formatRelativeTime(question.createdAt)}
            </span>
          </div>
        </div>

        {isOwn && !editing && (
          <div className="flex items-center gap-0.5">
            <IconBtn label="تعديل" onClick={() => setEditing(true)}>
              <Pencil className="size-4" />
            </IconBtn>
            <IconBtn
              label="حذف"
              tone="danger"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
            >
              <Trash2 className="size-4" />
            </IconBtn>
          </div>
        )}
      </div>

      {/* body */}
      {editing ? (
        <InlineTextForm
          initial={question.text}
          saving={updateMut.isPending}
          errorMessage={
            updateMut.error instanceof HttpError ? updateMut.error.message : null
          }
          onSave={handleSaveEdit}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <p className="m-0 whitespace-pre-wrap text-[14px] leading-[1.7] text-[var(--color-ink-800)]">
          {question.text}
        </p>
      )}

      {/* actions */}
      <div className="mt-3 flex items-center gap-1">
        <ActionBtn
          icon={
            <Heart
              className={cn(
                'size-4',
                question.likedByMe
                  ? 'fill-current text-[var(--color-danger)]'
                  : '',
              )}
            />
          }
          label={`${question.likesCount}`}
          active={question.likedByMe}
          onClick={() =>
            toggleLike.mutate({
              id: question.id,
              currentlyLiked: question.likedByMe,
            })
          }
        />
        <ActionBtn
          icon={<MessageCircle className="size-4" />}
          label={
            question.repliesCount > 0
              ? `${question.repliesCount} رد`
              : 'الرد'
          }
          active={expanded}
          onClick={() => setExpanded((v) => !v)}
        />
      </div>

      {/* replies + reply composer */}
      {expanded && (
        <RepliesSection
          question={question}
          currentUserId={currentUserId}
          lessonId={lessonId}
          onClose={() => setExpanded(false)}
        />
      )}
    </div>
  );
}

/* =========================================================
   Replies section
   ========================================================= */

function RepliesSection({
  question,
  currentUserId,
  lessonId,
  onClose,
}: {
  question: LessonQuestion;
  currentUserId: string | undefined;
  lessonId: string;
  onClose: () => void;
}) {
  const { data: currentUser } = useCurrentUser();
  const createReply = useCreateReply(lessonId);
  const [draft, setDraft] = useState('');

  const handlePost = async () => {
    const value = draft.trim();
    if (!value) return;
    try {
      await createReply.mutateAsync({
        questionId: question.id,
        input: { text: value },
      });
      setDraft('');
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر إرسال الرد');
    }
  };

  const replyError =
    createReply.error instanceof HttpError ? createReply.error.message : null;

  return (
    <div className="mt-4 border-t border-[var(--color-line)] pt-4">
      {/* existing replies */}
      {question.replies.length > 0 && (
        <ul className="mb-4 flex flex-col gap-3">
          {question.replies.map((r) => (
            <li key={r.id}>
              <ReplyRow
                reply={r}
                isOwn={currentUserId === r.userId}
                lessonId={lessonId}
              />
            </li>
          ))}
        </ul>
      )}

      {/* compose reply */}
      <div className="flex items-start gap-2.5">
        <Avatar name={currentUser?.name} src={currentUser?.avatar} size={32} />
        <div className="min-w-0 flex-1">
          <textarea
            rows={2}
            maxLength={TEXT_MAX}
            placeholder="اكتب رداً…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="input-base resize-y leading-[1.7]"
          />
          {replyError && (
            <Alert tone="danger" className="mt-2">
              {replyError}
            </Alert>
          )}
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              iconStart={<X className="size-3.5" />}
            >
              إخفاء
            </Button>
            <Button
              size="sm"
              onClick={handlePost}
              disabled={!draft.trim()}
              loading={createReply.isPending}
              iconStart={<Send className="size-3.5" />}
            >
              إرسال
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyRow({
  reply,
  isOwn,
  lessonId,
}: {
  reply: QuestionReply;
  isOwn: boolean;
  lessonId: string;
}) {
  const updateMut = useUpdateReply(lessonId);
  const deleteMut = useDeleteReply(lessonId);
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('هل تريد حذف الرد؟')) return;
    try {
      await deleteMut.mutateAsync(reply.id);
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر الحذف');
    }
  };

  const handleSave = async (newText: string) => {
    try {
      await updateMut.mutateAsync({ id: reply.id, input: { text: newText } });
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof HttpError ? e.message : 'تعذّر حفظ التعديل');
    }
  };

  return (
    <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-3">
      <Avatar name={reply.user.name} src={reply.user.avatar} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[13px] font-bold text-[var(--color-ink-900)]">
              {reply.user.name}
            </span>
            <span className="text-[11.5px] text-[var(--color-ink-500)]">
              · {formatRelativeTime(reply.createdAt)}
            </span>
          </div>
          {isOwn && !editing && (
            <div className="flex items-center gap-0.5">
              <IconBtn label="تعديل" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" />
              </IconBtn>
              <IconBtn
                label="حذف"
                tone="danger"
                onClick={handleDelete}
                disabled={deleteMut.isPending}
              >
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <InlineTextForm
              initial={reply.text}
              saving={updateMut.isPending}
              errorMessage={
                updateMut.error instanceof HttpError
                  ? updateMut.error.message
                  : null
              }
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              compact
            />
          </div>
        ) : (
          <p className="m-0 mt-1 whitespace-pre-wrap text-[13.5px] leading-[1.7] text-[var(--color-ink-800)]">
            {reply.text}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Shared inline edit form
   ========================================================= */

function InlineTextForm({
  initial,
  saving,
  errorMessage,
  onSave,
  onCancel,
  compact,
}: {
  initial: string;
  saving: boolean;
  errorMessage: string | null;
  onSave: (text: string) => void;
  onCancel: () => void;
  compact?: boolean;
}) {
  const [draft, setDraft] = useState(initial);

  // Reset if a different note/question/reply opens for editing in the same slot.
  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  return (
    <div>
      <textarea
        rows={compact ? 2 : 3}
        maxLength={TEXT_MAX}
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
      <div className="mt-2 flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => draft.trim() && onSave(draft.trim())}
          disabled={!draft.trim() || draft === initial}
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

/* =========================================================
   Atoms
   ========================================================= */

function ActionBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
        active
          ? 'bg-[var(--color-brand-blue-50)] text-[var(--color-brand-blue-700)]'
          : 'text-[var(--color-ink-600)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink-900)]',
      )}
    >
      {icon}
      <span className="tabular-nums">{label}</span>
    </button>
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
          className="h-[120px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white"
        />
      ))}
    </>
  );
}
