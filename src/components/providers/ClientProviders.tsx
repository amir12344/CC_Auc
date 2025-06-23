'use client';

import { Provider } from 'react-redux';
import { store } from '@/src/lib/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from '@/src/components/ui/toaster';
import { AuthProvider } from './AuthProvider';

/**
 * Client-side providers wrapper component
 * This component wraps all client-side providers (Redux, React Query, Auth, Toast)
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance with optimized settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
