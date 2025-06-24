'use client';

import {
  ChevronDown,
  ChevronUp,
  Heart,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { CreateListingDialog } from '@/src/components/seller/CreateListingDialog';
import { Button } from '@/src/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/src/components/ui/collapsible';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet';
import {
  selectCanAccessBuyerRoutes,
  selectCanAccessSellerRoutes,
  selectIsAuthenticated,
  selectIsSeller,
} from '@/src/features/authentication/store/authSelectors';
import Logo from '@/src/features/website/components/ui/Logo';

// My Deals navigation items (same as desktop dropdown)
const myDealsItems = [
  {
    title: 'Overview',
    href: '/buyer/deals',
    icon: LayoutDashboard,
  },
  {
    title: 'All Deals',
    href: '/buyer/deals/all-deals',
    icon: Package,
  },
  {
    title: 'Offers',
    href: '/buyer/deals/offers',
    icon: Heart,
  },
  {
    title: 'Orders',
    href: '/buyer/deals/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Messages',
    href: '/buyer/deals/messages',
    icon: MessageSquare,
  },
];

// Main navigation items - function to filter based on user role
const getMainNavItems = (isAuthenticated: boolean, isSeller: boolean) => [
  { label: 'Home', href: '/' },
  // Show Dashboard for authenticated sellers
  ...(isAuthenticated && isSeller
    ? [{ label: 'Dashboard', href: '/seller/dashboard' }]
    : []),
  // Show Marketplace and Collections for non-sellers or guests
  ...(isSeller
    ? []
    : [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Collections', href: '/collections' },
    ]),
];

const MobileNavigation = () => {
  const pathname = usePathname();

  // State for collapsible sections
  const [isMyDealsOpen, setIsMyDealsOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redux selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const canAccessSellerRoutes = useSelector(selectCanAccessSellerRoutes);
  const isSeller = useSelector(selectIsSeller);

  // Get filtered main nav items based on user role
  const mainNavItems = getMainNavItems(isAuthenticated, isSeller);

  // Check if My Deals item is active
  const isMyDealsItemActive = (href: string) => {
    return (
      pathname === href ||
      (href !== '/buyer/deals' && pathname.startsWith(href))
    );
  };

  const handleCreateListingClick = () => {
    setIsSheetOpen(false);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Sheet onOpenChange={setIsSheetOpen} open={isSheetOpen}>
        <SheetTrigger asChild>
          <Button
            className="text-[#43CD66] hover:text-[#43CD66]/80 md:hidden"
            size="icon"
            variant="ghost"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex w-[320px] flex-col p-0 sm:max-w-[320px]"
          side="left"
        >
          {/* Header - Fixed */}
          <SheetHeader className="flex-shrink-0 border-b p-4">
            <div className="flex items-center justify-between">
              <Logo minWidth={100} size="small" />
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </div>
          </SheetHeader>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* 1. Main Navigation - Always visible */}
            <div className="border-b p-4">
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      className={`flex items-center rounded-lg px-3 py-2.5 font-medium text-base transition-colors ${pathname === item.href
                        ? 'bg-[#43CD66]/10 text-[#43CD66]'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>

            {/* 2. My Deals Section - Only for authenticated buyers */}
            {isAuthenticated && canAccessBuyerRoutes && (
              <div className="border-b p-4">
                <Collapsible
                  onOpenChange={setIsMyDealsOpen}
                  open={isMyDealsOpen}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="h-5 w-5 text-[#43CD66]" />
                      <span className="font-medium text-base text-gray-900">
                        My Deals
                      </span>
                    </div>
                    {isMyDealsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {myDealsItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isMyDealsItemActive(item.href);
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            className={`flex items-center rounded-md px-4 py-2 text-sm transition-colors ${isActive
                              ? 'bg-[#43CD66]/10 font-medium text-[#43CD66]'
                              : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            href={item.href}
                          >
                            <Icon className="mr-3 h-4 w-4" />
                            {item.title}
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* 3. Seller Dashboard - Only for authenticated sellers */}
            {isAuthenticated && canAccessSellerRoutes && (
              <div className="border-b p-4">
                <div className="space-y-3">
                  <SheetClose asChild>
                    <Link
                      className="flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                      href="/seller/dashboard"
                    >
                      <Store className="h-5 w-5 text-[#43CD66]" />
                      <span className="font-medium text-base text-gray-900">
                        Seller Dashboard
                      </span>
                    </Link>
                  </SheetClose>

                  <button
                    className="flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                    onClick={handleCreateListingClick}
                    type="button"
                  >
                    <Plus className="h-5 h-5 text-[#43CD66]" />
                    <span className="font-medium text-base text-gray-900">
                      Create Listing
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Auth Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t bg-white p-4">
            {!isAuthenticated && (
              <div className="space-y-3">
                <SheetClose asChild>
                  <Link className="w-full" href="/auth/login">
                    <Button
                      className="h-11 w-full bg-[#43CD66] font-medium text-[#102D21] hover:bg-[#43CD66]/90"
                      variant="default"
                    >
                      Sign In
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link className="w-full" href="/auth/select-user-type">
                    <Button
                      className="h-11 w-full border-[#43CD66] font-medium text-[#43CD66] hover:bg-[#43CD66]/10"
                      variant="outline"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <CreateListingDialog onOpenChange={setIsDialogOpen} open={isDialogOpen} />
    </>
  );
};

export default MobileNavigation;
