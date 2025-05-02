import Image from 'next/image';
import { ReactNode } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
  imagePath: string;
  imageAlt: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export const FeaturesSection = ({ features }: FeaturesSectionProps) => (
  <section id="features" className="w-full py-10 md:py-20 relative z-20 mt-0 bg-white">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold md:text-5xl font-bold text-[#1C1E21] mb-4">
        Recover More.<span className="text-[#43CD66] underline"> Risk Less. Reclaim Control </span>
      </h2>
    </div>
    {/* Feature 1: Act Before Inventory Becomes a Liability */}
    <div className="relative mb-32">
      {/* Background decoration */}
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#43CD66]/5 rounded-full blur-[80px] -z-10"></div>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Content */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1E21] mb-4 md:mb-6">{features[0].title}</h2>
            <p className="text-lg text-[#1C1E21]/80 mb-8 leading-relaxed">{features[0].description}</p>
            {/* Custom visualization for inventory age */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h4 className="font-medium mb-4 text-[#1C1E21]">Inventory Age Distribution</h4>
              <div className="flex items-end h-32 gap-3">
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#43CD66]/80 rounded-t-md h-[20%]"></div>
                  <span className="text-xs mt-2 text-[#1C1E21]/70">0-60 days</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#43CD66]/70 rounded-t-md h-[40%]"></div>
                  <span className="text-xs mt-2 text-[#1C1E21]/70">61-100 days</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#43CD66]/60 rounded-t-md h-[60%]"></div>
                  <span className="text-xs mt-2 text-[#1C1E21]/70">101-180 days</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#43CD66]/50 rounded-t-md h-[80%]"></div>
                  <span className="text-xs mt-2 text-[#1C1E21]/70">181-270 days</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#43CD66]/40 rounded-t-md h-[100%]"></div>
                  <span className="text-xs mt-2 text-[#1C1E21]/70">270+ days</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right side: Image */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#43CD66]/5 to-transparent z-0"></div>
              <Image
                src={features[0].imagePath}
                alt={features[0].imageAlt}
                width={650}
                height={400}
                quality={65}
                loading='lazy'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className="w-full relative z-10"
              />
              {/* Floating stats card */}
              <div className="absolute bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="text-sm font-medium text-[#1C1E21]">Inventory Value at Risk</div>
                <div className="text-2xl font-bold text-[#43CD66]">$1.2M</div>
                <div className="text-xs text-[#1C1E21]/60">Across 3 warehouses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Feature 2: Protect Brand, Pricing, and Channels */}
    <div className="relative py-16 bg-gray-50 mb-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#43CD66]/5 to-transparent z-0"></div>
              <Image
                src={features[1].imagePath}
                alt={features[1].imageAlt}
                width={650}
                height={400}
                quality={65}
                loading='lazy'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className="w-full relative z-10"
              />
              {/* Floating controls card */}
              <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="text-sm font-medium text-[#1C1E21] mb-2">Guardrails Active</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">Pricing Floor: 10% of MSRP</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">Buyer Types: Verified Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">Geography: US, Canada</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right side: Content */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1E21] mb-4 md:mb-6">{features[1].title}</h2>
            <p className="text-lg text-[#1C1E21]/80 mb-8 leading-relaxed">{features[1].description}</p>
            {/* Custom visualization for guardrails */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h4 className="font-medium mb-4 text-[#1C1E21]">Brand Protection Controls</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#1C1E21]/70">Pricing Floor</span>
                    <span className="text-sm font-medium">10%+ of MSRP</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#43CD66] rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-[#1C1E21]/70 w-full mb-1">Approved Buyer Types</span>
                  <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">Amazon Seller</span>
                  <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">Discount Stores</span>
                  <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">Wholesaler</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-400 text-xs rounded-full">Liquidator</span>
                </div>
                <div>
                  <span className="text-sm text-[#1C1E21]/70 block mb-1">Geography</span>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">US Northeast</span>
                    <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">US Midwest</span>
                    <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">US South</span>
                    <span className="px-3 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">US West</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Feature 3: Run Resale on Autopilot */}
    <div className="relative mb-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Content */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1E21] mb-4 md:mb-6">{features[2].title}</h2>
            <p className="text-lg text-[#1C1E21]/80 mb-8 leading-relaxed">{features[2].description}</p>
            {/* Custom visualization for order statuses */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h4 className="font-medium mb-4 text-[#1C1E21]">Order Status Dashboard</h4>
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
                    <div className="text-xs text-[#1C1E21]/60">$45,000 • 3 SKUs • Midwest Retailer</div>
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
                    <div className="text-xs text-[#1C1E21]/60">$78,250 • 5 SKUs • Discount Chain</div>
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
                    <div className="text-xs text-[#1C1E21]/60">$32,750 • 2 SKUs • Online Retailer</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#43CD66]/20 flex items-center justify-center mr-3">
                    <span className="text-[#43CD66] text-xs font-medium">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Order #CC-2023-0487</span>
                      <span className="text-xs text-[#43CD66] font-medium">Complete</span>
                    </div>
                    <div className="text-xs text-[#1C1E21]/60">$103,500 • 8 SKUs • Wholesale Distributor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right side: Image */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#43CD66]/5 to-transparent z-0"></div>
              <Image
                src={features[2].imagePath}
                alt={features[2].imageAlt}
                width={650}
                height={400}
                quality={65}
                loading='lazy'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className="w-full relative z-10"
              />
              {/* Floating automation card */}
              <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="text-sm font-medium text-[#1C1E21] mb-2">Automation Status</div>
                <div className="flex items-center gap-2 text-[#43CD66]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Feature 4: Always Audit-Ready */}
    <div className="relative py-16 bg-gray-50 mb-32">
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#43CD66]/5 rounded-full blur-[80px] -z-10"></div>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#43CD66]/5 to-transparent z-0"></div>
              <Image
                src={features[3].imagePath}
                alt={features[3].imageAlt}
                width={650}
                height={400}
                quality={65}
                loading='lazy'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className="w-full relative z-10"
              />
              {/* Floating document card */}
              <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="text-sm font-medium text-[#1C1E21] mb-2">Audit Documentation</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">Buyer Identity Verified</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">Resale Terms Documented</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">Fulfillment Proof Secured</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right side: Content */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1E21] mb-4 md:mb-6">{features[3].title}</h2>
            <p className="text-lg text-[#1C1E21]/80 mb-8 leading-relaxed">{features[3].description}</p>
            {/* Custom visualization for audit documentation */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h4 className="font-medium mb-4 text-[#1C1E21]">Compliance Documentation</h4>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Buyer Identity</div>
                    <div className="text-xs text-[#1C1E21]/60">Business verification, tax ID, reseller permits</div>
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
                    <div className="text-xs text-[#1C1E21]/60">Pricing, quantity, channel restrictions, geography</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#43CD66]/20 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-[#43CD66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Fulfillment Proof</div>
                    <div className="text-xs text-[#1C1E21]/60">Shipping confirmation, delivery receipts, chain of custody</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Feature 5: Monetize Across Channels Without Conflict */}
    <div className="relative mb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side: Content */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1E21] mb-4 md:mb-6">{features[4].title}</h2>
            <p className="text-lg text-[#1C1E21]/80 mb-8 leading-relaxed">{features[4].description}</p>
            {/* Custom visualization for channel distribution */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h4 className="font-medium mb-4 text-[#1C1E21]">Channel Distribution</h4>
              <div className="space-y-6">
                {/* D2C Channel */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Direct-to-Consumer (D2C)</span>
                    <span className="text-sm text-[#43CD66] font-medium">Higher Margins</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-[#43CD66] h-2.5 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    <span className="text-xs font-medium">35%</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">Your Website</span>
                    <span className="px-2 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">Marketplace</span>
                    <span className="px-2 py-1 bg-[#43CD66]/10 text-[#43CD66] text-xs rounded-full">Flash Sales</span>
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
          {/* Right side: Image */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-[#43CD66]/5 to-transparent z-0"></div>
              <Image
                src={features[4].imagePath}
                alt={features[4].imageAlt}
                width={650}
                height={400}
                quality={65}
                loading='lazy'
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className="w-full relative z-10"
              />
              {/* Floating channel card */}
              <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 z-20">
                <div className="text-sm font-medium text-[#1C1E21] mb-2">Channel Performance</div>
                <div className="flex items-center gap-2 text-[#43CD66]">
                  <div className="w-2 h-2 rounded-full bg-[#43CD66]"></div>
                  <span className="text-xs">D2C: +28% margin</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span className="text-xs">B2B: 3.5x volume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
