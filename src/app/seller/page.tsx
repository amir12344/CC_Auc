'use client';

import { withAuth } from '@/src/hocs/withAuth';
import MainLayout from '@/src/components/layout/MainLayout';
import Link from 'next/link';

const SellerDashboardPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Manage your inventory and sales</p>
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
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Seller Dashboard Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The seller dashboard is currently under development. Check back soon for updates!
          </p>
          <div className="space-x-4">
            <Link href="/marketplace" className="btn btn-primary">
              Go to Buyer Shop
            </Link>
            <Link href="/seller/listing/example" className="btn btn-outline">
              View Example Listing
            </Link>
          </div>
        </div>
        
        {/* Placeholder for future seller features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Inventory Management</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Sales Analytics</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-2">Order Fulfillment</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Used withAuth HOC to protect this page
export default withAuth(SellerDashboardPage, { redirectUnauthenticated: '/login?returnUrl=/seller' });

