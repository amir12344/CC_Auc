import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectOfferTotals } from '../store/offerCartSlice';
import OfferSummarySheet from './OfferSummarySheet';

const OfferFooterBar: React.FC = () => {
  const { totalProducts, avgPricePerUnit, totalUnits, totalPrice } = useSelector(selectOfferTotals);
  const [isMounted, setIsMounted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  // Only render on client-side to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Don't render during SSR or if no products
  if (!isMounted || totalProducts === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-black text-white shadow-lg z-50 border-t border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between">
            {/* Stats - hidden on mobile */}
            <div className="hidden md:flex justify-around flex-1 space-x-0 mr-8 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-gray-400 text-xs">Products</span>
                <span className="font-bold">{totalProducts}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-gray-400 text-xs">Avg. price/unit</span>
                <span className="font-bold">${avgPricePerUnit.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-gray-400 text-xs">Units</span>
                <span className="font-bold">{totalUnits.toLocaleString()}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-gray-400 text-xs">Min. order value</span>
                <span className="font-bold">$1,000.00</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-gray-400 text-xs">Total price</span>
                <span className="font-bold">${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
            
            {/* Mobile product count indicator */}
            <div className="md:hidden text-sm">
              <span className="font-bold">{totalProducts}</span>
              <span className="text-gray-400"> {totalProducts === 1 ? 'product' : 'products'}</span>
            </div>
            
            {/* Build offer button */}
            <button 
              className="bg-white text-black px-6 py-2 rounded font-medium hover:bg-gray-200 transition" 
              onClick={() => setShowSummary(true)}
            >
              Build Offer
            </button>
          </div>
        </div>
      </div>

      {/* Offer Summary Sheet */}
      <OfferSummarySheet 
        open={showSummary} 
        onClose={() => setShowSummary(false)} 
      />
    </>
  );
};

export default OfferFooterBar;
