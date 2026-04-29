import { Star } from 'lucide-react';
import type { Course } from '@/features/courses/types';
import { formatRating, formatStudents } from '@/features/courses/utils';
import { Avatar } from '@/shared/components/ui/Avatar';

interface InstructorTabProps {
  course: Course;
}

export function InstructorTab({ course }: InstructorTabProps) {
  const { instructor } = course;
  const profile = instructor.instructorProfile;

  const subtitle = [profile?.specialty, profile?.university]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-white p-7">
      <div className="mb-5 flex items-start gap-5">
        <Avatar name={instructor.name} src={instructor.avatar} size={88} />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 mb-1 text-[22px] font-bold">{instructor.name}</h2>
          {subtitle && (
            <div className="mb-3 text-[14px] text-[var(--color-ink-600)]">
              {subtitle}
            </div>
          )}

          <div className="flex flex-wrap gap-6 text-[13px]">
            {profile && (
              <div>
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-bold tabular-nums">
                    {formatRating(profile.rating)}
                  </span>
                </div>
                <div className="text-[var(--color-ink-500)]">تقييم المحاضر</div>
              </div>
            )}
            {profile && (
              <div>
                <div className="font-bold tabular-nums">
                  {formatStudents(profile.studentsCount)}
                </div>
                <div className="text-[var(--color-ink-500)]">طالب</div>
              </div>
            )}
            {profile && (
              <div>
                <div className="font-bold tabular-nums">
                  {profile.coursesCount}
                </div>
                <div className="text-[var(--color-ink-500)]">كورسات</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {profile?.bio && (
        <div className="text-[15px] leading-[1.9] text-[var(--color-ink-700)]">
          {profile.bio.split(/\n\n+/).map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-3.5' : ''}>
              {p.trim()}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
