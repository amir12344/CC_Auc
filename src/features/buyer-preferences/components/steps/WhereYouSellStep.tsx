"use client";

import React, { useCallback } from "react";

import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";

import { SELLING_PLATFORM_DETAILS } from "../../data/preferenceOptions";
import type { StepComponentProps } from "../../types/preferences";

export const WhereYouSellStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  const handlePlatformToggle = useCallback(
    (platform: string, checked: boolean) => {
      updatePreferences({
        sellingPlatforms: {
          ...preferences.sellingPlatforms,
          [platform]: checked,
        },
      });
    },
    [preferences.sellingPlatforms, updatePreferences]
  );

  const selectedPlatforms = Object.entries(preferences.sellingPlatforms)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  const platformCount = selectedPlatforms.length;

  return (
    <div className="space-y-6">
      {/* Platform Options */}
      <div className="space-y-3">
        {Object.keys(SELLING_PLATFORM_DETAILS).map((platformKey) => {
          const platform =
            SELLING_PLATFORM_DETAILS[
              platformKey as keyof typeof SELLING_PLATFORM_DETAILS
            ];
          const isSelected =
            preferences.sellingPlatforms[
              platformKey as keyof typeof preferences.sellingPlatforms
            ];

          return (
            <div
              className={`flex items-center space-x-4 rounded-lg border p-4 transition-all duration-200 ${
                isSelected
                  ? "border-blue-200 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              } `}
              key={platformKey}
            >
              <Checkbox
                checked={isSelected}
                className="flex-shrink-0"
                id={platformKey}
                onCheckedChange={(checked) =>
                  handlePlatformToggle(platformKey, checked as boolean)
                }
              />
              <Label
                className="flex-1 cursor-pointer text-base font-medium text-gray-900"
                htmlFor={platformKey}
              >
                {platform.title}
              </Label>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {platformCount > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Selected Platforms ({platformCount})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((platformKey) => {
              const platform =
                SELLING_PLATFORM_DETAILS[
                  platformKey as keyof typeof SELLING_PLATFORM_DETAILS
                ];
              return (
                <Badge
                  className="border border-green-300 bg-green-100 text-green-800"
                  key={platformKey}
                >
                  {platform.title}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
