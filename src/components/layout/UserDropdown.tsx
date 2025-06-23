'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { memo, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Button } from '@/src/components/ui/button';
import {
  selectUserProfile,
  selectUserDisplayName,
  selectUserInitials,
  selectIsBuyer,
  selectIsSeller
} from '@/src/features/authentication/store/authSelectors';
import { AppDispatch } from '@/src/lib/store';
import {
  User,
  Settings,
  CreditCard,
  Users,
  LogOut,
  UserCircle,
  ShoppingBag,
  Store
} from 'lucide-react';
import { authService } from '@/src/features/authentication/services/authService';
import { initializeAuth } from '@/src/features/authentication/store/authSlice';

/**
 * User dropdown menu component that appears when clicking on user avatar
 * Provides access to profile, settings, and account management
 */
export const UserDropdown = memo(function UserDropdown() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux selectors
  const userProfile = useSelector(selectUserProfile);
  const userDisplayName = useSelector(selectUserDisplayName);
  const userInitials = useSelector(selectUserInitials);
  const isBuyer = useSelector(selectIsBuyer);
  const isSeller = useSelector(selectIsSeller);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await authService.signOut();
      // Manually dispatch initializeAuth to update the state to signed-out
      await dispatch(initializeAuth()).unwrap();
      // Redirect to marketplace after successful logout
      router.push('/marketplace');
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Fallback: force reload to clear state and redirect
      window.location.href = '/marketplace';
    }
  }, [dispatch, router]);

  // Navigation handlers
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  if (!userProfile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-[#43CD66]/10 transition-colors cursor-pointer"
          size="sm"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-[#43CD66] text-[#102D21] font-medium text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="p-4 border-b bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#43CD66] text-[#102D21] font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userDisplayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.email}
              </p>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                  {isBuyer && (
                    <>
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Buyer
                    </>
                  )}
                  {isSeller && (
                    <>
                      <Store className="w-3 h-3 mr-1" />
                      Seller
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        {isBuyer && (
          <DropdownMenuItem
            className="cursor-pointer p-3 hover:bg-gray-50 transition-colors focus:bg-gray-50"
            onClick={() => handleNavigation('/buyer/account')}
          >
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Account Settings</span>
          </DropdownMenuItem>
        )}

        {/* Preferences - Buyer specific */}
        {isBuyer && (
          <DropdownMenuItem
            className="cursor-pointer p-3 hover:bg-gray-50 transition-colors focus:bg-gray-50"
            onClick={() => handleNavigation('/buyer/account/preferences')}
          >
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Preferences</span>
          </DropdownMenuItem>
        )}

        {/* My Deals - Role specific */}
        {isBuyer && (
          <DropdownMenuItem
            className="cursor-pointer p-3 hover:bg-gray-50 transition-colors focus:bg-gray-50"
            onClick={() => handleNavigation('/buyer/deals')}
          >
            <ShoppingBag className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">My Deals</span>
          </DropdownMenuItem>
        )}

        {isSeller && (
          <DropdownMenuItem
            className="cursor-pointer p-3 hover:bg-gray-50 transition-colors focus:bg-gray-50"
            onClick={() => handleNavigation('/seller/dashboard')}
          >
            <Store className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Seller Dashboard</span>
          </DropdownMenuItem>
        )}


        <DropdownMenuSeparator className="my-1" />

        {/* Sign Out */}
        <DropdownMenuItem
          className="cursor-pointer p-3 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors focus:bg-red-50 focus:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}); 