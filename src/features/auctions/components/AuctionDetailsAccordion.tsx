'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import { Card } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { 
  Package, 
  Truck, 
  Info, 
  MapPin,
  Weight,
  Ruler,
  AlertTriangle,
  FileText,
  DollarSign
} from 'lucide-react';
import { Auction } from '../types';

interface AuctionDetailsAccordionProps {
  /** Auction data object */
  auction: Auction;
  /** Optional className for styling */
  className?: string;
  /** Default open sections */
  defaultOpenSections?: string[];
}

/**
 * AuctionDetailsAccordion Component
 * 
 * Displays detailed auction information in organized, collapsible sections.
 * Features:
 * - Details section with item specifications
 * - Shipping section with logistics information
 * - Clean key-value pair display
 * - Collapsible sections to save space
 * - Professional styling with icons
 * - Responsive design
 * 
 * @param auction - Auction data object
 * @param className - Optional styling
 * @param defaultOpenSections - Sections to open by default
 */
export const AuctionDetailsAccordion: React.FC<AuctionDetailsAccordionProps> = ({
  auction,
  className,
  defaultOpenSections = ['details']
}) => {
  /**
   * Render a key-value pair with proper formatting
   */
  const renderDetailItem = (key: string, value: string | number, icon?: React.ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-2">
      <div className="flex items-center gap-2 min-w-0 sm:min-w-[200px] font-medium text-sm">
        {icon}
        <span className="uppercase tracking-wide text-muted-foreground">
          {key}
        </span>
      </div>
      <div className="flex-1 text-sm">
        {typeof value === 'string' && value.length > 100 ? (
          <div className="space-y-2">
            <p>{value}</p>
          </div>
        ) : (
          <span>{value}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-8 shadow-sm ${className}`}>
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-2 bg-gray-50 rounded-lg">
          <FileText className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Additional Information</h3>
          <p className="text-gray-600 mt-1">Item details and shipping specifications</p>
        </div>
      </div>

      <Accordion 
        type="multiple" 
        defaultValue={defaultOpenSections}
        className="w-full space-y-6"
      >
        {/* Details Section */}
        <AccordionItem value="details" className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 w-full">
              <div className="p-3 bg-green-50 rounded-lg">
                <Package className="h-6 w-6" style={{ color: '#43CD66' }} />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-gray-900">Details & Specifications</span>
                <p className="text-gray-600 mt-1">Item condition, quantity, and requirements</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-50/50">
              <div className="divide-y divide-gray-200">
                {Object.entries(auction.details).map(([key, value], index) => (
                  <div key={key} className={`px-8 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-blue-50/30 transition-colors`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-1/3">
                        <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                          {key}
                        </h4>
                      </div>
                      <div className="sm:w-2/3">
                        <p className="text-gray-700 leading-relaxed">
                          {value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shipping Section */}
        <AccordionItem value="shipping" className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 w-full">
              <div className="p-3 bg-green-50 rounded-lg">
                <Truck className="h-6 w-6" style={{ color: '#43CD66' }} />
              </div>
              <div className="text-left">
                <span className="text-xl font-bold text-gray-900">Shipping & Logistics</span>
                <p className="text-gray-600 mt-1">Transportation and delivery information</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <div className="bg-gray-50/50">
              {/* Shipping Details Table */}
              <div className="divide-y divide-gray-200">
                {Object.entries(auction.shippingInfo).filter(([key]) => key !== 'SHIPPING NOTES').map(([key, value], index) => (
                  <div key={key} className={`px-8 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-indigo-50/30 transition-colors`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-1/3">
                        <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm">
                          {key}
                        </h4>
                      </div>
                      <div className="sm:w-2/3">
                        <p className="text-gray-700 leading-relaxed">
                          {value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Shipping Notes */}
              {auction.shippingInfo['SHIPPING NOTES'] && (
                                  <div className="border-t border-gray-200 bg-green-50 px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <Info className="h-5 w-5" style={{ color: '#43CD66' }} />
                      </div>
                                          <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm mb-3">
                          Shipping Notes
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {auction.shippingInfo['SHIPPING NOTES']}
                        </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Shipping Information Link */}
              <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-50 rounded-lg shadow-sm">
                    <Truck className="h-5 w-5" style={{ color: '#43CD66' }} />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">
                      Need more shipping details?
                    </p>
                    <a 
                      href="#" 
                      className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Navigate to shipping information page');
                      }}
                    >
                      Visit our Shipping Information Center →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

AuctionDetailsAccordion.displayName = 'AuctionDetailsAccordion'; 