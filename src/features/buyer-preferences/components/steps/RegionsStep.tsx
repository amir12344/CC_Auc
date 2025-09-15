"use client";

import React, { useCallback, useMemo, useState } from "react";

import { ChevronDown, Search, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

import { REGIONS_OPTIONS } from "../../data/regions";
import type { StepComponentProps } from "../../types/preferences";

// REGIONS_OPTIONS moved to data/regions.ts

/**
 * RegionsStep component for selecting preferred US regions
 */
export const RegionsStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = useState("");

  const selectedRegions = useMemo(
    () => preferences.preferredRegions || [],
    [preferences.preferredRegions]
  );

  const handleRegionToggle = useCallback(
    (regionValue: string) => {
      const isSelected = selectedRegions.includes(regionValue);
      const newRegions = isSelected
        ? selectedRegions.filter((r) => r !== regionValue)
        : [...selectedRegions, regionValue];

      updatePreferences({ preferredRegions: newRegions });
    },
    [selectedRegions, updatePreferences]
  );

  const removeRegion = useCallback(
    (regionToRemove: string) => {
      const newRegions = selectedRegions.filter((r) => r !== regionToRemove);
      updatePreferences({ preferredRegions: newRegions });
    },
    [selectedRegions, updatePreferences]
  );

  const clearAllRegions = useCallback(() => {
    updatePreferences({ preferredRegions: [] });
  }, [updatePreferences]);

  const selectedText = useMemo(() => {
    const count = selectedRegions.length;
    if (count === 0) return "Select regions...";
    if (count === 1) {
      const region = REGIONS_OPTIONS.find(
        (opt) => opt.value === selectedRegions[0]
      );
      return region ? region.displayName : selectedRegions[0];
    }
    return `${count} regions selected`;
  }, [selectedRegions]);

  const filteredRegions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return REGIONS_OPTIONS;
    return REGIONS_OPTIONS.filter((r) =>
      r.displayName.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={open}
              className="h-12 w-full justify-between text-left font-normal"
              variant="outline"
            >
              <span className="truncate">{selectedText}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] p-0"
          >
            <div className="bg-background sticky top-0 z-10 border-b p-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="h-9 w-full pl-9"
                  placeholder="Search regions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div
              className="max-h-[300px] overflow-y-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {filteredRegions.map((region) => {
                const isSelected = selectedRegions.includes(region.value);
                const id = `region-${region.value}`;
                return (
                  <div
                    key={region.value}
                    className="flex items-center p-3 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-3"
                      id={id}
                      onCheckedChange={() => handleRegionToggle(region.value)}
                    />
                    <label
                      className="text-foreground/90 flex-1 cursor-pointer text-sm"
                      htmlFor={id}
                    >
                      {region.displayName}
                    </label>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {selectedRegions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-sm font-medium">
              Selected Regions ({selectedRegions.length})
            </h3>
            <Button
              className="h-8 text-xs"
              onClick={clearAllRegions}
              size="sm"
              variant="ghost"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((regionValue) => {
              const region = REGIONS_OPTIONS.find(
                (opt) => opt.value === regionValue
              );
              return (
                <Badge
                  className="text-sm"
                  key={regionValue}
                  variant="secondary"
                >
                  {region ? region.displayName : regionValue}
                  <Button
                    className="text-muted-foreground hover:text-foreground ml-1 h-auto p-0"
                    onClick={() => removeRegion(regionValue)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
