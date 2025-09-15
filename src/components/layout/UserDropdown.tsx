"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  CreditCard,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  User,
  UserCircle,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { authService } from "@/src/features/authentication/services/authService";
import {
  selectIsBuyer,
  selectIsSeller,
  selectUserDisplayName,
  selectUserInitials,
  selectUserProfile,
} from "@/src/features/authentication/store/authSelectors";
import { initializeAuth } from "@/src/features/authentication/store/authSlice";
import { AppDispatch } from "@/src/lib/store";

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
    } finally {
      // Always sync local state and redirect, even if Amplify isn't configured on this page
      await dispatch(initializeAuth())
        .unwrap()
        .catch(() => undefined);
      router.push("/auth/login");
    }
  }, [dispatch, router]);

  // Navigation handlers
  const handleNavigation = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  if (!userProfile) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 cursor-pointer rounded-full transition-colors hover:bg-[#43CD66]/10"
          size="sm"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-[#43CD66] text-sm font-medium text-[#102D21]">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="border-b bg-gray-50/50 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#43CD66] font-medium text-[#102D21]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col space-y-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {userDisplayName}
              </p>
              <p className="truncate text-xs text-gray-500">
                {userProfile.email}
              </p>
              <div className="mt-1 flex items-center">
                <span className="bg-primary-100 text-primary-700 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                  {isBuyer && (
                    <>
                      <ShoppingBag className="mr-1 h-3 w-3" />
                      Buyer
                    </>
                  )}
                  {isSeller && (
                    <>
                      <Store className="mr-1 h-3 w-3" />
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
            className="cursor-pointer p-3 transition-colors hover:bg-gray-50 focus:bg-gray-50"
            onClick={() => handleNavigation("/buyer/account")}
          >
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Account Settings</span>
          </DropdownMenuItem>
        )}

        {/* Preferences - Buyer specific */}
        {isBuyer && (
          <DropdownMenuItem
            className="cursor-pointer p-3 transition-colors hover:bg-gray-50 focus:bg-gray-50"
            onClick={() => handleNavigation("/buyer/account/preferences")}
          >
            <Settings className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Preferences</span>
          </DropdownMenuItem>
        )}

        {/* My Deals - Role specific */}
        {isBuyer && (
          <DropdownMenuItem
            className="cursor-pointer p-3 transition-colors hover:bg-gray-50 focus:bg-gray-50"
            onClick={() => handleNavigation("/buyer/deals")}
          >
            <ShoppingBag className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">My Deals</span>
          </DropdownMenuItem>
        )}

        {isSeller && (
          <DropdownMenuItem
            className="cursor-pointer p-3 transition-colors hover:bg-gray-50 focus:bg-gray-50"
            onClick={() => handleNavigation("/seller/dashboard")}
          >
            <Store className="mr-3 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Seller Dashboard</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1" />

        {/* Sign Out */}
        <DropdownMenuItem
          className="cursor-pointer p-3 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="text-sm font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
