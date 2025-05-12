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
  <div className="h-[400px] overflow-auto">
    <div className="bg-gray-50 p-6 rounded-xl">
      <h4 className="font-medium mb-5 text-text-primary">Inventory Age Distribution</h4>

      <div className="space-y-4">
        {/* Age category bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">0-20 days</span>
              <span className="text-sm font-medium">30%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-text-secondary">41-60 days</span>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>

        </div>

        {/* Total indicator */}
        <div className="bg-white p-4 rounded-lg mt-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-text-secondary block">Average Age</span>
              <span className="text-lg font-medium">42 days</span>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-primary-200 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary overflow-hidden" style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                clip: 'rect(0px, 48px, 48px, 24px)'
              }}></div>
              <span className="text-sm font-medium">42%</span>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-xs text-text-secondary mb-1">New<br />(0-30 days)</div>
            <div className="text-lg font-medium">45%</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-xs text-text-secondary mb-1">Standard<br />(31-70 days)</div>
            <div className="text-lg font-medium">40%</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-xs text-text-secondary mb-1">Aging<br />(71-100 days)</div>
            <div className="text-lg font-medium">15%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Creates a visualization for brand protection controls
 */
export const createBrandProtectionVisualization = () => (
  <div className="h-[400px] overflow-auto">
    <div className="bg-gray-50 p-6 pt-0 rounded-xl">
      <h4 className="font-medium mb-5 text-text-primary">Brand Protection Controls</h4>

      <div className="space-y-5">
        {/* Pricing Floor */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-sm">Pricing Floor</h5>
              <p className="text-xs text-text-secondary">Protects your brand value in the market</p>
            </div>
          </div>

          <div className="mb-1 flex justify-between items-center">
            <span className="text-xs text-text-secondary">Minimum 10% of MSRP</span>
            <span className="text-xs font-medium text-primary">Strong Protection</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Geography */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-sm">Approved Geography</h5>
              <p className="text-xs text-text-secondary">Limit sales to specific regions</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              US Northeast
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              US Midwest
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              US South
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              US West
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Your brand is protected</h3>
              <div className="mt-1 text-xs text-green-700">
                Your current settings provide strong brand protection across all channels
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Creates a visualization for order status dashboard
 */
export const createOrderStatusVisualization = () => (
  <div className="h-[400px] overflow-auto">
    <div className="bg-gray-50 p-6 rounded-xl">
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
  </div>
);

/**
 * Creates a visualization for compliance documentation
 */
export const createComplianceVisualization = () => (
  <div className="h-[400px] overflow-auto">
    <div className="p-6 rounded-xl mt-[10%]">
      <h4 className="font-medium mb-4 text-text-primary">Compliance Documentation</h4>
      <div className="space-y-4">
        <div className="flex items-center p-3 bg-white rounded-lg">
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
        <div className="flex items-center p-3 bg-white rounded-lg">
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
        <div className="flex items-center p-3 bg-white rounded-lg">
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
  </div>
);

/**
 * Creates a visualization for channel distribution
 */
export const createChannelDistributionVisualization = () => (
  <div className="h-[400px] overflow-auto">
    <div className="bg-gray-50 p-6 rounded-xl" style={{ marginTop: '14%' }}>
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
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '35%' }}></div>
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
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
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
  </div>
);
