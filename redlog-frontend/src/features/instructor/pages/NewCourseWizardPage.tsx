import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Info,
  Tag,
  Wallet,
} from 'lucide-react';

const STEPS = [
  { key: 'basics', label: 'الأساسيات', icon: Info },
  { key: 'media', label: 'الصورة والوصف', icon: ImagePlus },
  { key: 'pricing', label: 'السعر والتصنيف', icon: Wallet },
  { key: 'review', label: 'مراجعة وحفظ', icon: Check },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export function NewCourseWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StepKey>('basics');

  // Form state — kept in one object so the review step can render every value
  // without a giant prop drill.
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    longDescription: '',
    category: '',
    price: '',
    originalPrice: '',
    targetAudience: '',
  });

  const stepIdx = STEPS.findIndex((s) => s.key === step);

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]!.key);
  };
  const goPrev = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]!.key);
  };

  const handleSubmit = () => {
    // Mock — in production this calls POST /courses then navigates to editor.
    navigate('/instructor/courses');
  };

  return (
    <div className="mx-auto max-w-[960px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8">
        <Link
          to="/instructor/courses"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-500)] hover:text-[var(--color-ink-800)]"
        >
          <ArrowRight className="size-3.5" />
          العودة إلى كورساتي
        </Link>
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          إنشاء كورس جديد
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          أكمل الخطوات التالية لإنشاء كورسك. يمكنك حفظه كمسودة وإكمال التعديل
          لاحقاً.
        </p>
      </header>

      {/* === Stepper ====================================================== */}
      <ol className="mb-8 flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = s.key === step;
          const done = i < stepIdx;
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s.key)}
                className={
                  'flex flex-1 items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-semibold transition-colors ' +
                  (active
                    ? 'bg-[var(--color-brand-blue-100)] text-[var(--color-brand-blue-700)]'
                    : done
                      ? 'text-[var(--color-success)] hover:bg-[var(--color-success-soft)]'
                      : 'text-[var(--color-ink-500)] hover:bg-[var(--color-surface-muted)]')
                }
              >
                <span
                  className={
                    'flex size-7 shrink-0 items-center justify-center rounded-full ' +
                    (active
                      ? 'bg-[var(--color-brand-blue)] text-white'
                      : done
                        ? 'bg-[var(--color-success)] text-white'
                        : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-500)]')
                  }
                >
                  {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                </span>
                <span className="text-[12.5px]">
                  <span className="me-1 text-[var(--color-ink-400)]">
                    {i + 1}.
                  </span>
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* === Step body ==================================================== */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-xs)]">
        {step === 'basics' && (
          <BasicsStep form={form} setForm={setForm} />
        )}
        {step === 'media' && <MediaStep form={form} setForm={setForm} />}
        {step === 'pricing' && (
          <PricingStep form={form} setForm={setForm} />
        )}
        {step === 'review' && <ReviewStep form={form} />}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-5">
          <button
            type="button"
            onClick={goPrev}
            disabled={stepIdx === 0}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[13.5px] font-semibold text-[var(--color-ink-700)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ArrowRight className="size-4" />
            السابق
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-[10px] border border-[var(--color-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)]"
            >
              حفظ كمسودة
            </button>
            {step === 'review' ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-base inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[13.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)]"
              >
                <Check className="size-4" />
                تقديم للمراجعة
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="btn-base inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[13.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)]"
              >
                التالي
                <ArrowLeft className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== steps ============================== */

type Form = {
  title: string;
  subtitle: string;
  longDescription: string;
  category: string;
  price: string;
  originalPrice: string;
  targetAudience: string;
};

interface StepProps {
  form: Form;
  setForm: (next: Form) => void;
}

function BasicsStep({ form, setForm }: StepProps) {
  return (
    <section>
      <StepHeader
        title="الأساسيات"
        subtitle="ما اسم كورسك ولمن هو موجّه؟"
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="عنوان الكورس"
          required
          full
          hint="يفضل أن يكون مختصراً وواضحاً (60 حرف كحد أقصى)"
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
            placeholder="مثال: أساسيات الأشعة التشخيصية"
            className="input-base h-11 w-full text-[14px]"
          />
        </Field>
        <Field
          label="الفئة المستهدفة"
          full
          hint="من الذي يستفيد من هذا الكورس؟"
        >
          <input
            value={form.targetAudience}
            onChange={(e) =>
              setForm({ ...form, targetAudience: e.currentTarget.value })
            }
            placeholder="مثال: أطباء الامتياز وطلاب السنة النهائية"
            className="input-base h-11 w-full text-[14px]"
          />
        </Field>
        <Field label="عنوان فرعي" full hint="جملة قصيرة تظهر تحت العنوان">
          <input
            value={form.subtitle}
            onChange={(e) =>
              setForm({ ...form, subtitle: e.currentTarget.value })
            }
            placeholder="مثال: من قراءة الصورة إلى التشخيص في 12 ساعة"
            className="input-base h-11 w-full text-[14px]"
          />
        </Field>
      </div>
    </section>
  );
}

function MediaStep({ form, setForm }: StepProps) {
  return (
    <section>
      <StepHeader
        title="الصورة والوصف"
        subtitle="أعطِ الكورس وجهاً يميّزه ووصفاً يقنع الطالب بالاشتراك."
      />

      <div className="mb-6">
        <label className="mb-2 block text-[13px] font-semibold text-[var(--color-ink-700)]">
          صورة الكورس
        </label>
        <button
          type="button"
          className="flex w-full max-w-[420px] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] py-10 text-center transition-colors hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-50)]"
        >
          <ImagePlus className="size-7 text-[var(--color-ink-500)]" />
          <span className="text-[13.5px] font-semibold text-[var(--color-ink-800)]">
            اسحب الصورة هنا أو اضغط لاختيارها
          </span>
          <span className="text-[12px] text-[var(--color-ink-500)]">
            JPG أو PNG · 1280×720 على الأقل
          </span>
        </button>
      </div>

      <Field
        label="الوصف التفصيلي"
        required
        full
        hint="اشرح ماذا سيتعلم الطالب وماذا يحتاج قبل الاشتراك"
      >
        <textarea
          value={form.longDescription}
          onChange={(e) =>
            setForm({ ...form, longDescription: e.currentTarget.value })
          }
          rows={6}
          placeholder="هذا الكورس يغطي..."
          className="input-base w-full resize-y px-3.5 py-2.5 text-[14px] leading-relaxed"
        />
      </Field>
    </section>
  );
}

function PricingStep({ form, setForm }: StepProps) {
  return (
    <section>
      <StepHeader
        title="السعر والتصنيف"
        subtitle="حدد سعر الكورس وضعه في الفئة المناسبة."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="التصنيف" required>
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.currentTarget.value })
            }
            className="input-base h-11 w-full text-[14px]"
          >
            <option value="">اختر تصنيفاً</option>
            <option value="diagnostic">أشعة تشخيصية</option>
            <option value="mri">رنين مغناطيسي</option>
            <option value="ct">أشعة مقطعية</option>
            <option value="ultrasound">موجات فوق صوتية</option>
            <option value="pediatric">أشعة أطفال</option>
            <option value="msk">عظام ومفاصل</option>
          </select>
        </Field>
        <Field label="" optional>
          <span />
        </Field>

        <Field label="السعر (ج.م)" required hint="السعر النهائي بعد الخصم">
          <div className="relative">
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.currentTarget.value })
              }
              placeholder="999"
              className="input-base h-11 w-full ps-12 text-[14px] tabular-nums"
              min="0"
              step="1"
            />
            <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[var(--color-ink-400)]">
              ج.م
            </span>
          </div>
        </Field>
        <Field label="السعر الأصلي قبل الخصم" optional>
          <div className="relative">
            <input
              type="number"
              value={form.originalPrice}
              onChange={(e) =>
                setForm({ ...form, originalPrice: e.currentTarget.value })
              }
              placeholder="1499"
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
    </section>
  );
}

function ReviewStep({ form }: { form: Form }) {
  return (
    <section>
      <StepHeader
        title="مراجعة وحفظ"
        subtitle="راجع المعلومات. بعد التقديم سيتم إرسال الكورس إلى المشرفين للمراجعة."
      />

      <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-soft)] p-4 text-[13px] text-[var(--color-warning)]">
        <div className="mb-1 flex items-center gap-2 font-bold">
          <Tag className="size-4" />
          ما يحدث بعد التقديم
        </div>
        <p className="leading-relaxed">
          سيراجع فريق المشرفين كورسك خلال 48 ساعة في المتوسط. ستصلك إشعارات
          بالموافقة أو ملاحظات تحتاج معالجتها. خلال هذه الفترة لا يمكن للطلاب
          الاشتراك في الكورس.
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <ReviewRow label="عنوان الكورس" value={form.title} />
        <ReviewRow label="عنوان فرعي" value={form.subtitle} />
        <ReviewRow label="الفئة المستهدفة" value={form.targetAudience} />
        <ReviewRow label="التصنيف" value={form.category} />
        <ReviewRow
          label="السعر"
          value={form.price ? `${form.price} ج.م` : ''}
        />
        <ReviewRow
          label="السعر قبل الخصم"
          value={
            form.originalPrice ? `${form.originalPrice} ج.م` : '—'
          }
        />
        <div className="sm:col-span-2">
          <ReviewRow label="الوصف" value={form.longDescription} multi />
        </div>
      </dl>
    </section>
  );
}

/* ============================== shared ============================== */

function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-6">
      <h2 className="m-0 text-[18px] font-bold text-[var(--color-ink-900)]">
        {title}
      </h2>
      <p className="mt-1 text-[13.5px] text-[var(--color-ink-500)]">
        {subtitle}
      </p>
    </header>
  );
}

function Field({
  label,
  required,
  optional,
  hint,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-[var(--color-ink-700)]">
          {label}
          {required && (
            <span className="ms-1 text-[var(--color-danger)]">*</span>
          )}
          {optional && (
            <span className="mr-1.5 text-[11px] font-medium text-[var(--color-ink-400)]">
              (اختياري)
            </span>
          )}
        </span>
        {hint && (
          <span className="text-[11px] text-[var(--color-ink-400)]">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  multi,
}: {
  label: string;
  value: string;
  multi?: boolean;
}) {
  return (
    <div>
      <dt className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
        {label}
      </dt>
      <dd
        className={
          'text-[14px] text-[var(--color-ink-900)] ' +
          (multi ? 'whitespace-pre-wrap leading-relaxed' : '')
        }
      >
        {value || (
          <span className="text-[var(--color-ink-400)]">— لم يحدّد بعد</span>
        )}
      </dd>
    </div>
  );
}
