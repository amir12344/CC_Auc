'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/src/components/layout/MainLayout';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-lg text-gray-600 mb-8">
            We encountered an error while loading this product. Please try again or browse other products.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={reset}
              className="btn btn-primary"
            >
              Try again
            </button>
            <Link href="/marketplace" className="btn btn-outline">
              Return to marketplace
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
