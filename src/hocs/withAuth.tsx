'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectUnauthenticated?: string; redirectAuthenticated?: string } = {}
) {
  const WithAuth = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
    const { redirectUnauthenticated, redirectAuthenticated } = options;

    useEffect(() => {
      // Redirect unauthenticated users
      if (!isAuthenticated && redirectUnauthenticated) {
        router.push(`${redirectUnauthenticated}`);
        return;
      }

      // Redirect authenticated users (e.g., from login page)
      if (isAuthenticated && redirectAuthenticated) {
        if (userType === 'seller') {
          router.push('/seller');
        } else {
          // Default to buyer
          router.push('/marketplace');
        }
        return;
      }
    }, [isAuthenticated, userType, router, redirectUnauthenticated, redirectAuthenticated]);

    // If we're checking for authentication and user is not authenticated, 
    // we can show a loading state or return null
    if (redirectUnauthenticated && !isAuthenticated) {
      return null; // Or a loading spinner
    }

    // If we're checking for authentication and user is authenticated, 
    // we can show a loading state or return null
    if (redirectAuthenticated && isAuthenticated) {
      return null; // Or a loading spinner
    }

    return <Component {...props} />;
  };

  return WithAuth;
}

