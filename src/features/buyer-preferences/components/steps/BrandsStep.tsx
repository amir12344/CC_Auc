"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { useToast } from "@/src/hooks/use-toast";

import { useDebounce } from "../../hooks/useDebounce";
import { getAllBrands } from "../../services/buyerPreferenceService";
import type { Brand, StepComponentProps } from "../../types/preferences";

// Note: not using virtualization here to keep UX snappy like categories/regions

const BrandsStepComponent: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const PAGE_SIZE = 50;
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const brandsQuery = useInfiniteQuery({
    queryKey: ["brands", debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const data = await getAllBrands({
          search: debouncedSearch,
          skip: pageParam,
          take: PAGE_SIZE,
        });
        return data as Brand[];
      } catch (err) {
        setError(
          `Failed to fetch brands: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        toast({
          title: "Error",
          description: "Failed to load brands",
          variant: "destructive",
        });
        return [] as Brand[];
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === PAGE_SIZE ? pages.length * PAGE_SIZE : undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: true,
  });

  const displayedBrands = useMemo(
    () => (brandsQuery.data?.pages ?? []).flat(),
    [brandsQuery.data?.pages]
  );

  // Deduplicate by case-insensitive brand name for display
  const { uniqueList, nameToIds } = useMemo(() => {
    const nameToBrand = new Map<string, Brand>();
    const nameToIdsLocal = new Map<string, string[]>();
    for (const b of displayedBrands) {
      const key = b.brand_name.trim().toLowerCase();
      if (!nameToBrand.has(key)) {
        nameToBrand.set(key, b);
        nameToIdsLocal.set(key, [b.public_id]);
      } else {
        const arr = nameToIdsLocal.get(key)!;
        arr.push(b.public_id);
      }
    }
    return {
      uniqueList: Array.from(nameToBrand.values()),
      nameToIds: nameToIdsLocal,
    };
  }, [displayedBrands]);

  // Memoize selected brands set for O(1) lookup
  const selectedBrandsSet = useMemo(
    () => new Set(preferences.brands),
    [preferences.brands]
  );

  const brandMap = useMemo(() => {
    const items = (brandsQuery.data?.pages ?? []).flat();
    const map = new Map<string, string>();
    for (const b of items) {
      if (!map.has(b.public_id)) {
        map.set(b.public_id, b.brand_name);
      }
    }
    return map;
  }, [brandsQuery.data?.pages]);

  // Optimized brand toggle
  const handleBrandToggle = useCallback(
    (brandId: string) => {
      const newBrands = selectedBrandsSet.has(brandId)
        ? preferences.brands.filter((b) => b !== brandId)
        : [...preferences.brands, brandId];

      updatePreferences({ brands: newBrands });
    },
    [selectedBrandsSet, preferences.brands, updatePreferences]
  );

  const removeBrand = useCallback(
    (brandId: string) => {
      const newBrands = preferences.brands.filter((b) => b !== brandId);
      updatePreferences({ brands: newBrands });
    },
    [preferences.brands, updatePreferences]
  );

  const isNameSelected = useCallback(
    (brand: Brand) => {
      const key = brand.brand_name.trim().toLowerCase();
      const ids = nameToIds.get(key) || [];
      return ids.some((id) => selectedBrandsSet.has(id));
    },
    [nameToIds, selectedBrandsSet]
  );

  const toggleBrandByName = useCallback(
    (brand: Brand) => {
      const key = brand.brand_name.trim().toLowerCase();
      const ids = nameToIds.get(key) || [brand.public_id];
      const anySelected = ids.some((id) => selectedBrandsSet.has(id));
      let newBrands: string[];
      if (anySelected) {
        newBrands = preferences.brands.filter((id) => !ids.includes(id));
      } else {
        const firstId = ids[0];
        newBrands = [...preferences.brands, firstId];
      }
      updatePreferences({ brands: newBrands });
    },
    [nameToIds, selectedBrandsSet, preferences.brands, updatePreferences]
  );

  const handleEndReached = useCallback(() => {
    if (brandsQuery.hasNextPage && !brandsQuery.isFetchingNextPage) {
      void brandsQuery.fetchNextPage();
    }
  }, [brandsQuery]);

  // Memoize trigger button text for performance
  const triggerText = useMemo(() => {
    const count = preferences.brands.length;
    return count > 0 ? `${count} brands selected` : "Select brands...";
  }, [preferences.brands.length]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-12 w-full justify-between border-gray-300 text-left font-normal hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              variant="outline"
            >
              <span className="text-foreground truncate">{triggerText}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
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
                  className="h-9 pl-9"
                  placeholder="Search brands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div
              className="max-h-[300px] overflow-y-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {uniqueList.length === 0 && (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  {brandsQuery.isLoading
                    ? "Loading brands..."
                    : "No brands found."}
                </div>
              )}
              {uniqueList.map((brand) => {
                const checked = isNameSelected(brand);
                const id = `brand-${brand.brand_name.toLowerCase()}`;
                return (
                  <div
                    key={id}
                    className="flex items-center p-3 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={checked}
                      className="mr-3"
                      id={id}
                      onCheckedChange={() => toggleBrandByName(brand)}
                    />
                    <label
                      className="text-foreground/90 flex-1 cursor-pointer text-sm"
                      htmlFor={id}
                    >
                      {brand.brand_name}
                    </label>
                  </div>
                );
              })}
              {brandsQuery.hasNextPage && (
                <div className="text-muted-foreground border-t bg-gray-50 p-2 text-center text-sm">
                  <button
                    className="text-xs underline"
                    type="button"
                    onClick={() => brandsQuery.fetchNextPage()}
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Brands */}
      {preferences.brands.length > 0 && (
        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">
            Selected brands ({preferences.brands.length}):
          </p>
          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {preferences.brands.map((brandId) => (
              <Badge className="text-sm" key={brandId} variant="secondary">
                {brandMap.get(brandId) || brandId}
                <button
                  aria-label={`Remove ${brandMap.get(brandId) || brandId}`}
                  className="ring-offset-background focus:ring-ring ml-2 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                  onClick={() => removeBrand(brandId)}
                  type="button"
                >
                  <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const BrandsStep = React.memo(BrandsStepComponent);
