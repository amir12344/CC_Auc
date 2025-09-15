"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  selectIsAuthenticated,
  selectIsBuyer,
} from "@/src/features/authentication/store/authSelectors";
import { BuyerPreferencePopup } from "@/src/features/buyer-preferences/components/BuyerPreferencePopup";
import { usePreferencePopup } from "@/src/features/buyer-preferences/hooks/usePreferencePopup";
import { ShopClientContent } from "@/src/features/marketplace-catalog/components/ShopClientContent";

export default function MarketplacePage() {
  // Authentication state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isBuyer = useSelector(selectIsBuyer);

  // Buyer preference popup logic
  const {
    isPopupOpen,
    preferences,
    closePopup,
    skipPopup,
    completePreferences,
    triggerPopupForBuyer,
  } = usePreferencePopup();

  // Trigger popup only for authenticated buyers on marketplace page
  useEffect(() => {
    // Only trigger for authenticated buyers (not sellers or unauthenticated users)
    if (isAuthenticated && isBuyer) {
      triggerPopupForBuyer();
    }
  }, [isAuthenticated, isBuyer, triggerPopupForBuyer]);

  return (
    <>
      <div className="relative min-h-screen pb-16">
        <div className="mx-auto max-w-full">
          <ShopClientContent />
        </div>
      </div>

      {/* Buyer Preference Popup - Only for authenticated buyers */}
      {isAuthenticated && isBuyer && (
        <BuyerPreferencePopup
          initialPreferences={preferences}
          isOpen={isPopupOpen}
          onClose={closePopup}
          onComplete={completePreferences}
          onSkip={skipPopup}
        />
      )}
    </>
  );
}
