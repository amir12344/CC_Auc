'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from '@/src/features/authentication/store/authSlice';
import { selectAuthLoading } from '@/src/features/authentication/store/authSelectors';
import type { AppDispatch } from '@/src/lib/store';

/**
 * AuthInitializer component that automatically initializes authentication state
 * This is the SINGLE source of truth for auth initialization
 * All other components should rely on Redux state instead of making direct Amplify calls
 */
export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoading = useSelector(selectAuthLoading);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(initializeAuth()).unwrap();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setHasInitialized(true);
      }
    };

    // Initialize auth once on mount
    initAuth();
  }, [dispatch]);

  // Don't render anything until initial auth check is complete
  if (!hasInitialized) {
    return null;
  }

  return <>{children}</>;
}; 