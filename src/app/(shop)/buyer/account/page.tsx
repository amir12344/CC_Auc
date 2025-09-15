import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdditionalSettingsSection } from "./additional-settings-section";
import { BillingSection } from "./billing-section";
import { ProfileSection } from "./profile-section";
import { ShippingSection } from "./shipping-section";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Manage your account settings and preferences on Commerce Central.",
};

export default function AccountPage() {
  return (
    <div className="max-w-8xl mx-auto px-4 py-4 lg:py-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Account Settings
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Manage your account settings and preferences.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex h-32 items-center justify-center">
              Loading Profile...
            </div>
          }
        >
          <ProfileSection />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex h-32 items-center justify-center">
              Loading Shipping Address...
            </div>
          }
        >
          <ShippingSection />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex h-32 items-center justify-center">
              Loading Billing Address...
            </div>
          }
        >
          <BillingSection />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex h-32 items-center justify-center">
              Loading Additional Settings...
            </div>
          }
        >
          <AdditionalSettingsSection />
        </Suspense>
      </div>
    </div>
  );
}
