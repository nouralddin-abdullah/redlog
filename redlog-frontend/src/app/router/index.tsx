import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicOnlyRoute } from './PublicOnlyRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { InstructorRoute } from './InstructorRoute';
import { RoleHomeRedirect } from './RoleHomeRedirect';
import { AppShell } from '@/app/layouts/AppShell';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { BrowseCoursesPage } from '@/features/courses/pages/BrowseCoursesPage';
import { CourseLandingPage } from '@/features/courses/pages/CourseLandingPage';
import { CoursePlayerPage } from '@/features/courses/pages/CoursePlayerPage';
import { MyCoursesPage } from '@/features/enrollments/pages/MyCoursesPage';
import { MyCertificatesPage } from '@/features/certificates/pages/MyCertificatesPage';
import { CertificatePage } from '@/features/certificates/pages/CertificatePage';
import { VerifyCertificatePage } from '@/features/certificates/pages/VerifyCertificatePage';
import { InstructorShell } from '@/features/instructor/layouts/InstructorShell';
import { InstructorDashboardPage } from '@/features/instructor/pages/InstructorDashboardPage';
import { InstructorCoursesPage } from '@/features/instructor/pages/InstructorCoursesPage';
import { NewCourseWizardPage } from '@/features/instructor/pages/NewCourseWizardPage';
import { CourseEditorPage } from '@/features/instructor/pages/CourseEditorPage';
import { NewLessonPage } from '@/features/instructor/pages/NewLessonPage';
import { InstructorStudentsPage } from '@/features/instructor/pages/InstructorStudentsPage';
import { InstructorEarningsPage } from '@/features/instructor/pages/InstructorEarningsPage';
import { InstructorSettingsPage } from '@/features/instructor/pages/InstructorSettingsPage';
import { ComingSoonPage } from '@/shared/components/ComingSoonPage';

export const router = createBrowserRouter([
  // Public certificate verification — usable without auth. An employer or
  // school checking a candidate's printed cert lands here directly. Sits
  // outside both Public-only and Protected guards so authed users hit the
  // same page (they may be verifying someone else's).
  { path: '/verify', element: <VerifyCertificatePage /> },
  { path: '/verify/:code', element: <VerifyCertificatePage /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/auth/signin', element: <SignInPage /> },
      { path: '/auth/signup', element: <SignUpPage /> },
      { path: '/auth/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Full-screen experience — no sidebar/topbar, matching the reference.
      { path: '/courses/:slug', element: <CourseLandingPage /> },
      { path: '/courses/:slug/learn', element: <CoursePlayerPage /> },
      // Single-certificate render is full-screen so window.print() captures
      // a clean canvas (no app shell on the page).
      { path: '/certificates/:id', element: <CertificatePage /> },

      // Instructor area — gated to role=instructor|admin. Learners typing
      // /instructor in the URL bar are bounced to /courses by InstructorRoute.
      {
        element: <InstructorRoute />,
        children: [
          {
            path: '/instructor',
            element: <InstructorShell />,
            children: [
              { index: true, element: <Navigate to="/instructor/dashboard" replace /> },
              { path: 'dashboard', element: <InstructorDashboardPage /> },
              { path: 'courses', element: <InstructorCoursesPage /> },
              { path: 'courses/new', element: <NewCourseWizardPage /> },
              { path: 'courses/:slug', element: <CourseEditorPage /> },
              { path: 'courses/:slug/lessons/new', element: <NewLessonPage /> },
              // Edit existing lesson — same form as create, detected via
              // the `:lessonId` route param. Page-level mode-detection keeps
              // both code paths in one component.
              {
                path: 'courses/:slug/lessons/:lessonId/edit',
                element: <NewLessonPage />,
              },
              { path: 'students', element: <InstructorStudentsPage /> },
              { path: 'earnings', element: <InstructorEarningsPage /> },
              { path: 'settings', element: <InstructorSettingsPage /> },
            ],
          },
        ],
      },

      // Everything else lives inside the app shell.
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <RoleHomeRedirect /> },
          {
            path: '/dashboard',
            element: (
              <ComingSoonPage
                title="لوحة التحكم"
                description="ملخص تقدمك، النشاط الأخير، والكورسات الموصى بها — قريباً."
              />
            ),
          },
          { path: '/courses', element: <BrowseCoursesPage /> },
          { path: '/my-courses', element: <MyCoursesPage /> },
          { path: '/certificates', element: <MyCertificatesPage /> },
          {
            path: '/community',
            element: (
              <ComingSoonPage
                title="مجتمع الكورسات"
                description="مساحة لطرح أسئلتك ومناقشة المحاضرات مع زملائك والمحاضرين."
              />
            ),
          },
          {
            path: '/settings',
            element: (
              <ComingSoonPage
                title="الإعدادات"
                description="الملف الشخصي، إعدادات الحساب والأجهزة المسجلة."
              />
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
