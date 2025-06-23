'use client';

import React from 'react';
import { StepComponentProps } from '../../types/preferences';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Label } from '@/src/components/ui/label';

export const OffPriceRetailStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences
}) => {
  const isSelected = preferences.sellingPlatforms.offPriceRetail;

  const handleToggle = (checked: boolean) => {
    updatePreferences({
      sellingPlatforms: {
        ...preferences.sellingPlatforms,
        offPriceRetail: checked
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 p-4 border rounded-lg">
        <Checkbox
          id="off-price-retail"
          checked={isSelected}
          onCheckedChange={handleToggle}
        />
        <Label htmlFor="off-price-retail" className="text-base font-medium">
          Yes, I sell to off-price retail stores
        </Label>
      </div>
    </div>
  );
}; 