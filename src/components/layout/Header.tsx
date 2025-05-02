import Link from 'next/link';
// Removed unused Image import
import { HeaderClient } from './HeaderClient';
import Logo from '@/src/features/website/components/ui/Logo';

/**
 * Header component - Server Component
 */
export default function Header() {
  return (
    <header className='bg-white sticky top-0 z-50'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center'>
        {/* Left: Logo */}
        <div className='flex items-center space-x-6'>
          <Logo />
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
        </div>
        {/* Center: Search bar */}
        <div className='flex-1 max-w-sm mx-8'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 text-neutral-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <input
              type='text'
              placeholder='Search brands or products'
              className='w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full focus:outline-hidden focus:ring-2 focus:ring-black bg-white text-black placeholder-neutral-400'
              spellCheck={false}
              autoComplete='off'
            />
          </div>
        </div>
        {/* Right: My Deals and Avatar */}
        <div className='flex items-center space-x-4'>
          <Link
            href='/my-deals'
            className='text-black font-medium hover:underline transition-colors'
          >
            My Deals
          </Link>
          <HeaderClient />
        </div>
      </div>
    </header>
  )
}

