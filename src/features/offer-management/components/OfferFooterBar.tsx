import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { selectCurrentCatalogTotals } from "../store/offerCartSlice";
import OfferSummarySheet from "./OfferSummarySheet";

const OfferFooterBar: React.FC = () => {
  const {
    totalProducts,
    avgPricePerUnit,
    totalUnits,
    totalPrice,
    minimumOrderValue,
  } = useSelector(selectCurrentCatalogTotals);

  const [isMounted, setIsMounted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Only render on client-side to avoid hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render during SSR or if no products in current catalog
  if (!isMounted || totalProducts === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-700 bg-black text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between">
            {/* Stats - hidden on mobile */}
            <div className="mr-8 hidden flex-1 justify-around space-x-0 text-sm md:flex">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Products</span>
                <span className="font-bold">{totalProducts}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Avg. price/unit</span>
                <span className="font-bold">${avgPricePerUnit.toFixed(2)}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Units</span>
                <span className="font-bold">{totalUnits.toLocaleString()}</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Min. order value</span>
                <span className="font-bold">
                  $
                  {minimumOrderValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400">Total price</span>
                <span className="font-bold">
                  $
                  {totalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Mobile product count indicator */}
            <div className="text-sm md:hidden">
              <span className="font-bold">{totalProducts}</span>
              <span className="text-gray-400">
                {" "}
                {totalProducts === 1 ? "product" : "products"}
              </span>
            </div>

            {/* Build offer button */}
            <button
              className="rounded-full bg-white px-6 py-2 font-medium text-black transition hover:bg-gray-200"
              onClick={() => setShowSummary(true)}
              type="button"
            >
              Build Offer
            </button>
          </div>
        </div>
      </div>

      {/* Offer Summary Sheet */}
      <OfferSummarySheet
        onClose={() => setShowSummary(false)}
        open={showSummary}
      />
    </>
  );
};

export default OfferFooterBar;
