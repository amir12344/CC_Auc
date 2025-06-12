'use client';

/**
 * @deprecated This HOC approach is deprecated. Use ProtectedRoute component instead.
 * @see src/components/auth/ProtectedRoute.tsx
 * 
 * This file is kept for backward compatibility but should not be used for new implementations.
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectUserType,
  selectCanAccessBuyerRoutes,
  selectCanAccessSellerRoutes 
} from '@/src/features/authentication/store/authSelectors';
import { Skeleton } from '@/src/components/ui/skeleton';

interface WithAuthOptions {
  /** Allowed user types for this route */
  allowedUserTypes?: ('buyer' | 'seller')[];
  /** Redirect path for unauthorized users */
  redirectTo?: string;
  /** Show loading component instead of redirecting immediately */
  showLoadingState?: boolean;
  /** Custom fallback component */
  fallbackComponent?: React.ComponentType;
}

/**
 * Higher-Order Component for route protection
 * Uses Redux for authentication state management
 * Automatically redirects users when they become unauthenticated
 */
function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    allowedUserTypes = ['buyer', 'seller'],
    redirectTo = '/auth/login',
    showLoadingState = true,
    fallbackComponent: FallbackComponent
  } = options;

  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Redux selectors
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectAuthLoading);
    const userType = useSelector(selectUserType);
    const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
    const canAccessSellerRoutes = useSelector(selectCanAccessSellerRoutes);

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
    }, [isLoading, isAuthenticated, hasAccess, userType, pathname, searchParams, router]);

    // Show loading state while auth is loading
    if (isLoading) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      if (showLoadingState) {
        return (
          <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-600">Authenticating...</p>
            </div>
          </div>
        );
      }
      
      return null;
    }

    // Don't render if user is not authenticated (will redirect in useEffect)
    if (!isAuthenticated) {
      return null;
    }

    // Don't render if user doesn't have access (will redirect in useEffect)
    if (!hasAccess) {
      return null;
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  return AuthenticatedComponent;
}

/**
 * Specialized HOCs for common use cases
 */

// Buyer-only routes
export const withBuyerAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, {
    allowedUserTypes: ['buyer'],
    redirectTo: '/auth/login'
  });

// Seller-only routes
export const withSellerAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, {
    allowedUserTypes: ['seller'],
    redirectTo: '/auth/login'
  });

// Any authenticated user
export const withAnyAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, {
    allowedUserTypes: ['buyer', 'seller'],
    redirectTo: '/auth/login'
  });

// Public routes that should redirect authenticated users to their dashboard
export const withPublicRoute = <P extends object>(
  Component: React.ComponentType<P>,
  redirectToDashboard = true
) => {
  const PublicComponent = (props: P) => {
    const router = useRouter();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectAuthLoading);
    const userType = useSelector(selectUserType);

    useEffect(() => {
      if (!isLoading && isAuthenticated && redirectToDashboard) {
        // Redirect authenticated users to their appropriate dashboard
        if (userType === 'buyer') {
          router.replace('/buyer/deals');
        } else if (userType === 'seller') {
          router.replace('/seller/dashboard');
        } else {
          // Fallback to marketplace for unknown user types
          router.replace('/marketplace');
        }
      }
    }, [isLoading, isAuthenticated, userType, router]);

    // Show component for unauthenticated users or if redirectToDashboard is false
    if (!isAuthenticated || !redirectToDashboard) {
      return <Component {...props} />;
    }

    // Don't render anything while redirecting authenticated users
    return null;
  };

  PublicComponent.displayName = `withPublicRoute(${Component.displayName || Component.name})`;
  return PublicComponent;
};

export default withAuth;

