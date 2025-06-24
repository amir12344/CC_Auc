'use client';

import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';

interface GeographicRestrictionsProps {
  register: UseFormRegister<any>;
}

/**
 * Reusable geographic restrictions component
 * Used by both auction and catalog upload forms
 */
export const GeographicRestrictions: React.FC<GeographicRestrictionsProps> = ({
  register,
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium text-gray-900">
        Geographic Restrictions (optional)
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
          <Input
            {...register('geographicRestrictions.country')}
            id="country"
            placeholder="e.g., USA"
            className="h-12"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
          <Input
            {...register('geographicRestrictions.state')}
            id="state"
            placeholder="e.g., CA"
            className="h-12"
          />
        </div>
        <div>
          <Label htmlFor="zip" className="text-sm font-medium text-gray-700">Zip</Label>
          <Input
            {...register('geographicRestrictions.zip')}
            id="zip"
            placeholder="e.g., 90210"
            className="h-12"
          />
        </div>
        <div>
          <Label htmlFor="deliveryRegion" className="text-sm font-medium text-gray-700">Delivery Region</Label>
          <Input
            {...register('geographicRestrictions.deliveryRegion')}
            id="deliveryRegion"
            placeholder="e.g., West Coast"
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}; 