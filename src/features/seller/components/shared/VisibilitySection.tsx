'use client';

import React from 'react';
import { UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Badge } from '@/src/components/ui/badge';
import { Eye } from 'lucide-react';

// Shared buyer targeting options
export const BUYER_TARGETING_OPTIONS = [
  'Discount Retail',
  'StockX',
  'Amazon or Walmart',
  'Live Seller Marketplaces (Whatnot, TikTok etc.)',
  'Reseller Marketplaces (Poshmark, Depop etc.)',
  'Off-Price Retail',
  'Exporter',
  'Refurbisher / Repair Shop',
] as const;

interface VisibilitySectionProps {
  title: string;
  description: string;
  visibilityType: 'public' | 'private';
  selectedBuyerTargeting: string[];
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  onBuyerTargetingChange: (option: string, checked: boolean) => void;
  getErrorMessage: (error: any) => string | undefined;
  children?: React.ReactNode;
}

/**
 * Reusable visibility section component for both auction and catalog forms
 * Handles public/private visibility settings and buyer targeting
 */
export const VisibilitySection: React.FC<VisibilitySectionProps> = ({
  title,
  description,
  visibilityType,
  selectedBuyerTargeting,
  errors,
  setValue,
  onBuyerTargetingChange,
  getErrorMessage,
  children,
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visibility Setting */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium text-gray-900">
              Visibility Setting *
            </Label>
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="public"
                checked={visibilityType === 'public'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('visibilityType', 'public');
                  }
                }}
              />
              <Label htmlFor="public" className="font-medium text-gray-900 cursor-pointer">
                Public (all buyers on Commerce Central can view)
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id="private"
                checked={visibilityType === 'private'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setValue('visibilityType', 'private');
                  }
                }}
              />
              <Label htmlFor="private" className="font-medium text-gray-900 cursor-pointer">
                Private (only visible to selected segments)
              </Label>
            </div>
          </div>

          {getErrorMessage(errors.visibilityType) && (
            <p className="text-sm text-red-600">{getErrorMessage(errors.visibilityType)}</p>
          )}
        </div>

        {/* Buyer Targeting (only show if Private is selected) */}
        {visibilityType === 'private' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <Label className="text-base font-medium text-gray-900">
              Buyer Targeting (for Private Listings)
            </Label>
            <p className="text-sm text-gray-600">
              Select which buyer segments can view this private listing
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BUYER_TARGETING_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-3 p-2 hover:bg-white rounded">
                  <Checkbox
                    id={`buyer-${option}`}
                    checked={selectedBuyerTargeting.includes(option)}
                    onCheckedChange={(checked) =>
                      onBuyerTargetingChange(option, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`buyer-${option}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>

            {selectedBuyerTargeting.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Selected segments:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBuyerTargeting.map((option) => (
                    <Badge key={option} variant="secondary" className="text-xs">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional content like GeographicRestrictions */}
        {children}
      </CardContent>
    </Card>
  );
}; 