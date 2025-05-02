'use client';

import { withAuth } from '@/src/hocs/withAuth';
import MainLayout from '@/src/components/layout/MainLayout';
import Link from 'next/link';

const BuyerDashboardPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600">Browse inventory and manage your purchases</p>
        </div>
        
        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Buyer Dashboard Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The buyer dashboard is currently under development. Check back soon for updates!
          </p>
          <div className="space-x-4">
            <Link href="/marketplace" className="btn btn-primary">
              Go to Marketplace
            </Link>
            <Link href="/buyer/product/example" className="btn btn-outline">
              View Example Product
            </Link>
          </div>
        </div>
        
        {/* Placeholder for future buyer features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Purchase History</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Saved Searches</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Order Tracking</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default withAuth(BuyerDashboardPage, { redirectUnauthenticated: '/login?returnUrl=/buyer' }); 