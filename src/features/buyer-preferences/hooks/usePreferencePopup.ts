'use client';

import { useState, useEffect } from 'react';
import { BuyerPreferences } from '../types/preferences';
import { usePreferenceData } from './usePreferenceData';

const POPUP_SHOWN_KEY = 'buyer-preferences-popup-shown';

export const usePreferencePopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const { preferences, savePreferences } = usePreferenceData();

  // Load popup state from localStorage on mount
  useEffect(() => {
    const popupShown = localStorage.getItem(POPUP_SHOWN_KEY);
    setHasShownPopup(popupShown === 'true');
  }, []);

  // Show popup for new users or those who haven't completed preferences
  const shouldShowPopup = () => {
    return !hasShownPopup && !preferences.isCompleted;
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    markPopupAsShown();
  };

  const skipPopup = () => {
    setIsPopupOpen(false);
    markPopupAsShown();
  };

  const markPopupAsShown = () => {
    setHasShownPopup(true);
    localStorage.setItem(POPUP_SHOWN_KEY, 'true');
  };

  const completePreferences = async (completedPreferences: BuyerPreferences) => {
    try {
      await savePreferences(completedPreferences);
      setIsPopupOpen(false);
      markPopupAsShown();
    } catch (error) {
      console.error('Error completing preferences:', error);
      // Still close the popup even if save fails
      setIsPopupOpen(false);
      markPopupAsShown();
    }
  };

  const clearPreferences = () => {
    // Clear both preference data and popup state
    localStorage.removeItem(POPUP_SHOWN_KEY);
    setHasShownPopup(false);
  };

  const triggerPopupForBuyer = () => {
    if (shouldShowPopup()) {
      // Small delay to ensure the page is loaded
      setTimeout(() => {
        setIsPopupOpen(true);
      }, 1000);
    }
  };

  return {
    isPopupOpen,
    preferences,
    hasShownPopup,
    shouldShowPopup,
    openPopup,
    closePopup,
    skipPopup,
    completePreferences,
    clearPreferences,
    triggerPopupForBuyer
  };
}; 