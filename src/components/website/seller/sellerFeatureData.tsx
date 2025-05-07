import React from 'react';
import { SellerFeatureItemProps } from '@/src/components/common/features/index';
import {
  createFloatingCard,
  createInventoryAgeVisualization,
  createBrandProtectionVisualization,
  createOrderStatusVisualization,
  createComplianceVisualization,
  createChannelDistributionVisualization
} from '@/src/components/common/features/index';

/**
 * Feature data for the seller website section
 */
export const sellerFeatures: SellerFeatureItemProps[] = [
  // Feature 1: Act Before Inventory Becomes a Liability
  {
    title: 'Act Before Inventory Becomes a Liability',
    description: 'Detect aging or returned stock early and move it before markdowns, write-offs, or warehouse gridlock erode your margins.',
    imagePath: '/images/inventoryChart.png',
    imageAlt: 'Control tower dashboard showing $ value and space tied to returned inventory at each location',
    customContent: createInventoryAgeVisualization(),
    imageOverlay: createFloatingCard(
      'Inventory Value at Risk',
      <>
        <div className="text-2xl font-bold text-primary">$1.2M</div>
        <div className="text-xs text-text-secondary">Across 3 warehouses</div>
      </>,
      'bottom-right'
    )
  },
  
  // Feature 2: Protect Brand, Pricing, and Channels
  {
    title: 'Protect Brand, Pricing, and Channels',
    description: 'Set guardrails for who can buy your products, at what price, and where they can sell them. Maintain brand integrity while still moving inventory.',
    imagePath: '/images/brandProtection.png',
    imageAlt: 'Dashboard showing brand protection settings and controls',
    customContent: createBrandProtectionVisualization(),
    imageOverlay: createFloatingCard(
      'Guardrails Active',
      <>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Pricing Floor: 10% of MSRP</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Buyer Types: Verified Only</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Geography: US, Canada</span>
        </div>
      </>,
      'top-left'
    )
  },
  
  // Feature 3: Run Resale on Autopilot
  {
    title: 'Run Resale on Autopilot',
    description: 'Set your terms once, then let our platform handle everything from buyer verification to payment processing, shipping coordination, and documentation.',
    imagePath: '/images/automationDashboard.png',
    imageAlt: 'Automation dashboard showing order processing workflow',
    customContent: createOrderStatusVisualization(),
    imageOverlay: createFloatingCard(
      'Automation Status',
      <div className="flex items-center gap-2 text-primary">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs">All systems operational</span>
      </div>,
      'top-right'
    )
  },
  
  // Feature 4: Always Audit-Ready
  {
    title: 'Always Audit-Ready',
    description: 'Every transaction is documented with verified buyer information, explicit resale terms, and proof of fulfillment. No more scrambling when auditors come knocking.',
    imagePath: '/images/complianceDashboard.png',
    imageAlt: 'Compliance dashboard showing audit documentation',
    customContent: createComplianceVisualization(),
    imageOverlay: createFloatingCard(
      'Audit Documentation',
      <>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Buyer Identity Verified</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Resale Terms Documented</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span className="text-xs">Fulfillment Proof Secured</span>
        </div>
      </>,
      'top-left'
    )
  },
  
  // Feature 5: Monetize Across Channels Without Conflict
  {
    title: 'Monetize Across Channels Without Conflict',
    description: 'Segment your inventory by channel, price point, or geography. Sell the same products through different channels without creating channel conflict.',
    imagePath: '/images/channelManagement.png',
    imageAlt: 'Channel management dashboard showing distribution across different sales channels',
    customContent: createChannelDistributionVisualization(),
    imageOverlay: createFloatingCard(
      'Channel Performance',
      <>
        <div className="flex items-center gap-2 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="text-xs">D2C: +28% margin</span>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <span className="text-xs">B2B: 3.5x volume</span>
        </div>
      </>,
      'top-right'
    )
  }
];
