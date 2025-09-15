"use client";

import { useCallback, useRef, useState } from "react";

import { getBuyerPreferences } from "../services/buyerPreferenceService";
import { usePreferenceData } from "./usePreferenceData";

export const usePreferencePopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const [isCheckingPreferences, setIsCheckingPreferences] = useState(false);
  const hasTriggeredRef = useRef(false);
  const { preferences } = usePreferenceData();

  const checkExistingPreferences = useCallback(async () => {
    if (isCheckingPreferences) {
      return false;
    }

    try {
      setIsCheckingPreferences(true);
      const existingPreferences = await getBuyerPreferences();

      const hasPrefs =
        existingPreferences.length > 0 &&
        existingPreferences.some(
          (prefs) =>
            (prefs.preferredCategories &&
              prefs.preferredCategories.length > 0) ||
            (prefs.preferredSubcategories &&
              prefs.preferredSubcategories.length > 0) ||
            (prefs.listingTypePreferences &&
              prefs.listingTypePreferences.length > 0) ||
            (prefs.buyerSegments && prefs.buyerSegments.length > 0) ||
            (prefs.preferredRegions && prefs.preferredRegions.length > 0) ||
            (prefs.preferredBrandIds && prefs.preferredBrandIds.length > 0) ||
            prefs.budgetMin !== null ||
            prefs.budgetMax !== null ||
            (prefs.minimumDiscountPercentage &&
              prefs.minimumDiscountPercentage > 0)
        );

      setHasExistingPreferences(hasPrefs);
      return hasPrefs;
    } catch {
      setHasExistingPreferences(false);
      return false;
    } finally {
      setIsCheckingPreferences(false);
    }
  }, [isCheckingPreferences]);

  const shouldShowPopup = () => !hasExistingPreferences;

  const openPopup = () => setIsPopupOpen(true);

  const closePopup = () => setIsPopupOpen(false);

  const skipPopup = () => setIsPopupOpen(false);

  const completePreferences = () => {
    setHasExistingPreferences(true);
    setIsPopupOpen(false);
  };

  const clearPreferences = () => {
    setHasExistingPreferences(false);
    hasTriggeredRef.current = false;
  };

  const triggerPopupForBuyer = useCallback(async () => {
    // Use ref to prevent multiple calls
    if (hasTriggeredRef.current || isCheckingPreferences) {
      return;
    }

    hasTriggeredRef.current = true;

    try {
      setIsCheckingPreferences(true);
      const existingPreferences = await getBuyerPreferences();

      const hasPrefs =
        existingPreferences.length > 0 &&
        existingPreferences.some(
          (prefs) =>
            (prefs.preferredCategories &&
              prefs.preferredCategories.length > 0) ||
            (prefs.preferredSubcategories &&
              prefs.preferredSubcategories.length > 0) ||
            (prefs.listingTypePreferences &&
              prefs.listingTypePreferences.length > 0) ||
            (prefs.buyerSegments && prefs.buyerSegments.length > 0) ||
            (prefs.preferredRegions && prefs.preferredRegions.length > 0) ||
            (prefs.preferredBrandIds && prefs.preferredBrandIds.length > 0) ||
            prefs.budgetMin !== null ||
            prefs.budgetMax !== null ||
            (prefs.minimumDiscountPercentage &&
              prefs.minimumDiscountPercentage > 0)
        );

      setHasExistingPreferences(hasPrefs);

      if (!hasPrefs) {
        setTimeout(() => {
          setIsPopupOpen(true);
        }, 1000);
      }
    } catch {
      setHasExistingPreferences(false);
      // Show popup on error (assume no preferences)
      setTimeout(() => {
        setIsPopupOpen(true);
      }, 1000);
    } finally {
      setIsCheckingPreferences(false);
    }
  }, [isCheckingPreferences]);

  return {
    isPopupOpen,
    preferences,
    hasExistingPreferences,
    isCheckingPreferences,
    shouldShowPopup,
    openPopup,
    closePopup,
    skipPopup,
    completePreferences,
    clearPreferences,
    triggerPopupForBuyer,
    checkExistingPreferences,
  };
};
