import React, { ReactNode } from 'react';

/**
 * Creates a floating card overlay for feature images
 */
export const createFloatingCard = (
  title: string,
  content: ReactNode,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-right'
) => {
  const positionClass = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  }[position];
  
  return (
    <div className={`absolute ${positionClass} bg-white rounded-lg shadow-lg p-4 z-20`}>
      <div className="text-sm font-medium text-text-primary mb-2">{title}</div>
      {content}
    </div>
  );
};

/**
 * Creates a visualization for inventory age distribution
 */
export const createInventoryAgeVisualization = () => (
  <div className="bg-gray-50 p-6 rounded-xl mb-8">
    <h4 className="font-medium mb-4 text-text-primary">Inventory Age Distribution</h4>
    <div className="flex items-end h-32 gap-3">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full bg-primary-300 rounded-t-md h-[20%]"></div>
        <span className="text-xs mt-2 text-text-secondary">0-60 days</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full bg-primary-400 rounded-t-md h-[40%]"></div>
        <span className="text-xs mt-2 text-text-secondary">61-100 days</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full bg-primary-500 rounded-t-md h-[60%]"></div>
        <span className="text-xs mt-2 text-text-secondary">101-180 days</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full bg-primary-600 rounded-t-md h-[80%]"></div>
        <span className="text-xs mt-2 text-text-secondary">181-270 days</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full bg-primary-700 rounded-t-md h-[100%]"></div>
        <span className="text-xs mt-2 text-text-secondary">270+ days</span>
      </div>
    </div>
  </div>
);

/**
 * Creates a visualization for brand protection controls
 */
export const createBrandProtectionVisualization = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
    <h4 className="font-medium mb-4 text-text-primary">Brand Protection Controls</h4>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-text-secondary">Pricing Floor</span>
          <span className="text-sm font-medium">10%+ of MSRP</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{width: '40%'}}></div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-text-secondary w-full mb-1">Approved Buyer Types</span>
        <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">Amazon Seller</span>
        <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">Discount Stores</span>
        <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">Wholesaler</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs rounded-full">Liquidator</span>
      </div>
      <div>
        <span className="text-sm text-text-secondary block mb-1">Geography</span>
        <div className="grid grid-cols-2 gap-2">
          <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">US Northeast</span>
          <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">US Midwest</span>
          <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">US South</span>
          <span className="px-3 py-1 bg-primary-100 text-primary text-xs rounded-full">US West</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Creates a visualization for order status dashboard
 */
export const createOrderStatusVisualization = () => (
  <div className="bg-gray-50 p-6 rounded-xl mb-8">
    <h4 className="font-medium mb-4 text-text-primary">Order Status Dashboard</h4>
    <div className="space-y-4">
      <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <span className="text-blue-600 text-xs font-medium">PO</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium text-sm">Order #CC-2023-0542</span>
            <span className="text-xs text-blue-600 font-medium">PO Sent</span>
          </div>
          <div className="text-xs text-text-secondary">$45,000 • 3 SKUs • Midwest Retailer</div>
        </div>
      </div>
      <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
          <span className="text-amber-600 text-xs font-medium">$</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium text-sm">Order #CC-2023-0498</span>
            <span className="text-xs text-amber-600 font-medium">Payment Due</span>
          </div>
          <div className="text-xs text-text-secondary">$78,250 • 5 SKUs • Discount Chain</div>
        </div>
      </div>
      <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
          <span className="text-purple-600 text-xs font-medium">N</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium text-sm">Order #CC-2023-0511</span>
            <span className="text-xs text-purple-600 font-medium">Negotiation</span>
          </div>
          <div className="text-xs text-text-secondary">$32,750 • 2 SKUs • Online Retailer</div>
        </div>
      </div>
      <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
          <span className="text-primary text-xs font-medium">✓</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium text-sm">Order #CC-2023-0487</span>
            <span className="text-xs text-primary font-medium">Complete</span>
          </div>
          <div className="text-xs text-text-secondary">$103,500 • 8 SKUs • Wholesale Distributor</div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Creates a visualization for compliance documentation
 */
export const createComplianceVisualization = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
    <h4 className="font-medium mb-4 text-text-primary">Compliance Documentation</h4>
    <div className="space-y-4">
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-sm">Buyer Identity</div>
          <div className="text-xs text-text-secondary">Business verification, tax ID, reseller permits</div>
        </div>
      </div>
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-sm">Resale Terms</div>
          <div className="text-xs text-text-secondary">Pricing, quantity, channel restrictions, geography</div>
        </div>
      </div>
      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-sm">Fulfillment Proof</div>
          <div className="text-xs text-text-secondary">Shipping confirmation, delivery receipts, chain of custody</div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Creates a visualization for channel distribution
 */
export const createChannelDistributionVisualization = () => (
  <div className="bg-gray-50 p-6 rounded-xl mb-8">
    <h4 className="font-medium mb-4 text-text-primary">Channel Distribution</h4>
    <div className="space-y-6">
      {/* D2C Channel */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Direct-to-Consumer (D2C)</span>
          <span className="text-sm text-primary font-medium">Higher Margins</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{width: '35%'}}></div>
          </div>
          <span className="text-xs font-medium">35%</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-primary-100 text-primary text-xs rounded-full">Your Website</span>
          <span className="px-2 py-1 bg-primary-100 text-primary text-xs rounded-full">Marketplace</span>
          <span className="px-2 py-1 bg-primary-100 text-primary text-xs rounded-full">Flash Sales</span>
        </div>
      </div>
      {/* B2B Channel */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Business-to-Business (B2B)</span>
          <span className="text-sm text-blue-600 font-medium">Higher Volume</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '65%'}}></div>
          </div>
          <span className="text-xs font-medium">65%</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Wholesalers</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Retailers</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Distributors</span>
        </div>
      </div>
    </div>
  </div>
);
