'use client';

import { AuthProvider } from '@/src/contexts/AuthContext';
import ConfigureAmplifyClientSide from '../ConfigureAmplifyClientSide';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ConfigureAmplifyClientSide />
      <AuthProvider>
        <div className="min-h-screen bg-white">
          <main>
            {children}
          </main>
        </div>
      </AuthProvider>
    </>
  );
}

