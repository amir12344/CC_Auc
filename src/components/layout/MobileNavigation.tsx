'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectUserType, 
  selectCanAccessBuyerRoutes,
  selectCanAccessSellerRoutes,
  selectIsSeller
} from '@/src/features/authentication/store/authSelectors';
import { signOutUser } from '@/src/features/authentication/store/authSlice';
import type { AppDispatch } from '@/src/lib/store';
import Logo from '@/src/features/website/components/ui/Logo';
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  ShoppingCart, 
  MessageSquare,
  Store,
  ShoppingBag
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/src/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/src/components/ui/collapsible';

// My Deals navigation items (same as desktop dropdown)
const myDealsItems = [
  {
    title: "Overview",
    href: "/buyer/deals",
    icon: LayoutDashboard,
  },
  {
    title: "All Deals",
    href: "/buyer/deals/all-deals",
    icon: Package,
  },
  {
    title: "Offers",
    href: "/buyer/deals/offers", 
    icon: Heart,
  },
  {
    title: "Orders",
    href: "/buyer/deals/orders",
    icon: ShoppingCart,
  },
  {
    title: "Messages",
    href: "/buyer/deals/messages",
    icon: MessageSquare,
  },
];

// Seller Listings navigation items
const sellerListingsItems = [
  {
    title: "All Listings",
    href: "/seller/listing",
    icon: Package,
  },
  {
    title: "Active Listings",
    href: "/seller/listing?status=active",
    icon: LayoutDashboard,
  },
  {
    title: "Draft Listings",
    href: "/seller/listing?status=draft",
    icon: MessageSquare,
  },
  {
    title: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
];

// Main navigation items - function to filter based on user role
const getMainNavItems = (isAuthenticated: boolean, isSeller: boolean) => [
  { label: 'Home', href: '/' },
  // Show Dashboard for authenticated sellers
  ...(isAuthenticated && isSeller ? [{ label: 'Dashboard', href: '/seller/dashboard' }] : []),
  // Show Marketplace for non-sellers
  ...(!(isAuthenticated && isSeller) ? [{ label: 'Marketplace', href: '/marketplace' }] : []),
  { label: 'Collections', href: '/collections' },
];

const MobileNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for collapsible sections
  const [isMyDealsOpen, setIsMyDealsOpen] = useState(true); // Expanded by default
  const [isSellerListingsOpen, setIsSellerListingsOpen] = useState(true); // Expanded by default

  // Redux selectors
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const canAccessSellerRoutes = useSelector(selectCanAccessSellerRoutes);
  const isSeller = useSelector(selectIsSeller);

  // Get filtered main nav items based on user role
  const mainNavItems = getMainNavItems(isAuthenticated, isSeller);

  

  // Check if My Deals item is active
  const isMyDealsItemActive = (href: string) => {
    return pathname === href || (href !== "/buyer/deals" && pathname.startsWith(href));
  };

  // Check if Seller Listings item is active
  const isSellerListingsItemActive = (href: string) => {
    const cleanHref = href.split('?')[0];
    return pathname === cleanHref || (cleanHref !== "/seller/listing" && pathname.startsWith(cleanHref));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-[#43CD66] hover:text-[#43CD66]/80">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[320px] sm:max-w-[320px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <Logo size="small" minWidth={100} />
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {/* 1. Main Navigation - First */}
            <div className="p-4 border-b">
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        pathname === item.href
                          ? 'bg-[#43CD66]/10 text-[#43CD66]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>

            {/* 2. My Deals Section - Second (Only for authenticated buyers) */}
            {isAuthenticated && canAccessBuyerRoutes && (
              <div className="p-4 border-b">
                <Collapsible open={isMyDealsOpen} onOpenChange={setIsMyDealsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="h-5 w-5 text-[#43CD66]" />
                      <span className="text-base font-medium text-gray-900">My Deals</span>
                    </div>
                    {isMyDealsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {myDealsItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isMyDealsItemActive(item.href);
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive
                                ? 'bg-[#43CD66]/10 text-[#43CD66] font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
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

            {/* Seller Listings Section - Only for authenticated sellers */}
            {isAuthenticated && canAccessSellerRoutes && (
              <div className="p-4 border-b">
                <Collapsible open={isSellerListingsOpen} onOpenChange={setIsSellerListingsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-[#43CD66]" />
                      <span className="text-base font-medium text-gray-900">Listings</span>
                    </div>
                    {isSellerListingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {sellerListingsItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isSellerListingsItemActive(item.href);
                      return (
                        <SheetClose asChild key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive
                                ? 'bg-[#43CD66]/10 text-[#43CD66] font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
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

            {/* Seller Dashboard - Only for authenticated sellers */}
            {isAuthenticated && canAccessSellerRoutes && (
              <div className="p-4 border-b">
                <SheetClose asChild>
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Store className="h-5 w-5 text-[#43CD66]" />
                    <span className="text-base font-medium text-gray-900">Seller Dashboard</span>
                  </Link>
                </SheetClose>
              </div>
            )}

            
          </div>

          {/* Footer - Auth Actions */}
          <div className="border-t p-4">
            {!isAuthenticated && (
              <div className="space-y-2">
              <SheetClose asChild>
                  <Link href="/auth/login" className="w-full">
                    <Button variant="default" className="w-full bg-[#43CD66] text-[#102D21] hover:bg-[#43CD66]/90">
                    Sign In
                  </Button>
                </Link>
              </SheetClose>
                <SheetClose asChild>
                  <Link href="/auth/select-user-type" className="w-full">
                    <Button variant="outline" className="w-full border-[#43CD66] text-[#43CD66] hover:bg-[#43CD66]/10">
                      Sign Up
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation; 