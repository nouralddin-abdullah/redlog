import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useCourse,
  useCourseAccess,
  useCurriculum,
} from '@/features/courses/hooks';
import { useLesson } from '@/features/lessons/hooks';
import { CourseHero } from '@/features/courses/components/landing/CourseHero';
import { CoursePreviewCard } from '@/features/courses/components/landing/CoursePreviewCard';
import {
  CourseTabs,
  type LandingTabKey,
} from '@/features/courses/components/landing/CourseTabs';
import { OverviewTab } from '@/features/courses/components/landing/OverviewTab';
import { CurriculumTab } from '@/features/courses/components/landing/CurriculumTab';
import { InstructorTab } from '@/features/courses/components/landing/InstructorTab';
import { ReviewsTab } from '@/features/courses/components/landing/ReviewsTab';
import { PaymentDialog } from '@/features/courses/components/landing/PaymentDialog';
import { PaymentRequestDetailsDialog } from '@/features/courses/components/landing/PaymentRequestDetailsDialog';
import { PreviewVideoDialog } from '@/features/courses/components/landing/PreviewVideoDialog';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { Logo } from '@/shared/components/branding/Logo';
import { HttpError } from '@/shared/api/client';

export function CourseLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const courseQuery = useCourse(slug);
  const curriculumQuery = useCurriculum(slug);
  const accessQuery = useCourseAccess(slug);
  const [tab, setTab] = useState<LandingTabKey>('overview');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  /** First video lesson flagged as a public preview. */
  const previewLesson = useMemo(
    () =>
      curriculumQuery.data
        ?.flatMap((m) => m.lessons)
        .find((l) => l.isPreview && l.type === 'video') ?? null,
    [curriculumQuery.data],
  );

  /** Fetch the preview lesson's detail so we can use its Bunny thumbnail
   *  on the card hero and as the dialog's loading poster. */
  const previewLessonDetail = useLesson(previewLesson?.id);
  const previewThumbnailUrl = previewLessonDetail.data?.thumbnailUrl ?? null;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/courses', { replace: true });
  };

  if (courseQuery.isLoading) {
    return <LoadingState />;
  }

  if (courseQuery.error || !courseQuery.data) {
    return (
      <ErrorState
        message={
          courseQuery.error instanceof HttpError
            ? courseQuery.error.message
            : 'تعذّر تحميل الكورس.'
        }
        onBack={goBack}
      />
    );
  }

  const course = courseQuery.data;
  const modules = curriculumQuery.data;

  const handleEnroll = () => {
    setPaymentOpen(true);
  };

  const handleStartLearning = () => {
    navigate(`/courses/${course.slug}/learn`);
  };

  const handlePreview = () => {
    if (!previewLesson) {
      toast.message('لا توجد معاينة متاحة لهذا الكورس.');
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <CourseHero
        course={course}
        onBack={goBack}
        rightSlot={
          <CoursePreviewCard
            course={course}
            modules={modules}
            curriculumLoading={curriculumQuery.isLoading}
            access={accessQuery.data}
            accessLoading={accessQuery.isLoading}
            previewThumbnailUrl={previewThumbnailUrl}
            onEnroll={handleEnroll}
            onStartLearning={handleStartLearning}
            onShowRequestDetails={() => setRequestDetailsOpen(true)}
            onPreview={handlePreview}
          />
        }
      />

      <CourseTabs value={tab} onChange={setTab} />

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 p-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {tab === 'overview' && <OverviewTab course={course} />}
          {tab === 'curriculum' && (
            <CurriculumTab
              course={course}
              modules={modules}
              loading={curriculumQuery.isLoading}
            />
          )}
          {tab === 'instructor' && <InstructorTab course={course} />}
          {tab === 'reviews' && <ReviewsTab course={course} />}
        </div>
        <div className="hidden lg:block" />
      </div>

      <PaymentDialog
        open={paymentOpen}
        course={course}
        onClose={() => setPaymentOpen(false)}
      />
      <PaymentRequestDetailsDialog
        open={requestDetailsOpen}
        request={accessQuery.data?.paymentRequest ?? null}
        onClose={() => setRequestDetailsOpen(false)}
      />
      <PreviewVideoDialog
        open={previewOpen}
        lesson={previewLesson}
        posterUrl={previewThumbnailUrl}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-white">
      <div
        className="h-[420px] animate-pulse"
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand-navy) 0%, var(--color-brand-blue-700) 100%)',
        }}
      />
    </div>
  );
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--color-line)] bg-white px-8 py-5">
        <Logo size={28} />
      </header>
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-6 text-center">
        <Alert tone="danger" className="mb-6 w-full">
          {message}
        </Alert>
        <Button variant="ghost" onClick={onBack}>
          العودة للكورسات
        </Button>
      </div>
    </div>
  );
}
