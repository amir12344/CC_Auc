'use client';

// Link is used in the Button component
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  selectIsAuthenticated,
  selectUserType,
  selectCanAccessBuyerRoutes,
  selectCanAccessSellerRoutes,
  selectAuthLoading
} from '@/src/features/authentication/store/authSelectors';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { UserDropdown } from './UserDropdown';
import { MyDealsDropdown } from './MyDealsDropdown';
import { SellerListingsDropdown } from './SellerListingsDropdown';

/**
 * Client-side header component for user authentication status
 * Uses Redux for all authentication state and actions
 * Responsive design for both mobile and desktop
 */
export function HeaderClient() {
  const [isMounted, setIsMounted] = useState(false);

  // Redux selectors for auth state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const canAccessSellerRoutes = useSelector(selectCanAccessSellerRoutes);
  const isLoading = useSelector(selectAuthLoading);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading skeleton during SSR or initial auth check
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-24 bg-[#43CD66]/20" />
        <Skeleton className="h-8 w-8 rounded-full bg-[#43CD66]/20" />
      </div>
    );
  }

  // If we're mounted but not authenticated, show login/signup buttons
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          size="sm"
          className="bg-[#43CD66] text-[#102D21] hover:bg-[#43CD66]/90 font-medium"
          onClick={() => window.location.href = '/auth/login'}
        >
          Login
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex border-[#43CD66] text-[#43CD66] hover:bg-[#43CD66]/10 font-medium"
          onClick={() => window.location.href = '/auth/select-user-type'}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  // If we're authenticated, show the appropriate navigation based on user type
  return (
    <div className="flex items-center space-x-3">
      {/* Desktop View */}
      <div className="hidden md:flex items-center space-x-3">
        {/* My Deals Dropdown - Only for buyers */}
        {canAccessBuyerRoutes && <MyDealsDropdown />}

        {/* Seller Listings Dropdown - Only for sellers */}
        {canAccessSellerRoutes && <SellerListingsDropdown />}

        {/* User Dropdown - works for both buyers and sellers */}
        <UserDropdown />
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex items-center space-x-2">
        {/* User Dropdown for mobile - works for both buyers and sellers */}
        <UserDropdown />
      </div>
    </div>
  );
}

