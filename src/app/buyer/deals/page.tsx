'use client';

import { SectionCards } from "@/src/features/buyer-deals";
import { useSelector } from 'react-redux';
import { selectUserProfile, selectUserDisplayName } from '@/src/features/authentication/store/authSelectors';

export default function DealsPage() {
  const userProfile = useSelector(selectUserProfile);
  const userDisplayName = useSelector(selectUserDisplayName);
  
  // For the greeting, use the first part of the full name or firstName if available
  const firstName = userDisplayName?.split(' ')[0] || userProfile?.firstName;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">
          Hi{firstName ? `, ${firstName}` : ''}, Welcome back 👋
        </h2>
        <p className="text-sm lg:text-base text-muted-foreground">
          Here's an overview of your buying activity and insights.
        </p>
      </div>
      
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
      </div>
    </div>
  );
}

// Helper functions from your original file (can be reinstated if needed)
// async function checkAuthentication(): Promise<boolean> {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 100));
//   return true;
// }

// async function getInsights() {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 100));
//   // return mockInsights; // You'll need to define or import mockInsights
//   return []; // Placeholder
// }

