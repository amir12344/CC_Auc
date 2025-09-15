import React, { ReactNode } from "react";

/**
 * Creates a floating card overlay for feature images
 */
export const createFloatingCard = (
  title: string,
  content: ReactNode,
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right" = "top-right"
) => {
  const positionClass = {
    "top-left": "top-6 left-6",
    "top-right": "top-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "bottom-right": "bottom-6 right-6",
  }[position];

  return (
    <div
      className={`absolute ${positionClass} z-20 rounded-lg bg-white p-4 shadow-lg`}
    >
      <div className="text-text-primary mb-2 text-sm font-medium">{title}</div>
      {content}
    </div>
  );
};

/**
 * Creates a visualization for inventory age distribution
 */
export const createInventoryAgeVisualization = () => (
  <div className="h-[400px] overflow-auto">
    <div className="rounded-xl bg-gray-50 p-6">
      <h4 className="text-text-primary mb-5 font-medium">
        Inventory Age Distribution
      </h4>

      <div className="space-y-4">
        {/* Age category bars */}
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex justify-between">
              <span className="text-text-secondary text-sm">0-20 days</span>
              <span className="text-sm font-medium">30%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: "30%" }}
              ></div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between">
              <span className="text-text-secondary text-sm">41-60 days</span>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: "20%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total indicator */}
        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-text-secondary block text-xs">
                Average Age
              </span>
              <span className="text-lg font-medium">42 days</span>
            </div>
            <div className="border-primary-200 relative flex h-12 w-12 items-center justify-center rounded-full border-4">
              <div
                className="border-primary absolute inset-0 overflow-hidden rounded-full border-4"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                  clip: "rect(0px, 48px, 48px, 24px)",
                }}
              ></div>
              <span className="text-sm font-medium">42%</span>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-text-secondary mb-1 text-xs">
              New
              <br />
              (0-30 days)
            </div>
            <div className="text-lg font-medium">45%</div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-text-secondary mb-1 text-xs">
              Standard
              <br />
              (31-70 days)
            </div>
            <div className="text-lg font-medium">40%</div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-text-secondary mb-1 text-xs">
              Aging
              <br />
              (71-100 days)
            </div>
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
    <div className="rounded-xl bg-gray-50 p-6 pt-0">
      <h4 className="text-text-primary mb-5 font-medium">
        Brand Protection Controls
      </h4>

      <div className="space-y-5">
        {/* Pricing Floor */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-full">
              <svg
                className="text-primary h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-medium">Pricing Floor</h5>
              <p className="text-text-secondary text-xs">
                Protects your brand value in the market
              </p>
            </div>
          </div>

          <div className="mb-1 flex items-center justify-between">
            <span className="text-text-secondary text-xs">
              Minimum 10% of MSRP
            </span>
            <span className="text-primary text-xs font-medium">
              Strong Protection
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: "85%" }}
            ></div>
          </div>
        </div>

        {/* Geography */}
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div>
              <h5 className="text-sm font-medium">Approved Geography</h5>
              <p className="text-text-secondary text-xs">
                Limit sales to specific regions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="bg-primary-50 text-primary-700 inline-flex items-center rounded-md px-2.5 py-1 text-xs">
              <svg
                className="mr-1 h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              US Northeast
            </span>
            <span className="bg-primary-50 text-primary-700 inline-flex items-center rounded-md px-2.5 py-1 text-xs">
              <svg
                className="mr-1 h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              US Midwest
            </span>
            <span className="bg-primary-50 text-primary-700 inline-flex items-center rounded-md px-2.5 py-1 text-xs">
              <svg
                className="mr-1 h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              US South
            </span>
            <span className="bg-primary-50 text-primary-700 inline-flex items-center rounded-md px-2.5 py-1 text-xs">
              <svg
                className="mr-1 h-3 w-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              US West
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Your brand is protected
              </h3>
              <div className="mt-1 text-xs text-green-700">
                Your current settings provide strong brand protection across all
                channels
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
    <div className="rounded-xl bg-gray-50 p-6">
      <h4 className="text-text-primary mb-4 font-medium">
        Order Status Dashboard
      </h4>
      <div className="space-y-4">
        <div className="flex items-center rounded-lg bg-white p-3 shadow-sm">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-xs font-medium text-blue-600">PO</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Order #CC-2023-0542</span>
              <span className="text-xs font-medium text-blue-600">PO Sent</span>
            </div>
            <div className="text-text-secondary text-xs">
              $45,000 • 3 SKUs • Midwest Retailer
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-lg bg-white p-3 shadow-sm">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <span className="text-xs font-medium text-amber-600">$</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Order #CC-2023-0498</span>
              <span className="text-xs font-medium text-amber-600">
                Payment Due
              </span>
            </div>
            <div className="text-text-secondary text-xs">
              $78,250 • 5 SKUs • Discount Chain
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-lg bg-white p-3 shadow-sm">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <span className="text-xs font-medium text-purple-600">N</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Order #CC-2023-0511</span>
              <span className="text-xs font-medium text-purple-600">
                Negotiation
              </span>
            </div>
            <div className="text-text-secondary text-xs">
              $32,750 • 2 SKUs • Online Retailer
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-lg bg-white p-3 shadow-sm">
          <div className="bg-primary-100 mr-3 flex h-10 w-10 items-center justify-center rounded-full">
            <span className="text-primary text-xs font-medium">✓</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Order #CC-2023-0487</span>
              <span className="text-primary text-xs font-medium">Complete</span>
            </div>
            <div className="text-text-secondary text-xs">
              $103,500 • 8 SKUs • Wholesale Distributor
            </div>
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
    <div className="mt-[10%] rounded-xl p-6">
      <h4 className="text-text-primary mb-4 font-medium">
        Compliance Documentation
      </h4>
      <div className="space-y-4">
        <div className="flex items-center rounded-lg bg-white p-3">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">Buyer Identity</div>
            <div className="text-text-secondary text-xs">
              Business verification, tax ID, reseller permits
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-lg bg-white p-3">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">Resale Terms</div>
            <div className="text-text-secondary text-xs">
              Pricing, quantity, channel restrictions, geography
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-lg bg-white p-3">
          <div className="bg-primary-100 mr-3 flex h-10 w-10 items-center justify-center rounded-full">
            <svg
              className="text-primary h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium">Fulfillment Proof</div>
            <div className="text-text-secondary text-xs">
              Shipping confirmation, delivery receipts, chain of custody
            </div>
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
    <div className="rounded-xl bg-gray-50 p-6" style={{ marginTop: "14%" }}>
      <h4 className="text-text-primary mb-4 font-medium">
        Channel Distribution
      </h4>
      <div className="space-y-6">
        {/* D2C Channel */}
        <div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium">
              Direct-to-Consumer (D2C)
            </span>
            <span className="text-primary text-sm font-medium">
              Higher Margins
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: "35%" }}
              ></div>
            </div>
            <span className="text-xs font-medium">35%</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="bg-primary-100 text-primary rounded-full px-2 py-1 text-xs">
              Your Website
            </span>
            <span className="bg-primary-100 text-primary rounded-full px-2 py-1 text-xs">
              Marketplace
            </span>
            <span className="bg-primary-100 text-primary rounded-full px-2 py-1 text-xs">
              Flash Sales
            </span>
          </div>
        </div>
        {/* B2B Channel */}
        <div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium">
              Business-to-Business (B2B)
            </span>
            <span className="text-sm font-medium text-blue-600">
              Higher Volume
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-blue-600"
                style={{ width: "65%" }}
              ></div>
            </div>
            <span className="text-xs font-medium">65%</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
              Wholesalers
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
              Retailers
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
              Distributors
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
