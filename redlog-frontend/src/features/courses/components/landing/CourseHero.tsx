import { Star, Users, Clock, ChevronRight } from 'lucide-react';
import type { Course } from '@/features/courses/types';
import { formatHours, formatRating, formatStudents } from '@/features/courses/utils';
import { Avatar } from '@/shared/components/ui/Avatar';

interface CourseHeroProps {
  course: Course;
  onBack: () => void;
  /** The sticky preview card rendered in the hero's right column. */
  rightSlot: React.ReactNode;
}

export function CourseHero({ course, onBack, rightSlot }: CourseHeroProps) {
  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        background:
          'linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-brand-blue-700) 100%)',
        padding: '20px 32px 60px',
      }}
    >
      {/* Decorative atmospheric circles */}
      <div
        className="absolute -start-[100px] -top-[100px] size-[360px] rounded-full"
        style={{ background: 'rgba(255,255,255,.06)' }}
        aria-hidden
      />
      <div
        className="absolute -bottom-[120px] end-[100px] size-[280px] rounded-full"
        style={{ background: 'rgba(255,255,255,.04)' }}
        aria-hidden
      />

      <button
        type="button"
        onClick={onBack}
        className="relative mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 transition-opacity hover:opacity-100"
      >
        <ChevronRight className="size-4" aria-hidden />
        العودة للكورسات
      </button>

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_380px]">
        {/* LEFT — info */}
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="rounded-full px-3 py-1 text-[12px] font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,.18)' }}
            >
              {course.category.name}
            </span>
            {course.badge && (
              <span
                className="rounded-full px-3 py-1 text-[12px] font-bold"
                style={{ background: '#FCD34D', color: '#78350F' }}
              >
                {course.badge}
              </span>
            )}
          </div>

          <h1 className="m-0 mb-3.5 text-[38px] font-extrabold leading-[1.25] tracking-[-0.01em]">
            {course.title}
          </h1>

          <p className="mb-5 max-w-[640px] text-[17px] leading-[1.7] opacity-90">
            {course.description}
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-[#FCD34D] text-[#FCD34D]" />
              <span className="text-[16px] font-bold tabular-nums">
                {formatRating(course.rating)}
              </span>
              <span className="opacity-80">
                ({formatStudents(course.reviewsCount)} تقييم)
              </span>
            </div>
            <span className="opacity-40">•</span>
            <div className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              <span>{formatStudents(course.studentsCount)} طالب مسجل</span>
            </div>
            <span className="opacity-40">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              <span>{formatHours(course.durationMinutes)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar
              name={course.instructor.name}
              src={course.instructor.avatar}
              size={44}
            />
            <div>
              <div className="text-[13px] opacity-80">المحاضر</div>
              <div className="text-[15px] font-bold">{course.instructor.name}</div>
            </div>
          </div>
        </div>

        {/* RIGHT — preview card slot (sticky inside hero) */}
        <div className="relative">{rightSlot}</div>
      </div>
    </div>
  );
}
