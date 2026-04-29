import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicOnlyRoute } from './PublicOnlyRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/app/layouts/AppShell';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { BrowseCoursesPage } from '@/features/courses/pages/BrowseCoursesPage';
import { CourseLandingPage } from '@/features/courses/pages/CourseLandingPage';
import { ComingSoonPage } from '@/shared/components/ComingSoonPage';

export const router = createBrowserRouter([
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

      // Everything else lives inside the app shell.
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/courses" replace /> },
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
          {
            path: '/my-courses',
            element: (
              <ComingSoonPage
                title="كورساتي"
                description="ستظهر هنا الكورسات التي اشتركت بها مع تقدمك في كل منها."
              />
            ),
          },
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
