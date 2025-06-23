'use client';

import React, { useCallback } from 'react';
import { StepComponentProps } from '../../types/preferences';
import { SELLING_PLATFORM_DETAILS } from '../../data/preferenceOptions';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export const WhereYouSellStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences
}) => {
  const handlePlatformToggle = useCallback((platform: string, checked: boolean) => {
    updatePreferences({
      sellingPlatforms: {
        ...preferences.sellingPlatforms,
        [platform]: checked
      }
    });
  }, [preferences.sellingPlatforms, updatePreferences]);

  const selectedPlatforms = Object.entries(preferences.sellingPlatforms)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  const platformCount = selectedPlatforms.length;

  return (
    <div className="space-y-6">
      {/* Platform Options */}
      <div className="space-y-3">
        {Object.keys(SELLING_PLATFORM_DETAILS).map((platformKey) => {
          const platform = SELLING_PLATFORM_DETAILS[platformKey as keyof typeof SELLING_PLATFORM_DETAILS];
          const isSelected = preferences.sellingPlatforms[platformKey as keyof typeof preferences.sellingPlatforms];
          
          return (
            <div 
              key={platformKey} 
              className={`
                flex items-center space-x-4 p-4 rounded-lg border transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              <Checkbox
                id={platformKey}
                checked={isSelected}
                onCheckedChange={(checked) => handlePlatformToggle(platformKey, checked as boolean)}
                className="flex-shrink-0"
              />
              <Label 
                htmlFor={platformKey} 
                className="flex-1 text-base font-medium text-gray-900 cursor-pointer"
              >
                {platform.title}
              </Label>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {platformCount > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Selected Platforms ({platformCount})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((platformKey) => {
              const platform = SELLING_PLATFORM_DETAILS[platformKey as keyof typeof SELLING_PLATFORM_DETAILS];
              return (
                <Badge 
                  key={platformKey}
                  className="bg-green-100 text-green-800 border border-green-300"
                >
                  {platform.title}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          {platformCount === 0 ? (
            <p>Select the platforms where you sell to help us recommend the most suitable inventory for your business model.</p>
          ) : (
            <p>Perfect! We'll prioritize inventory that works well with your selected selling channels.</p>
          )}
        </div>
      </div>
    </div>
  );
}; 