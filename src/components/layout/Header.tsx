'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
// Removed unused Image import
import { HeaderClient } from './HeaderClient';
import Logo from '@/src/features/website/components/ui/Logo';
import MobileNavigation from './MobileNavigation';
import { Button } from '@/src/components/ui/button';
import SearchBar from './SearchBar';
import { MegaMenu } from './MegaMenu';
import { selectIsSeller, selectIsAuthenticated } from '@/src/features/authentication/store/authSelectors';

/**
 * Header component - Client Component (for role-based navigation)
 */
export default function Header() {
  const isSeller = useSelector(selectIsSeller);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const pathname = usePathname();

  // Hide mega menu on seller pages
  const isSellerPage = pathname?.startsWith('/seller');
  const showMegaMenu = !isSellerPage;

  return (
    <>
      {/* Sticky header with logo and navigation */}
      <header className='bg-[#102D21] top-0 z-50'>
        <div className='max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center'>
          {/* Left: Logo and Navigation Links */}
          <div className='flex items-center space-x-6'>
            <Logo />

            {/* Main navigation links - visible only on desktop */}
            <nav className='hidden md:flex items-center space-x-6'>
              {/* Show Dashboard for authenticated sellers */}
              {isAuthenticated && isSeller && (
                <Link
                  href="/seller/dashboard"
                  className="text-[#D8F4CC] hover:text-[#43CD66] font-medium text-lg transition-colors duration-300 px-3 py-2 rounded-md hover:bg-[#43CD66]/10 cursor-pointer"
                >
                  Dashboard
                </Link>
              )}

            </nav>
          </div>

          {/* Center: Search bar - visible only on desktop */}
          <div className='hidden md:block flex-1 max-w-sm mx-8'>
            <SearchBar />
          </div>

          {/* Right: User Actions */}
          <div className='flex items-center space-x-3'>
            {/* Mobile menu button - only visible on mobile */}
            <div className='md:hidden'>
              <MobileNavigation />
            </div>

            {/* User profile and auth - handles both mobile and desktop */}
            <HeaderClient />
          </div>
        </div>
      </header>

      {/* Mobile search - only visible on small screens */}
      <div className='md:hidden bg-[#102D21] px-4 py-3 border-t border-[#43CD66]/20'>
        <SearchBar />
      </div>

      {/* Mega Menu - only visible on desktop and non-seller pages */}
      {showMegaMenu && <MegaMenu />}
    </>
  )
}

