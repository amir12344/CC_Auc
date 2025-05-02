import MainLayout from '@/src/components/layout/MainLayout';
import { DashboardClientContent } from '@/src/features/buyer/components/dashboard/DashboardClientContent';
import { mockInsights } from '@/src/mocks';
import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buyer Dashboard - Commerce Central',
  description: 'View your buying insights, activity, and personalized dashboard on Commerce Central.'
};

/**
 * Dashboard Page - Server Component
 */
export default async function DashboardPage() {
  // Server-side authentication check (in a real app, this would check session/cookies)
  const isAuthenticated = await checkAuthentication();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    redirect('/login?returnUrl=/buyer/dashboard');
  }
  
  // Server-side data fetching
  const insights = await getInsights();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-600">View your buying insights and activity</p>
        </div>
        
        {/* Client-side interactive components with server-fetched data */}
        <DashboardClientContent insights={insights} />
      </div>
    </MainLayout>
  );
}

async function checkAuthentication(): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return true;
}

async function getInsights() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockInsights;
}

