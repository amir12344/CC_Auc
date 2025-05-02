'use client';

// Link is used in the Button component
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store';
import Sidebar from './Sidebar';
import { Button } from '@/src/components/ui/button'; 

/**
 * Client-side header component
 */
export function HeaderClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <div className="flex items-center space-x-5">
        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </Button>

        {/* Cart button */}
        {/* <IconButton
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          }
          variant="light"
          href="/buyer/cart"
          badge="3"
          badgeColor="primary"
        /> */}

        {/* Wishlist button */}
        {/* <IconButton
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          }
          variant="light"
          href="/buyer/wishlist"
          badge="5"
          badgeColor="pending"
        /> */}



        {/* User Profile / Login */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center">
              {/* User dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={toggleSidebar}
                  className="flex items-center space-x-2"
                >
                  <span className="hidden md:inline font-medium">My Account</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium shadow-xs border border-primary-200">
                    JD
                  </div>
                </Button>
              </div>

              {/* Seller Home link */}
              {userType === 'seller' && (
                <Button
                  variant="default"
                  className="ml-4 flex items-center"
                  onClick={() => window.location.href = '/seller'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                  </svg>
                  Seller Dashboard
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="hidden md:inline-flex"
                onClick={() => window.location.href = '/register'}
              >
                Register
              </Button>
              <Button
                variant="default"
                className="flex items-center"
                onClick={() => window.location.href = '/login'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Login
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Only rendered when open */}
      {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    </>
  );
}

