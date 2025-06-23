'use client';

import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { RootState } from '@/src/lib/store';

/**
 * Lightweight hook for accessing auth state on public pages
 * Does not trigger authentication initialization
 * Perfect for conditional rendering based on login status
 */
export function useAuthState() {
  const pathname = usePathname();
  const authState = useSelector((state: RootState) => state.auth);

  // Determine if we're on a public page
  const isPublicPage = pathname === '/' || 
                      pathname.startsWith('/website') || 
                      pathname.startsWith('/earlyaccess');

  return {
    // Basic auth state
    isAuthenticated: authState.isAuthenticated,
    userType: authState.userType,
    isLoading: isPublicPage ? false : authState.isLoading, // No loading on public pages
    
    // User info (safe for public pages)
    user: authState.user,
    
    // Utility functions
    isBuyer: authState.userType === 'buyer',
    isSeller: authState.userType === 'seller',
    isGuest: !authState.isAuthenticated,
    
    // Public page indicator
    isPublicPage,
    
    // Safe display name for UI
    displayName: authState.user?.attributes?.['custom:fullName'] || 
                authState.user?.attributes?.email?.split('@')[0] || 
                'User'
  };
}

/**
 * Hook specifically for conditional rendering on public pages
 * Returns null states when on public pages to prevent hydration issues
 */
export function usePublicPageAuth() {
  const { isAuthenticated, userType, isPublicPage, displayName } = useAuthState();
  
  if (!isPublicPage) {
    // On non-public pages, return full auth state
    return { isAuthenticated, userType, displayName };
  }
  
  // On public pages, return safe defaults to prevent hydration mismatches
  return {
    isAuthenticated: typeof window !== 'undefined' ? isAuthenticated : false,
    userType: typeof window !== 'undefined' ? userType : null,
    displayName: typeof window !== 'undefined' ? displayName : 'User'
  };
} 