'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/src/lib/store';
import { AuthProvider } from '@/src/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReduxProvider>
  );
} 