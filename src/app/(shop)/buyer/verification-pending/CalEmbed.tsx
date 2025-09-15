"use client";

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

import Cal, { getCalApi } from "@calcom/embed-react";

import {
  selectUserDisplayName,
  selectUserProfile,
} from "@/src/features/authentication/store/authSelectors";

interface CalEmbedProps {
  calLink?: string;
}

export const CalEmbed = (_: CalEmbedProps) => {
  // Use Redux-auth state (Amplify attributes) for prefill
  const userProfile = useSelector(selectUserProfile);
  const userDisplayName = useSelector(selectUserDisplayName);
  const prefill = useMemo(() => {
    if (!userProfile) return;
    const name = userDisplayName || userProfile.fullName || undefined;
    const email = userProfile.email || undefined;
    const buyerId = userProfile.id || userProfile.username; // Using Cognito user ID

    return { name, email, buyerId };
  }, [userProfile, userDisplayName]);
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "meet-commerce-central" });
      cal("ui", {
        theme: "dark",
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="h-[480px] w-full sm:h-[540px] md:h-[580px] lg:h-[620px] xl:h-[680px]">
      <Cal
        calLink="commerce-central-team/meet-commerce-central"
        config={{
          layout: "month_view",
          // Default CC/guest email(s)
          guests: "cat@commercecentral.ai, shivang@commercecentral.ai",
          ...(prefill?.name ? { name: prefill.name as string } : {}),
          ...(prefill?.email ? { email: prefill.email as string } : {}),
          // Pass buyerId directly as a custom field that Cal.com will include in webhook
          ...(prefill?.buyerId ? { buyerId: prefill.buyerId } : {}),
          // Also try passing as metadata for webhook access
          ...(prefill?.buyerId
            ? {
                metadata: JSON.stringify({ buyerId: prefill.buyerId }),
                "custom-buyerId": prefill.buyerId,
              }
            : {}),
          // Lock down email so it cannot be edited (supported by Cal.com embeds)
          // Using string "true" to satisfy type expectations
          disableOnPrefill: { email: "true" },
        }}
        namespace="meet-commerce-central"
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
      />
    </div>
  );
};
