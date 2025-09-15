"use client";

import React, { useCallback, useMemo } from "react";

import { CheckCircle2, Gavel, ShoppingBag } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";

import type { StepComponentProps } from "../../types/preferences";

// Types for better type safety
type ListingType = "auction" | "catalog";
type ListingTypeApiValue = "AUCTION" | "CATALOG";

// Type guard to check if a string is a valid ListingTypeApiValue
const isListingTypeApiValue = (value: string): value is ListingTypeApiValue => {
  return ["AUCTION", "CATALOG"].includes(value);
};

interface ListingOption {
  id: ListingType;
  key: ListingTypeApiValue;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

// Configuration for listing types
const LISTING_OPTIONS: ListingOption[] = [
  {
    id: "auction",
    key: "AUCTION",
    title: "Auction-Based Sourcing",
    description: " Place bids on live lots, competing in time-bound auctions",
    icon: Gavel,
    iconColor: "text-dark-600",
  },
  {
    id: "catalog",
    key: "CATALOG",
    title: "Offer-Based Sourcing",
    description:
      " Browse available catalog listings and submit a private offer on specific items",
    icon: ShoppingBag,
    iconColor: "text-dark-600",
  },
] as const;

// Extracted component for listing option
interface ListingOptionCardProps {
  option: ListingOption;
  isSelected: boolean;
  onToggle: (type: ListingType, checked: boolean) => void;
}

const ListingOptionCard = React.memo(
  ({ option, isSelected, onToggle }: ListingOptionCardProps) => {
    const { id, title, description, icon: Icon, iconColor } = option;

    const handleToggle = useCallback(
      (checked: boolean) => {
        onToggle(id, checked);
      },
      [id, onToggle]
    );

    return (
      <div
        className={`flex cursor-pointer items-start space-x-4 rounded-lg border p-4 transition-all duration-200 ${
          isSelected
            ? "border-blue-300 bg-blue-50 shadow-sm"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        } `}
      >
        <Checkbox
          checked={isSelected}
          className="mt-1"
          id={`${id}-type`}
          onCheckedChange={handleToggle}
        />
        <div className="flex-1">
          <Label
            className="flex cursor-pointer items-center gap-2 text-base font-medium text-gray-900"
            htmlFor={`${id}-type`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
            {isSelected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          </Label>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    );
  }
);

ListingOptionCard.displayName = "ListingOptionCard";

// Updated SelectionSummary component
interface SelectionSummaryProps {
  selectedTypes: ListingTypeApiValue[];
}

const SelectionSummary = React.memo(
  ({ selectedTypes }: SelectionSummaryProps) => {
    if (selectedTypes.length === 0) {
      return null;
    }

    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium text-gray-700">
            Your preferences ({selectedTypes.length} selected):
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map((typeKey) => {
            const option = LISTING_OPTIONS.find((opt) => opt.key === typeKey);
            if (!option) {
              return null;
            }

            const Icon = option.icon;
            return (
              <Badge
                className={
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                }
                key={option.id}
                variant="secondary"
              >
                <Icon className="h-3 w-3" />
                {option.title}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }
);

SelectionSummary.displayName = "SelectionSummary";

// Main component
export const AuctionCatalogStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  // Memoized values for performance
  const selectedApiValues = useMemo(
    () => (preferences.preferredTypes || []).filter(isListingTypeApiValue),
    [preferences.preferredTypes]
  );

  const isAuctionSelected = useMemo(
    () => selectedApiValues.includes("AUCTION"),
    [selectedApiValues]
  );

  const isCatalogSelected = useMemo(
    () => selectedApiValues.includes("CATALOG"),
    [selectedApiValues]
  );

  const hasSelections = useMemo(
    () => selectedApiValues.length > 0,
    [selectedApiValues.length]
  );

  // Optimized handlers with proper type casting
  const handleTypeToggle = useCallback(
    (typeId: ListingType, checked: boolean) => {
      const option = LISTING_OPTIONS.find((opt) => opt.id === typeId);
      if (!option) {
        return;
      }

      const apiKey = option.key;

      const currentApiValues = (preferences.preferredTypes || []).filter(
        isListingTypeApiValue
      );

      const newApiValues = checked
        ? [...currentApiValues, apiKey]
        : currentApiValues.filter((t) => t !== apiKey);

      updatePreferences({ preferredTypes: newApiValues });
    },
    [preferences.preferredTypes, updatePreferences]
  );

  return (
    <div className="space-y-6">
      {/* Listing type selections */}
      <div className="space-y-4">
        {LISTING_OPTIONS.map((option) => (
          <ListingOptionCard
            isSelected={
              option.id === "auction" ? isAuctionSelected : isCatalogSelected
            }
            key={option.id}
            onToggle={handleTypeToggle}
            option={option}
          />
        ))}
      </div>

      {/* Selection feedback */}
      <SelectionSummary selectedTypes={selectedApiValues} />
    </div>
  );
};
