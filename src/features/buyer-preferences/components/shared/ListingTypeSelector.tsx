"use client";

import React, { useCallback, useMemo } from "react";

import { CheckCircle2, Gavel, ShoppingBag } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";

type ListingType = "AUCTION" | "CATALOG";

interface Props {
  selected: ListingType[];
  onChange: (next: ListingType[]) => void;
}

const OPTIONS: Array<{
  key: ListingType;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "AUCTION",
    title: "Auction-Based Sourcing",
    description: "Place bids on live lots, competing in time-bound auctions",
    Icon: Gavel,
  },
  {
    key: "CATALOG",
    title: "Offer-Based Sourcing",
    description: "Browse catalog listings and submit private offers",
    Icon: ShoppingBag,
  },
];

export const ListingTypeSelector = ({ selected, onChange }: Props) => {
  const isSelected = useCallback(
    (k: ListingType) => selected.includes(k),
    [selected]
  );

  const handleToggle = useCallback(
    (k: ListingType, checked: boolean) => {
      const next = checked ? [...selected, k] : selected.filter((t) => t !== k);
      onChange(next);
    },
    [selected, onChange]
  );

  const count = useMemo(() => selected.length, [selected]);

  return (
    <div className="space-y-3">
      {OPTIONS.map(({ key, title, description, Icon }) => (
        <div
          key={key}
          className={`flex items-start space-x-4 rounded-lg border p-4 transition-all duration-200 ${isSelected(key) ? "border-blue-300 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
        >
          <Checkbox
            checked={isSelected(key)}
            className="mt-1"
            id={`lt-${key}`}
            onCheckedChange={(c) => handleToggle(key, c as boolean)}
          />
          <Label
            className="flex-1 cursor-pointer text-base font-medium text-gray-900"
            htmlFor={`lt-${key}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
              {isSelected(key) && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div className="text-sm text-gray-600">{description}</div>
          </Label>
        </div>
      ))}
      {count > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Selected ({count}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((k) => (
              <Badge key={k} variant="secondary">
                {OPTIONS.find((o) => o.key === k)?.title ?? k}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingTypeSelector;
