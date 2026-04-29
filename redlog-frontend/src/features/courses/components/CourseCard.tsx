import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import type { Course } from '@/features/courses/types';
import { formatHours, formatRating, formatStudents } from '@/features/courses/utils';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(course.thumbnail) && !imgFailed;
  const shortLetters = course.title.slice(0, 2);

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white shadow-[var(--shadow-xs)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
    >
      {/* Thumbnail */}
      <div
        className="relative flex h-[140px] items-center justify-center text-white"
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-navy) 100%)',
        }}
      >
        {showImage && (
          <img
            src={course.thumbnail!}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {!showImage && (
          <span
            className="font-display font-bold opacity-95"
            style={{ fontSize: 32 }}
          >
            {shortLetters}
          </span>
        )}
        {course.badge && (
          <span className="absolute end-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[var(--color-brand-blue-700)]">
            {course.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-[18px]">
        <h3 className="m-0 mb-2 line-clamp-2 text-[16px] font-bold leading-[1.4] text-[var(--color-ink-900)]">
          {course.title}
        </h3>
        <div className="mb-3 text-[13px] text-[var(--color-ink-600)]">
          {course.instructor.name}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-[13px]">
            <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold tabular-nums">
              {formatRating(course.rating)}
            </span>
            <span className="text-[var(--color-ink-400)]">
              ({formatStudents(course.studentsCount)})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-ink-600)]">
            <Clock className="size-[13px]" aria-hidden />
            <span className="tabular-nums">{formatHours(course.durationMinutes)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
