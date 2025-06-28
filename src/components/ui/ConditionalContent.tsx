'use client';

import type { ReactNode } from 'react';
import { usePublicPageAuth } from '@/src/hooks/useAuthState';

interface ConditionalContentProps {
  children: ReactNode;
  showWhen: 'authenticated' | 'guest' | 'buyer' | 'seller';
  fallback?: ReactNode;
  className?: string;
}

/**
 * Component for conditional rendering based on authentication state
 * Safe for use on public pages - prevents hydration issues
 */
export function ConditionalContent({
  children,
  showWhen,
  fallback = null,
  className,
}: ConditionalContentProps) {
  const { isAuthenticated, userType } = usePublicPageAuth();

  const shouldShow = () => {
    switch (showWhen) {
      case 'authenticated':
        return isAuthenticated;
      case 'guest':
        return !isAuthenticated;
      case 'buyer':
        return isAuthenticated && userType === 'buyer';
      case 'seller':
        return isAuthenticated && userType === 'seller';
      default:
        return false;
    }
  };

  if (!shouldShow()) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Specific components for common use cases
 */
export function AuthenticatedOnly({
  children,
  fallback,
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <ConditionalContent
      className={className}
      fallback={fallback}
      showWhen="authenticated"
    >
      {children}
    </ConditionalContent>
  );
}

export function GuestOnly({
  children,
  fallback,
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <ConditionalContent
      className={className}
      fallback={fallback}
      showWhen="guest"
    >
      {children}
    </ConditionalContent>
  );
}

export function BuyerOnly({
  children,
  fallback,
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <ConditionalContent
      className={className}
      fallback={fallback}
      showWhen="buyer"
    >
      {children}
    </ConditionalContent>
  );
}

export function SellerOnly({
  children,
  fallback,
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <ConditionalContent
      className={className}
      fallback={fallback}
      showWhen="seller"
    >
      {children}
    </ConditionalContent>
  );
}
