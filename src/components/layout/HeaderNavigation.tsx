'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store';

const HeaderNavigation = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If not authenticated, don't render anything
  if (!isAuthenticated) return null;

  return (
    <nav className='md:flex items-center ml-6 space-x-6'>
      <Link
        href='/'
        className='text-black font-medium hover:underline transition-colors'
      >
        Home
      </Link>
      <Link
        href='/inbox'
        className='text-black font-medium hover:underline transition-colors'
      >
        Inbox
      </Link>
      <Link
        href='/wishlist'
        className='text-black font-medium hover:underline transition-colors'
      >
        Wishlist
      </Link>
      <Link
        href='/buyer/deals'
        className='text-black font-medium hover:underline transition-colors'
      >
        My Deals
      </Link>
    </nav>
  );
};

export default HeaderNavigation; 