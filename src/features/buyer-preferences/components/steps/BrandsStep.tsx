'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { StepComponentProps } from '../../types/preferences';
import { BRAND_OPTIONS } from '../../data/preferenceOptions';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

const INITIAL_ITEMS = 15;
const ITEMS_PER_PAGE = 15;

const BrandsStepComponent: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences
}) => {
  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Memoize displayed brands for performance
  const displayedBrands = useMemo(() => {
    return BRAND_OPTIONS.slice(0, displayCount);
  }, [displayCount]);

  const hasMore = useMemo(() =>
    BRAND_OPTIONS.length > displayCount,
    [displayCount]
  );

  // Memoize selected brands set for O(1) lookup
  const selectedBrandsSet = useMemo(() =>
    new Set(preferences.brands),
    [preferences.brands]
  );

  // Optimized brand toggle
  const handleBrandToggle = useCallback((brand: string) => {
    const newBrands = selectedBrandsSet.has(brand)
      ? preferences.brands.filter(b => b !== brand)
      : [...preferences.brands, brand];

    updatePreferences({ brands: newBrands });
  }, [selectedBrandsSet, preferences.brands, updatePreferences]);

  const removeBrand = useCallback((brand: string) => {
    const newBrands = preferences.brands.filter(b => b !== brand);
    updatePreferences({ brands: newBrands });
  }, [preferences.brands, updatePreferences]);

  // Optimized scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 50;

    if (isNearBottom && hasMore) {
      setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, BRAND_OPTIONS.length));
    }
  }, [hasMore]);

  // Memoize trigger button text for performance
  const triggerText = useMemo(() => {
    const count = preferences.brands.length;
    return count > 0 ? `${count} brands selected` : 'Select brands...';
  }, [preferences.brands.length]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 text-left font-normal border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <span className="text-foreground truncate">
                {triggerText}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
            align="start"
            sideOffset={4}
          >
            <div
              ref={scrollElementRef}
              className="max-h-[300px] overflow-y-auto"
              onScroll={handleScroll}
            >
              {displayedBrands.length > 0 ? (
                <>
                  {displayedBrands.map((brand) => (
                    <DropdownMenuCheckboxItem
                      key={brand}
                      checked={selectedBrandsSet.has(brand)}
                      onCheckedChange={() => handleBrandToggle(brand)}
                      className="cursor-pointer"
                    >
                      {brand}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {hasMore && (
                    <div className="p-2 text-center text-sm text-muted-foreground border-t bg-gray-50">
                      Showing {displayedBrands.length} of {BRAND_OPTIONS.length} brands
                      <br />
                      <span className="text-xs">Scroll to load more</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No brands available
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selected Brands */}
      {preferences.brands.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Selected brands ({preferences.brands.length}):
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {preferences.brands.map((brand) => (
              <Badge
                key={brand}
                variant="secondary"
                className="text-sm"
              >
                {brand}
                <button
                  onClick={() => removeBrand(brand)}
                  className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  aria-label={`Remove ${brand}`}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="text-sm text-muted-foreground">
        {preferences.brands.length === 0 ? (
          <p>Select the brands you're most interested in purchasing from. You can choose multiple brands or skip this step.</p>
        ) : (
          <p>Great! We'll prioritize showing you inventory from these brands.</p>
        )}
      </div>
    </div>
  );
};

export const BrandsStep = React.memo(BrandsStepComponent); 