"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ChangeEvent } from 'react';
import { type RootState } from '@/src/lib/store';
import { closeOfferModal, updateVariant, updateVariantUnits, type OfferVariant } from '../store/offerSlice';
import { addToOffer } from '../store/offerCartSlice';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { X } from 'lucide-react';

// Constants
const PRODUCT_IMAGE = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const SUBTITLE = "$13,740.00 • 6000 units • 50% off MSRP • 3 variants";
const DROPDOWN_OPTIONS = ["Clear", "Nordic Blue", "Retro Green"];
const MOCK_STATS = {
  upc: "8711269989833",
  asin: "B00DJ4H5UM",
  buyBox: "-",
  soldByAmazon: "-",
  estSales: "-",
  numSellers: "0",
};

// Helper function to get variant color class
const getVariantColorClass = (variantName: string): string => {
  switch (variantName) {
    case 'Clear':
      return 'bg-transparent border border-gray-200';
    case 'Nordic Blue':
      return 'bg-blue-200';
    case 'Retro Green':
      return 'bg-green-200';
    default:
      return 'bg-gray-200';
  }
};

// Product Header Component
interface ProductHeaderProps {
  productImage: string;
  productTitle: string;
  subtitle: string;
  onClose: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  productImage, 
  productTitle, 
  subtitle, 
  onClose 
}) => (
  <div className="flex items-start gap-4 md:gap-8 p-5 md:p-10 border-b relative">
    <button 
      onClick={onClose}
      className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
      aria-label="Close dialog"
    >
      <X size={24} />
    </button>
    
    <div className="p-0 flex items-center justify-center bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm">
      <img 
        src={productImage} 
        alt={productTitle || "Glass Flow 275 ML"} 
        className="w-16 h-16 md:w-24 md:h-24 object-cover" 
      />
    </div>
    
    <div className="flex flex-col gap-1 md:gap-2">
      <div className="text-xs md:text-sm text-gray-500 font-medium">Mepal</div>
      <div className="text-lg md:text-2xl font-semibold text-gray-900 leading-tight">
        {productTitle || "Glass Flow 275 ML"}
      </div>
      <div className="text-xs md:text-sm text-gray-500">{subtitle}</div>
    </div>
  </div>
);

// Product Stats Component
interface ProductStatsProps {
  stats: typeof MOCK_STATS;
  selectedDropdown: string;
  onDropdownChange: (value: string) => void;
  isMobile: boolean;
}

const ProductStats: React.FC<ProductStatsProps> = ({ 
  stats, 
  selectedDropdown, 
  onDropdownChange, 
  isMobile 
}) => (
  <div className="flex flex-col md:flex-row md:flex-nowrap items-start md:items-center gap-4 md:gap-6 p-4 border-b bg-gray-50">
    <div className="relative w-full md:w-auto">
      <select
        className="appearance-none border rounded px-4 py-2 pr-8 bg-white text-sm font-medium w-full md:min-w-[120px]"
        value={selectedDropdown}
        onChange={(e) => onDropdownChange(e.target.value)}
      >
        {DROPDOWN_OPTIONS.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
    
    {isMobile ? (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs text-gray-700 font-medium">
        <div><span className="text-gray-500">UPC</span>: {stats.upc}</div>
        <div><span className="text-gray-500">ASIN</span>: {stats.asin}</div>
        <div><span className="text-gray-500">Buy box price</span>: {stats.buyBox}</div>
        <div><span className="text-gray-500">Sold By Amazon</span>: {stats.soldByAmazon}</div>
        <div><span className="text-gray-500">Est Sales</span>: {stats.estSales}</div>
        <div><span className="text-gray-500"># of Sellers</span>: {stats.numSellers}</div>
      </div>
    ) : (
      <div className="flex flex-wrap gap-6 flex-1 text-xs text-gray-700 font-medium">
        <div><span className="text-gray-500">UPC</span>: {stats.upc}</div>
        <div><span className="text-gray-500">ASIN</span>: {stats.asin}</div>
        <div><span className="text-gray-500">Buy box price</span>: {stats.buyBox}</div>
        <div><span className="text-gray-500">Sold By Amazon</span>: {stats.soldByAmazon}</div>
        <div><span className="text-gray-500">Est Sales</span>: {stats.estSales}</div>
        <div><span className="text-gray-500"># of Sellers</span>: {stats.numSellers}</div>
      </div>
    )}
  </div>
);

// Variant Card Component (Mobile)
interface VariantCardProps {
  variant: OfferVariant;
  onVariantSelect: () => void;
  onUnitsChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const VariantCard: React.FC<VariantCardProps> = ({ 
  variant, 
  onVariantSelect, 
  onUnitsChange 
}) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        id={`mobile-variant-${variant.id}`}
        checked={variant.checked}
        onChange={onVariantSelect}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={variant.checked ? `Unselect variant ${variant.name}` : `Select variant ${variant.name}`}
      />
      <div className="flex items-center gap-2">
        <div className={`w-3 h-6 rounded-sm ${getVariantColorClass(variant.name)}`} />
        <span className="font-medium">{variant.name}</span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <div className="text-xs text-gray-500 mb-1">Inventory</div>
        <div className="text-xs text-gray-500 mb-1">2,000</div>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 text-right"
          min={0}
          value={variant.totalUnits}
          onChange={onUnitsChange}
          aria-label={`Units for ${variant.name}`}
        />
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Price/Unit</div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">${variant.pricePerUnit.toFixed(2)}</span>
          <span className="text-xs text-gray-500">$2.29</span>
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Total Units</div>
        <div className="text-sm">{variant.totalUnits.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Total Price</div>
        <div className="text-sm font-semibold">
          ${variant.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  </div>
);

// Variant Row Component (Desktop)
interface VariantRowProps {
  variant: OfferVariant;
  onVariantSelect: () => void;
  onUnitsChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const VariantRow: React.FC<VariantRowProps> = ({ 
  variant, 
  onVariantSelect, 
  onUnitsChange 
}) => (
  <tr className="bg-white hover:bg-gray-50">
    <td className="py-4 text-center">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`variant-${variant.id}`}
          checked={variant.checked}
          onChange={onVariantSelect}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={variant.checked ? `Unselect variant ${variant.name}` : `Select variant ${variant.name}`}
        />
      </div>
    </td>
    <td className="py-4 pl-2 font-medium text-gray-900 flex items-center gap-3">
      <div className="w-8 h-12 flex items-center justify-center">
        <div className={`w-4 h-8 rounded-sm ${getVariantColorClass(variant.name)}`} />
      </div>
      {variant.name}
    </td>
    <td className="py-4 text-right text-gray-700">
      <div className="flex justify-end">
        <div className="text-xs text-gray-500 mb-1">2,000</div>
        <input
          type="number"
          className="w-24 border rounded px-3 py-2 text-right"
          min={0}
          value={variant.totalUnits}
          onChange={onUnitsChange}
          aria-label={`Units for ${variant.name}`}
        />
      </div>
    </td>
    <td className="py-4 text-right text-gray-700">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">${variant.pricePerUnit.toFixed(2)}</span>
        <span className="text-xs text-gray-500">$2.29</span>
      </div>
    </td>
    <td className="py-4 text-right text-gray-700">{variant.totalUnits.toLocaleString()}</td>
    <td className="py-4 text-right font-semibold text-gray-900">
      ${variant.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </td>
  </tr>
);

// Summary Component
interface SummaryProps {
  totalUnits: number;
  totalPrice: number;
  avgPricePerUnit: number;
  isMobile: boolean;
}

const Summary: React.FC<SummaryProps> = ({ 
  totalUnits, 
  totalPrice, 
  avgPricePerUnit, 
  isMobile 
}) => {
  if (isMobile) {
    return (
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="font-semibold">Total Units:</span>
          <span className="font-semibold">{totalUnits.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Total Price:</span>
          <span className="font-semibold">
            ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-xs text-gray-500 text-right">
          Avg Price/Unit: ${avgPricePerUnit.toFixed(2)}
        </div>
      </div>
    );
  }

  return (
    <tfoot>
      <tr className="border-t border-gray-200">
        <td colSpan={4} className="pt-4 text-right pr-4 font-semibold text-gray-900">Total</td>
        <td className="pt-4 text-right font-semibold text-gray-900">
          {totalUnits.toLocaleString()}
        </td>
        <td className="pt-4 text-right font-semibold text-gray-900">
          ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </td>
      </tr>
      <tr>
        <td colSpan={6} className="pt-1 text-right">
          <div className="text-xs text-gray-500">
            Avg Price/Unit: ${avgPricePerUnit.toFixed(2)}
          </div>
        </td>
      </tr>
    </tfoot>
  );
};

// Main Component
export default function BuildOfferModal() {
  const [selectedDropdown, setSelectedDropdown] = useState(DROPDOWN_OPTIONS[0]);
  const [isMobile, setIsMobile] = useState(false);
  
  const dispatch = useDispatch();
  const { open, productTitle, variants, productId } = useSelector((state: RootState) => state.buildOffer);
  const offerItems = useSelector((state: RootState) => state.offerCart.items);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoized calculations
  const totalUnits = useMemo(() => 
    offerItems.reduce((sum, item) => sum + item.quantity, 0), 
    [offerItems]
  );
  
  const totalPrice = useMemo(() => 
    offerItems.reduce((sum, item) => sum + item.totalPrice, 0), 
    [offerItems]
  );
  
  const avgPricePerUnit = useMemo(
    () => (totalUnits > 0 ? totalPrice / totalUnits : 0),
    [totalUnits, totalPrice]
  );

  // Memoized handlers
  const handleClose = useCallback(() => {
    dispatch(closeOfferModal());
  }, [dispatch]);

  const handleVariantSelect = useCallback((variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      dispatch(updateVariant({ id: variantId, checked: !variant.checked }));
    }
  }, [dispatch, variants]);

  const handleUnitsChange = useCallback((variantId: string, units: number) => {
    dispatch(updateVariantUnits({ id: variantId, units }));
  }, [dispatch]);

  const handleAddToOffer = () => {
    const checkedVariants = variants.filter(v => v.checked);
    
    checkedVariants.forEach(variant => {
      dispatch(addToOffer({
        productId: productId!,
        variantId: variant.id,
        productName: productTitle,
        variantName: variant.name,
        quantity: variant.totalUnits,
        offeredPrice: variant.pricePerUnit,
        msrp: variant.pricePerUnit,
        pricePerUnit: variant.pricePerUnit,
        totalUnits: variant.totalUnits,
        totalPrice: variant.totalPrice,
      }));
    });
    
    handleClose();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose} modal>
      <DialogContent 
        className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[80vw] p-0 overflow-visible rounded-lg shadow-xl" 
        hideCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{productTitle || "Product Details"}</DialogTitle>
          <DialogDescription>Select variants and quantities for your offer</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col w-full relative">
          <ProductHeader
            productImage={PRODUCT_IMAGE}
            productTitle={productTitle}
            subtitle={SUBTITLE}
            onClose={handleClose}
          />

          <ProductStats
            stats={MOCK_STATS}
            selectedDropdown={selectedDropdown}
            onDropdownChange={setSelectedDropdown}
            isMobile={isMobile}
          />

          {isMobile ? (
            <div className="p-4 space-y-4">
              {variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  onVariantSelect={() => handleVariantSelect(variant.id)}
                  onUnitsChange={(e) => handleUnitsChange(variant.id, Number(e.target.value))}
                />
              ))}
              <Summary
                totalUnits={totalUnits}
                totalPrice={totalPrice}
                avgPricePerUnit={avgPricePerUnit}
                isMobile={true}
              />
            </div>
          ) : (
            <div className="overflow-x-auto p-6">
              <table className="w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-xs text-gray-500 font-semibold">
                    <th className="w-12 pb-2"></th>
                    <th className="text-left pb-2 pl-2">Variant</th>
                    <th className="text-right pb-2">Inventory</th>
                    <th className="text-right pb-2">Price/Unit</th>
                    <th className="text-right pb-2">Total Units</th>
                    <th className="text-right pb-2">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      onVariantSelect={() => handleVariantSelect(variant.id)}
                      onUnitsChange={(e) => handleUnitsChange(variant.id, Number(e.target.value))}
                    />
                  ))}
                </tbody>
                <Summary
                  totalUnits={totalUnits}
                  totalPrice={totalPrice}
                  avgPricePerUnit={avgPricePerUnit}
                  isMobile={false}
                />
              </table>
            </div>
          )}

          <DialogFooter className="flex justify-between md:justify-end gap-4 px-6 py-4 border-t bg-white">
            <Button variant="outline" onClick={handleClose} className="px-4 md:px-6">
              Cancel
            </Button>
            <Button 
              onClick={handleAddToOffer} 
              className="bg-black hover:bg-gray-800 text-white px-4 md:px-6"
              disabled={!variants.some(v => v.checked)}
            >
              Add to Offer
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
