import { Avatar } from '@/shared/components/ui/Avatar';
import { INSTRUCTOR_PROFILE } from '@/features/instructor/mock-data';

export function InstructorSettingsPage() {
  return (
    <div className="mx-auto max-w-[960px] px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8">
        <h1 className="text-[26px] font-bold tracking-[-0.01em] text-[var(--color-ink-900)]">
          إعدادات المحاضر
        </h1>
        <p className="mt-1 text-[15px] text-[var(--color-ink-500)]">
          إدارة بياناتك العامة، طريقة الدفع، وتفضيلات الإشعارات.
        </p>
      </header>

      {/* === Profile ====================================================== */}
      <Section
        title="الملف الشخصي"
        subtitle="هذه البيانات تظهر للطلاب على صفحات كورساتك."
      >
        <div className="mb-6 flex items-center gap-4">
          <Avatar
            name={INSTRUCTOR_PROFILE.name}
            src={INSTRUCTOR_PROFILE.avatar}
            size={72}
          />
          <div>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-[8px] border border-[var(--color-line-strong)] bg-white px-3.5 text-[12.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)]"
            >
              تغيير الصورة
            </button>
            <p className="mt-1.5 text-[11.5px] text-[var(--color-ink-500)]">
              JPG أو PNG · 200×200 على الأقل
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="الاسم">
            <input
              defaultValue={INSTRUCTOR_PROFILE.name}
              className="input-base h-11 w-full text-[14px]"
            />
          </Field>
          <Field label="البريد الإلكتروني">
            <input
              type="email"
              defaultValue={INSTRUCTOR_PROFILE.email}
              className="input-base h-11 w-full text-[14px]"
              dir="ltr"
            />
          </Field>
          <Field label="التخصص">
            <input
              defaultValue={INSTRUCTOR_PROFILE.specialty}
              className="input-base h-11 w-full text-[14px]"
            />
          </Field>
          <Field label="الجامعة / المستشفى">
            <input
              defaultValue={INSTRUCTOR_PROFILE.university}
              className="input-base h-11 w-full text-[14px]"
            />
          </Field>
          <Field label="نبذة قصيرة" full>
            <textarea
              defaultValue={INSTRUCTOR_PROFILE.bio}
              rows={4}
              className="input-base w-full resize-y px-3.5 py-2.5 text-[14px] leading-relaxed"
            />
          </Field>
        </div>
      </Section>

      {/* === Payouts ====================================================== */}
      <Section
        title="بيانات التحويل البنكي"
        subtitle="نحوّل أرباحك في الخامس من كل شهر إلى الحساب التالي."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="اسم البنك">
            <input
              defaultValue="CIB · البنك التجاري الدولي"
              className="input-base h-11 w-full text-[14px]"
            />
          </Field>
          <Field label="اسم صاحب الحساب">
            <input
              defaultValue={INSTRUCTOR_PROFILE.name}
              className="input-base h-11 w-full text-[14px]"
            />
          </Field>
          <Field label="رقم الحساب / IBAN" full>
            <input
              placeholder="EG••••"
              dir="ltr"
              className="input-base h-11 w-full text-[14px] tabular-nums"
            />
          </Field>
        </div>
      </Section>

      {/* === Notifications ================================================ */}
      <Section
        title="الإشعارات"
        subtitle="اختر متى ترغب في تلقي إشعارات بريدية."
      >
        <ul className="flex flex-col divide-y divide-[var(--color-line)] rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white">
          <ToggleRow
            title="عند اشتراك طالب جديد"
            subtitle="تلقي بريد فوري لكل طالب جديد في كورساتك."
            defaultChecked
          />
          <ToggleRow
            title="عند ورود سؤال جديد"
            subtitle="إشعارات عن أسئلة الطلاب في صفحات الدروس."
            defaultChecked
          />
          <ToggleRow
            title="ملخص أسبوعي"
            subtitle="ملخص بكل النشاط على كورساتك مرة كل أسبوع."
            defaultChecked={false}
          />
          <ToggleRow
            title="عند تغير حالة المراجعة"
            subtitle="إشعار عند موافقة أو رفض أحد كورساتك."
            defaultChecked
          />
        </ul>
      </Section>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          className="inline-flex h-10 items-center rounded-[10px] border border-[var(--color-line-strong)] bg-white px-4 text-[13.5px] font-semibold text-[var(--color-ink-800)] hover:bg-[var(--color-surface-muted)]"
        >
          إلغاء
        </button>
        <button
          type="button"
          className="btn-base inline-flex h-10 items-center rounded-[10px] bg-[var(--color-brand-navy)] px-4 text-[13.5px] font-semibold text-white hover:bg-[var(--color-brand-navy-700)]"
        >
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-xs)]">
      <header className="mb-5">
        <h2 className="m-0 text-[16px] font-bold text-[var(--color-ink-900)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-[var(--color-ink-500)]">
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-700)]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  subtitle,
  defaultChecked,
}: {
  title: string;
  subtitle: string;
  defaultChecked: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold text-[var(--color-ink-900)]">
          {title}
        </div>
        <div className="mt-0.5 text-[12.5px] text-[var(--color-ink-500)]">
          {subtitle}
        </div>
      </div>
      <label className="relative inline-block h-[22px] w-[40px] shrink-0 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <span className="absolute inset-0 rounded-full bg-[var(--color-line-strong)] transition-colors peer-checked:bg-[var(--color-brand-blue)]" />
        <span className="absolute top-[3px] end-[20px] size-[16px] rounded-full bg-white shadow-sm transition-[inset-inline-end] peer-checked:end-[3px]" />
      </label>
    </li>
  );
}
