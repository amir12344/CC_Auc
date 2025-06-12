import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Deals - Commerce Central',
  description: 'Browse inventory, manage purchases, and track orders as a buyer on Commerce Central.',
  openGraph: {
    title: 'My Deals - Commerce Central',
    description: 'Browse inventory, manage purchases, and track orders as a buyer on Commerce Central.',
  },
};

// Server-side authentication check (simplified for now)
async function checkAuth() {
  // This should be replaced with actual auth check from your auth provider
  // For now, assuming authenticated - replace with real logic
  return true;
}

export default async function BuyerPage() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect('/login?returnUrl=/buyer');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Deals</h1>
        <p className="text-gray-600">Browse inventory and manage your purchases</p>
      </div>
      
      {/* Main Content */}
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
        <h2 className="text-2xl font-bold text-gray-700 mb-2">My Deals Coming Soon</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Your deals portal is currently under development. Check back soon for updates!
        </p>
        <div className="space-x-4">
          <Link 
            href="/marketplace" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Marketplace
          </Link>
          <Link 
            href="/buyer/product/example" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Example Product
          </Link>
        </div>
      </div>
      
      {/* Feature Cards */}
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
  );
} 