"use client";

import { ReactNode } from "react";

import { ArrowRight, Eye, FileText, Lock, Star, Users } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

interface RestrictedContentPlaceholderProps {
  /** Type of restricted content */
  contentType?:
    | "manifest"
    | "pricing"
    | "seller_info"
    | "bid_history"
    | "custom";
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
  contentType = "manifest",
  title,
  description,
  icon,
  showBenefits = true,
  benefits,
  showCTA = true,
  ctaText = "Sign In to View",
  onCTAClick,
  className = "",
  showSocialProof = false,
}: RestrictedContentPlaceholderProps) {
  /**
   * Get content-specific configuration
   */
  const getContentConfig = () => {
    switch (contentType) {
      case "manifest":
        return {
          icon: <FileText className="h-8 w-8 text-blue-600" />,
          title: "Complete Product Manifest",
          description:
            "View detailed inventory breakdown with quantities, descriptions, and estimated values for every item in this lot.",
          benefits: [
            "Complete product list with ASIN/UPC codes",
            "Exact quantities and conditions for each item",
            "Estimated retail values and profit calculations",
            "Category breakdowns and sorting options",
          ],
        };
      case "pricing":
        return {
          icon: <Star className="h-8 w-8 text-green-600" />,
          title: "Detailed Pricing Information",
          description:
            "Access wholesale pricing, cost breakdowns, and potential profit margins.",
          benefits: [
            "Wholesale pricing and bulk discounts",
            "Shipping cost calculations",
            "Profit margin analysis",
            "Historical pricing trends",
          ],
        };
      case "seller_info":
        return {
          icon: <Users className="h-8 w-8 text-purple-600" />,
          title: "Seller Details & Ratings",
          description:
            "View complete seller profile, ratings, and transaction history.",
          benefits: [
            "Verified seller ratings and reviews",
            "Transaction history and reliability scores",
            "Return policies and guarantees",
            "Direct communication capabilities",
          ],
        };
      case "bid_history":
        return {
          icon: <Eye className="h-8 w-8 text-orange-600" />,
          title: "Bidding History & Analytics",
          description:
            "See complete bid history, competitor analysis, and auction insights.",
          benefits: [
            "Complete bidding timeline and patterns",
            "Competitor activity analysis",
            "Price trend predictions",
            "Strategic bidding recommendations",
          ],
        };
      default:
        return {
          icon: <Lock className="h-8 w-8 text-gray-600" />,
          title: "Premium Content",
          description: "This content is available to registered members only.",
          benefits: [
            "Access to exclusive content",
            "Member-only features and tools",
            "Priority customer support",
            "Advanced analytics and insights",
          ],
        };
    }
  };

  const config = getContentConfig();
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalIcon = icon || config.icon;
  const finalBenefits = benefits || config.benefits;

  return (
    <Card
      className={`border-2 border-dashed border-gray-300 bg-gray-50/50 ${className}`}
    >
      <CardContent className="p-8 text-center">
        {/* Icon and header */}
        <div className="mb-6">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            {finalIcon}
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            {finalTitle}
          </h3>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-600">
            {finalDescription}
          </p>
        </div>

        {/* Benefits list */}
        {showBenefits && finalBenefits && (
          <div className="mb-6">
            <h4 className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-900">
              <Lock className="h-4 w-4 text-blue-600" />
              Members Get Access To:
            </h4>
            <ul className="mx-auto max-w-sm space-y-2 text-sm text-gray-700">
              {finalBenefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-left">
                  <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Social proof */}
        {showSocialProof && (
          <div className="mb-6 rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Join 50,000+ buyers</strong> who get exclusive access to
              wholesale inventory and detailed product insights.
            </p>
          </div>
        )}

        {/* Call to action */}
        {showCTA && (
          <Button
            onClick={onCTAClick}
            className="h-10 rounded-full bg-black px-6 font-medium text-white hover:bg-gray-800"
          >
            {ctaText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Additional help text - only show if benefits are shown */}
        {showBenefits && (
          <p className="mt-4 text-xs text-gray-500">
            Free to join • No credit card required • Access thousands of
            products
          </p>
        )}
      </CardContent>
    </Card>
  );
}
