"use client";

// MainLayout is provided by seller/layout.tsx - no need to import
import Link from "next/link";
import { useParams } from "next/navigation";

const SellerListingPage = () => {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/seller/dashboard"
          className="text-primary-600 hover:text-primary-700 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Seller Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Listing Details: {id}
        </h1>
        <p className="text-gray-600">View and manage your listing</p>
      </div>

      {/* Placeholder Content */}
      <div className="rounded-lg bg-white p-12 text-center shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-4 h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <h2 className="mb-2 text-2xl font-bold text-gray-700">
          Seller Listing Details Coming Soon
        </h2>
        <p className="mx-auto mb-6 max-w-md text-gray-600">
          The seller listing management feature is currently under development.
          Check back soon for updates!
        </p>
        <Link href="/seller/dashboard" className="btn btn-primary">
          Return to Seller Dashboard
        </Link>
      </div>

      {/* Placeholder for future listing details */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Listing Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium">{id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">Placeholder</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">April 14, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">April 14, 2025</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Views:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inquiries:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Offers:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conversion Rate:</span>
              <span className="font-medium">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerListingPage;
