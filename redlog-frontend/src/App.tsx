import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { router } from '@/app/router';

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-left"
        dir="rtl"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </QueryProvider>
  );
}
