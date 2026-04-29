import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { HttpError } from '@/shared/api/client';

const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      {children}
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  );
}
