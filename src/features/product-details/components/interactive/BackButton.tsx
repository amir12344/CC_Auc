'use client';

import { useRouter, usePathname } from 'next/navigation';

/**
 * Client Component for the back button
 * Improved to handle different navigation scenarios
 */
export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on a product page
  const isProductPage = pathname.includes('/marketplace/');

  // If we're on a product page, link directly to marketplace
  // Otherwise use the browser's back functionality
  const handleClick = () => {
    if (isProductPage) {
      router.push('/marketplace');
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center text-primary-600 hover:text-primary-700"
      aria-label="Back to marketplace"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      Back to Marketplace
    </button>
  );
} 