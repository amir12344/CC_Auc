'use client';

import React, { useCallback, useMemo } from 'react';
import { StepComponentProps } from '../../types/preferences';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import { Gavel, ShoppingBag, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

// Types for better type safety
type ListingType = 'auction' | 'catalog';

interface ListingOption {
  id: ListingType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

// Configuration for listing types
const LISTING_OPTIONS: ListingOption[] = [
  {
    id: 'auction',
    title: 'Auction-Based Sourcing',
    description: ' Place bids on live lots, competing in time-bound auctions',
    icon: Gavel,
    iconColor: 'text-dark-600',
  },
  {
    id: 'catalog',
    title: 'Offer-Based Sourcing',
    description: ' Browse available catalog listings and submit a private offer on specific items',
    icon: ShoppingBag,
    iconColor: 'text-dark-600',
  }
];

// Extracted component for listing option
interface ListingOptionCardProps {
  option: ListingOption;
  isSelected: boolean;
  onToggle: (type: ListingType, checked: boolean) => void;
}

const ListingOptionCard = React.memo(({ option, isSelected, onToggle }: ListingOptionCardProps) => {
  const { id, title, description, icon: Icon, iconColor } = option;

  const handleToggle = useCallback((checked: boolean) => {
    onToggle(id, checked);
  }, [id, onToggle]);

  return (
    <div className={`
      flex items-start space-x-4 p-4 border rounded-lg transition-all duration-200 cursor-pointer
      ${isSelected
        ? 'border-blue-300 bg-blue-50 shadow-sm'
        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }
    `}>
      <Checkbox
        id={`${id}-type`}
        checked={isSelected}
        onCheckedChange={handleToggle}
        className="mt-1"
      />
      <div className="flex-1">
        <Label
          htmlFor={`${id}-type`}
          className="text-base font-medium text-gray-900 cursor-pointer flex items-center gap-2"
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
          {isSelected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        </Label>
        <p className="text-sm text-gray-600 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
});

ListingOptionCard.displayName = 'ListingOptionCard';

// Extracted component for selection summary
interface SelectionSummaryProps {
  selectedTypes: ListingType[];
}

const SelectionSummary = React.memo(({ selectedTypes }: SelectionSummaryProps) => {
  if (selectedTypes.length === 0) return null;

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <p className="text-sm font-medium text-gray-700">
          Your preferences ({selectedTypes.length} selected):
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTypes.map((type) => {
          const option = LISTING_OPTIONS.find(opt => opt.id === type);
          if (!option) return null;

          const Icon = option.icon;
          return (
            <Badge
              key={type}
              variant="secondary"
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm`}
            >
              <Icon className="h-3 w-3" />
              {type === 'auction' ? 'Auctions' : 'Catalog'}
            </Badge>
          );
        })}
      </div>
    </div>
  );
});

SelectionSummary.displayName = 'SelectionSummary';

// Main component
export const AuctionCatalogStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences
}) => {
  // Memoized values for performance
  const selectedTypes = useMemo(() =>
    preferences.preferredTypes as ListingType[],
    [preferences.preferredTypes]
  );

  const isAuctionSelected = useMemo(() =>
    selectedTypes.includes('auction'),
    [selectedTypes]
  );

  const isCatalogSelected = useMemo(() =>
    selectedTypes.includes('catalog'),
    [selectedTypes]
  );

  const hasSelections = useMemo(() =>
    selectedTypes.length > 0,
    [selectedTypes.length]
  );

  // Optimized handlers with proper type casting
  const handleTypeToggle = useCallback((type: ListingType, checked: boolean) => {
    const newTypes: ('auction' | 'catalog')[] = checked
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type);

    updatePreferences({ preferredTypes: newTypes });
  }, [selectedTypes, updatePreferences]);

  // Helper text based on selection state
  const helperText = useMemo(() => {
    if (!hasSelections) {
      return "Choose the types of listings you're interested in. You can select both options to see all available inventory.";
    }

    if (selectedTypes.length === 2) {
      return "Perfect! You'll see both auction and catalog listings, giving you access to the full marketplace inventory.";
    }

    return `Great! We'll prioritize ${selectedTypes[0]} listings in your recommendations. You can change this anytime in your settings.`;
  }, [hasSelections, selectedTypes]);

  return (
    <div className="space-y-6">
      {/* Listing type selections */}
      <div className="space-y-4">
        {LISTING_OPTIONS.map((option) => (
          <ListingOptionCard
            key={option.id}
            option={option}
            isSelected={option.id === 'auction' ? isAuctionSelected : isCatalogSelected}
            onToggle={handleTypeToggle}
          />
        ))}
      </div>

      {/* Selection feedback */}
      <SelectionSummary selectedTypes={selectedTypes} />

      {/* Helper text */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold">i</span>
          </div>
          <p className="text-sm text-blue-800">
            {helperText}
          </p>
        </div>
      </div>
    </div>
  );
}; 