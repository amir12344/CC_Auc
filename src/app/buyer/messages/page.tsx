'use client';

import { withAuth } from '@/src/hocs/withAuth';
import MainLayout from '@/src/components/layout/MainLayout';

const MessagesPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">View and manage your communications</p>
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Messages Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The messaging feature is currently under development. Check back soon for updates!
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    </MainLayout>
  );
};


export default withAuth(MessagesPage, { redirectUnauthenticated: '/login?returnUrl=/buyer/messages' });

