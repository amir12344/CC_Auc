'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import {
  Lock,
  Eye,
  FileText,
  Users,
  ArrowRight,
  Star
} from 'lucide-react';

interface RestrictedContentPlaceholderProps {
  /** Type of restricted content */
  contentType?: 'manifest' | 'pricing' | 'seller_info' | 'bid_history' | 'custom';
  /** Custom title for the placeholder */
  title?: string;
  /** Custom description */
  description?: string;
  /** Custom icon */
  icon?: ReactNode;
  /** Show benefits list */
  showBenefits?: boolean;
  /** Custom benefits list */
  benefits?: string[];
  /** Show call-to-action button */
  showCTA?: boolean;
  /** Custom CTA text */
  ctaText?: string;
  /** CTA action */
  onCTAClick?: () => void;
  /** Additional styling */
  className?: string;
  /** Show social proof */
  showSocialProof?: boolean;
}

/**
 * RestrictedContentPlaceholder - Shows compelling preview for restricted content
 * 
 * Encourages user registration by showing what they're missing and the benefits
 * of signing up. Used in place of actual restricted content for guests.
 */
export function RestrictedContentPlaceholder({
  contentType = 'manifest',
  title,
  description,
  icon,
  showBenefits = true,
  benefits,
  showCTA = true,
  ctaText = 'Sign In to View',
  onCTAClick,
  className = '',
  showSocialProof = false
}: RestrictedContentPlaceholderProps) {

  /**
   * Get content-specific configuration
   */
  const getContentConfig = () => {
    switch (contentType) {
      case 'manifest':
        return {
          icon: <FileText className="h-8 w-8 text-blue-600" />,
          title: 'Complete Product Manifest',
          description: 'View detailed inventory breakdown with quantities, descriptions, and estimated values for every item in this lot.',
          benefits: [
            'Complete product list with ASIN/UPC codes',
            'Exact quantities and conditions for each item',
            'Estimated retail values and profit calculations',
            'Category breakdowns and sorting options'
          ]
        };
      case 'pricing':
        return {
          icon: <Star className="h-8 w-8 text-green-600" />,
          title: 'Detailed Pricing Information',
          description: 'Access wholesale pricing, cost breakdowns, and potential profit margins.',
          benefits: [
            'Wholesale pricing and bulk discounts',
            'Shipping cost calculations',
            'Profit margin analysis',
            'Historical pricing trends'
          ]
        };
      case 'seller_info':
        return {
          icon: <Users className="h-8 w-8 text-purple-600" />,
          title: 'Seller Details & Ratings',
          description: 'View complete seller profile, ratings, and transaction history.',
          benefits: [
            'Verified seller ratings and reviews',
            'Transaction history and reliability scores',
            'Return policies and guarantees',
            'Direct communication capabilities'
          ]
        };
      case 'bid_history':
        return {
          icon: <Eye className="h-8 w-8 text-orange-600" />,
          title: 'Bidding History & Analytics',
          description: 'See complete bid history, competitor analysis, and auction insights.',
          benefits: [
            'Complete bidding timeline and patterns',
            'Competitor activity analysis',
            'Price trend predictions',
            'Strategic bidding recommendations'
          ]
        };
      default:
        return {
          icon: <Lock className="h-8 w-8 text-gray-600" />,
          title: 'Premium Content',
          description: 'This content is available to registered members only.',
          benefits: [
            'Access to exclusive content',
            'Member-only features and tools',
            'Priority customer support',
            'Advanced analytics and insights'
          ]
        };
    }
  };

  const config = getContentConfig();
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIcon = icon || config.icon;
  const finalBenefits = benefits || config.benefits;

  return (
    <Card className={`border-2 border-dashed border-gray-300 bg-gray-50/50 ${className}`}>
      <CardContent className="p-8 text-center">
        {/* Icon and header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
            {finalIcon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {finalTitle}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
            {finalDescription}
          </p>
        </div>

        {/* Benefits list */}
        {showBenefits && finalBenefits && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              Members Get Access To:
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 max-w-sm mx-auto">
              {finalBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-left">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social proof */}
        {showSocialProof && (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Join 50,000+ buyers</strong> who get exclusive access to wholesale inventory and detailed product insights.
            </p>
          </div>
        )}

        {/* Call to action */}
        {showCTA && (
          <Button
            onClick={onCTAClick}
            className="h-10 rounded-full bg-black hover:bg-gray-800 text-white font-medium px-6"
          >
            {ctaText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Additional help text - only show if benefits are shown */}
        {showBenefits && (
          <p className="text-xs text-gray-500 mt-4">
            Free to join • No credit card required • Access thousands of products
          </p>
        )}
      </CardContent>
    </Card>
  );
} 