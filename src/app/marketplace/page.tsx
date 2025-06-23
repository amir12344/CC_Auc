"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '@/src/components/layout/MainLayout';
import { ShopClientContent } from '@/src/features/marketplace-catalog/components/ShopClientContent';
import { BuyerPreferencePopup } from '@/src/features/buyer-preferences/components/BuyerPreferencePopup';
import { usePreferencePopup } from '@/src/features/buyer-preferences/hooks/usePreferencePopup';
import { selectIsAuthenticated, selectIsBuyer } from '@/src/features/authentication/store/authSelectors';

import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';

// Define category sections to match the FilterBar categories
const CATEGORIES = {
  NEW: 'New',
  FEATURED: 'Featured',
  TRENDING: 'Trending',
  FOOTWEAR: 'Footwear',
  ELECTRONICS: 'Electronics',
  BEAUTY: 'Beauty',
  ACCESSORIES: 'Accessories',
  HOME: 'Home',
} as const;

type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

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
    triggerPopupForBuyer
  } = usePreferencePopup();

  // Trigger popup only for authenticated buyers on marketplace page
  useEffect(() => {
    // Only trigger for authenticated buyers (not sellers or unauthenticated users)
    if (isAuthenticated && isBuyer) {
      triggerPopupForBuyer();
    }
  }, [isAuthenticated, isBuyer, triggerPopupForBuyer]);

  // Combine all products
  const allProducts = [...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];

  // Get unique categories
  const categories = Array.from(new Set(allProducts.map(product => product.category).filter(Boolean)));

  // Organize products by category
  const productsByCategory = {
    [CATEGORIES.NEW]: amazonListings, // Using amazonListings as new arrivals
    [CATEGORIES.FEATURED]: featuredDeals,
    [CATEGORIES.TRENDING]: trendingDeals,
    [CATEGORIES.FOOTWEAR]: allProducts.filter(product =>
      product.category?.toLowerCase().includes('footwear') ||
      product.category?.toLowerCase().includes('shoe')
    ),
    [CATEGORIES.ELECTRONICS]: allProducts.filter(product =>
      product.category?.toLowerCase().includes('electronics') ||
      product.category?.toLowerCase().includes('gadget')
    ),
    [CATEGORIES.BEAUTY]: allProducts.filter(product =>
      product.category?.toLowerCase().includes('beauty') ||
      product.category?.toLowerCase().includes('cosmetic')
    ),
    [CATEGORIES.ACCESSORIES]: allProducts.filter(product =>
      product.category?.toLowerCase().includes('accessory') ||
      product.category?.toLowerCase().includes('jewelry')
    ),
    [CATEGORIES.HOME]: allProducts.filter(product =>
      product.category?.toLowerCase().includes('home') ||
      product.category?.toLowerCase().includes('furniture')
    ),
  };



  return (
    <MainLayout>
      <div className="relative min-h-screen pb-16">
        <div className="max-w-full mx-auto">
          <ShopClientContent
            products={allProducts}
            productsByCategory={productsByCategory}
            categories={categories as string[]} // Pass the categories prop, ensuring it's typed as string[]
          />
        </div>
      </div>

      {/* Buyer Preference Popup - Only for authenticated buyers */}
      {isAuthenticated && isBuyer && (
        <BuyerPreferencePopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          onComplete={completePreferences}
          onSkip={skipPopup}
          initialPreferences={preferences}
        />
      )}
    </MainLayout>
  );
}
