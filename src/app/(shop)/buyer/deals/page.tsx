"use client";

import { useSelector } from "react-redux";

import {
  selectUserDisplayName,
  selectUserProfile,
} from "@/src/features/authentication/store/authSelectors";
import { SectionCards } from "@/src/features/buyer-deals";

export default function DealsPage() {
  const userProfile = useSelector(selectUserProfile);
  const userDisplayName = useSelector(selectUserDisplayName);

  // For the greeting, use the first part of the full name or firstName if available
  const firstName = userDisplayName?.split(" ")[0] || userProfile?.firstName;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">
          Hi{firstName ? `, ${firstName}` : ""}, Welcome back 👋
        </h2>
        <p className="text-muted-foreground text-sm lg:text-base">
          Here&apos;s an overview of your buying activity and insights.
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
