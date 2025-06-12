"use client";
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectOfferItems, selectOfferTotals, removeFromOffer } from '../store/offerCartSlice';
import { X, Download, ChevronDown } from 'lucide-react';

interface OfferSummarySheetProps {
  open: boolean;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const OfferSummarySheet: React.FC<OfferSummarySheetProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const offerItems = useSelector(selectOfferItems);
  const { totalProducts, avgPricePerUnit, totalUnits, totalPrice } = useSelector(selectOfferTotals);

  const handleRemoveItem = (productId: string, variantId?: string) => {
    dispatch(removeFromOffer({ productId, variantId }));
  };

  // State for offer price input
  const [offerPrice, setOfferPrice] = useState(`$${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
  
  // Handle offer price change
  const handleOfferPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferPrice(e.target.value);
  };

  // When open, prevent background scrolling and initialize offer price
  useEffect(() => {
    if (open) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Set initial offer price
      setOfferPrice(`$${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [open, totalPrice]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-500 ease-in-out"
    >
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-500 ease-in-out" 
        onClick={onClose}
      ></div>
      <div 
        className="fixed inset-0 z-50 bg-white overflow-y-auto animate-in slide-in-from-bottom duration-500 ease-out delay-75"
      >
        {/* Header */}
        <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <img 
                      src="/glass-icon.png" 
                      alt="Product Logo" 
                      className="w-6 h-6 object-contain" 
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                      {offerItems.length > 0 ? offerItems[0].productName.split(' ')[0] : 'Product'}
                    </h1>
                    <p className="text-base text-gray-900">
                      {offerItems.length > 0 ? offerItems[0].productName : 'Product Details'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Delete Draft Offer
                </button>
                <button
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={16} />
                  Export Offer
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="pointer" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-200 rounded-lg mb-8">
            <div className="p-4 border-r border-b md:border-b-0 border-gray-200">
              <div className="text-sm font-medium">Products</div>
              <div className="text-lg">{totalProducts}</div>
            </div>
            <div className="p-4 border-b md:border-r md:border-b-0 border-gray-200">
              <div className="text-sm font-medium">Avg. price per unit</div>
              <div className="text-lg">${avgPricePerUnit.toFixed(2)}</div>
            </div>
            <div className="p-4 border-r border-gray-200">
              <div className="text-sm font-medium">Units</div>
              <div className="text-lg">{totalUnits.toLocaleString()}</div>
            </div>
            <div className="p-4">
              <div className="text-sm font-medium">Total asking price</div>
              <div className="text-lg font-medium">${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          </div>

          {/* Saved to Draft */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Saved to Draft</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Reset
              </button>
              <button className="text-sm flex items-center gap-1 text-gray-900 font-medium hover:text-gray-600 transition-colors">
                <span className="text-lg">+</span> Add more items
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">MSRP</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Unit</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                  <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offerItems.map((item) => (
                  <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">Mepal</td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 mr-1">
                          <ChevronDown size={16} />
                        </button>
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <img src="/glass-icon.png" alt="Product thumbnail" className="h-5 w-5 object-contain" />
                        </div>
                        <div className="text-sm text-gray-900">{item.productName}</div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {item.variantName ? 1 : '-'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.msrp)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(item.pricePerUnit)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.totalUnits.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-black hover:text-gray-700 transition-colors bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center"
                        onClick={() => handleRemoveItem(item.productId, item.variantId)}
                        aria-label={`Remove ${item.productName} ${item.variantName || ''}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                {offerItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No items in your offer yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 sticky bottom-0 bg-white py-4 px-6">
          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-12">
              <div>
                <span className="text-sm text-gray-500">Min. Order Value</span>
                <div className="font-medium">$1,000.00</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Price</span>
                <div className="font-medium">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">% Off MSRP</span>
                <div className="font-medium">77.9%</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <label className="text-sm text-gray-500 absolute -top-5 left-0">Offer price</label>
                  <input 
                    type="text" 
                    className="border border-gray-300 rounded px-3 py-2 w-40" 
                    value={offerPrice}
                    onChange={handleOfferPriceChange}
                  />
                </div>
                <button
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  Submit Offer
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OfferSummarySheet;
