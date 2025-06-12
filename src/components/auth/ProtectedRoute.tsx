'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectUserType,
  selectCanAccessBuyerRoutes,
  selectCanAccessSellerRoutes 
} from '@/src/features/authentication/store/authSelectors';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Allowed user types for this route */
  allowedUserTypes?: ('buyer' | 'seller')[];
  /** Redirect path for unauthorized users */
  redirectTo?: string;
  /** Show loading component while checking auth */
  showLoading?: boolean;
}

/**
 * Client-side authentication wrapper component
 * Can be used to protect any content including layouts
 * Prevents hydration mismatch by only rendering after mount
 */
export function ProtectedRoute({ 
  children, 
  allowedUserTypes = ['buyer', 'seller'],
  redirectTo = '/auth/login',
  showLoading = true
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Redux selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const userType = useSelector(selectUserType);
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const canAccessSellerRoutes = useSelector(selectCanAccessSellerRoutes);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine if user has access to current route
  const hasAccess = (() => {
    if (!isAuthenticated) return false;
    
    // If no specific user types required, any authenticated user can access
    if (allowedUserTypes.length === 0) return true;
    
    // Check specific role-based access
    if (allowedUserTypes.includes('buyer') && canAccessBuyerRoutes) return true;
    if (allowedUserTypes.includes('seller') && canAccessSellerRoutes) return true;
    
    return false;
  })();

  // Handle authentication and authorization
  useEffect(() => {
    // Only run after component is mounted
    if (!isMounted) return;
    
    // Skip checks while auth is loading
    if (isLoading) return;

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      // Preserve current URL for return after login
      const returnUrl = encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
      const loginUrl = `${redirectTo}?returnUrl=${returnUrl}`;
      
      console.log('🔒 User not authenticated, redirecting to login');
      router.replace(loginUrl);
      return;
    }

    // If user is authenticated but doesn't have access to this route
    if (isAuthenticated && !hasAccess) {
      console.log('🚫 User authenticated but lacks access to this route');
      
      // Redirect to appropriate dashboard based on user type
      if (userType === 'buyer') {
        router.replace('/buyer/deals');
      } else if (userType === 'seller') {
        router.replace('/seller/dashboard');
      } else {
        // Fallback to marketplace for unknown user types
        router.replace('/marketplace');
      }
      return;
    }
  }, [isMounted, isLoading, isAuthenticated, hasAccess, userType, pathname, searchParams, router, redirectTo]);

  // Don't render anything on the server or before mounting
  if (!isMounted) {
    return null;
  }

  // Show loading state while auth is loading
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-sm text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if user doesn't have access (will redirect in useEffect)
  if (!hasAccess) {
    return null;
  }

  // Render the protected content
  return <>{children}</>;
}

/**
 * Specialized components for common use cases
 */

// Buyer-only protection
export function BuyerProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedUserTypes={['buyer']}>
      {children}
    </ProtectedRoute>
  );
}

// Seller-only protection
export function SellerProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedUserTypes={['seller']}>
      {children}
    </ProtectedRoute>
  );
}

// Any authenticated user protection
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedUserTypes={['buyer', 'seller']}>
      {children}
    </ProtectedRoute>
  );
} 