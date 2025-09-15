"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronDown,
  DollarSign,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import BudgetInputShared from "@/src/features/buyer-preferences/components/shared/BudgetInput";
import { CascadingCategorySelector } from "@/src/features/buyer-preferences/components/shared/CascadingCategorySelector";
import ListingTypeSelector from "@/src/features/buyer-preferences/components/shared/ListingTypeSelector";
import MultiSelectDropdown from "@/src/features/buyer-preferences/components/shared/MultiSelectDropdown";
import {
  DEFAULT_PREFERENCES,
  SELLING_PLATFORM_DETAILS,
} from "@/src/features/buyer-preferences/data/preferenceOptions";
import { REGIONS_OPTIONS } from "@/src/features/buyer-preferences/data/regions";
import {
  getAllBrands,
  getBuyerPreferences as getBuyerPreferencesSvc,
  setBuyerPreferences,
  transformLocalPreferencesToApiFormat,
} from "@/src/features/buyer-preferences/services/buyerPreferenceService";
import {
  clearBuyerPreferences,
  setBuyerPreferences as setBuyerPreferencesAction,
} from "@/src/features/buyer-preferences/store/buyerPreferencesSlice";
import type {
  Brand,
  BuyerPreferences,
  GetBuyerPreferenceApiRequest,
  LocalBuyerPreferences,
} from "@/src/features/buyer-preferences/types/preferences";
import { clearPreferenceListings } from "@/src/features/marketplace-catalog/store/preferenceListingsSlice";
import { useToast } from "@/src/hooks/use-toast";
import { useAppDispatch } from "@/src/lib/store";

// Removed local multi-select; using shared MultiSelectDropdown

// Use shared category selector inlined via wrapper
const CascadingCategoryDropdown = ({
  preferences,
  updatePreferences,
  isLoading = false,
}: {
  preferences: BuyerPreferences;
  updatePreferences: (u: Partial<BuyerPreferences>) => void;
  isLoading?: boolean;
}) => (
  <CascadingCategorySelector
    isLoading={isLoading}
    selectedCategories={preferences.categories}
    selectedSubcategories={preferences.subcategories}
    onChange={(u: Partial<BuyerPreferences>) => updatePreferences(u)}
  />
);

// Extracted component for budget inputs
interface BudgetInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  min?: number;
  max?: number;
}

const BudgetInput = ({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
  max,
}: BudgetInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "") {
        onChange(null);
      } else {
        const numValue = Number.parseFloat(inputValue);
        if (
          !Number.isNaN(numValue) &&
          numValue >= min &&
          (!max || numValue <= max)
        ) {
          onChange(numValue);
        }
      }
    },
    [onChange, min, max]
  );

  return (
    <div className="relative">
      <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
      <Input
        aria-label={label}
        className="h-12 pl-10"
        max={max}
        min={min}
        onChange={handleChange}
        placeholder={placeholder}
        step="0.01"
        type="number"
        value={value ?? ""}
      />
    </div>
  );
};

// Extracted component for listing type preference
interface ListingTypePreferenceProps {
  id: string;
  type: "AUCTION" | "CATALOG";
  title: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const ListingTypePreference = ({
  id,
  title,
  description,
  checked,
  onToggle,
}: Omit<ListingTypePreferenceProps, "type">) => {
  const handleToggle = useCallback(
    (checkedValue: boolean) => {
      onToggle(checkedValue);
    },
    [onToggle]
  );

  return (
    <div className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
      <Checkbox checked={checked} id={id} onCheckedChange={handleToggle} />
      <Label
        className="flex-1 cursor-pointer font-medium text-gray-900"
        htmlFor={id}
      >
        <div className="font-medium">{title}</div>
        <div className="text-sm font-normal text-gray-600">{description}</div>
      </Label>
    </div>
  );
};

// Main component
export default function PreferencesPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandPage, setBrandPage] = useState(0);
  const [brandHasMore, setBrandHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] =
    useState<BuyerPreferences>(DEFAULT_PREFERENCES);
  const BRANDS_PAGE_SIZE = 100;

  // Helper function to get minimum discount display
  const getMinimumDiscountDisplay = useCallback(
    (percentage: number | undefined) => {
      if (!percentage) {
        return "no-preference";
      }
      return percentage > 0 ? `${percentage}%` : "no-preference";
    },
    []
  );

  // Helper function to build selling platforms
  const buildSellingPlatforms = useCallback((segments: string[] = []) => {
    return {
      discountRetail: segments.includes("DISCOUNT_RETAIL"),
      stockX: segments.includes("STOCKX"),
      amazonWalmart: segments.includes("AMAZON_OR_WALMART"),
      liveMarketplaces: segments.includes("LIVE_SELLER_MARKETPLACES"),
      resellerMarketplaces: segments.includes("RESELLER_MARKETPLACES"),
      offPriceRetail: segments.includes("OFF_PRICE_RETAIL"),
      export: segments.includes("EXPORTER"),
      refurbisher: segments.includes("REFURBISHER_REPAIR_SHOP"),
    };
  }, []);

  // Helper function to transform API preferences to local format
  const transformApiPreferencesToLocal = useCallback(
    (apiPrefs: GetBuyerPreferenceApiRequest) => {
      return {
        brands: apiPrefs.preferredBrandIds || [], // Now using brand preferences from API response
        categories: apiPrefs.preferredCategories || [],
        subcategories: apiPrefs.preferredSubcategories || [],
        minBudget: apiPrefs.budgetMin ?? null,
        maxBudget: apiPrefs.budgetMax ?? null,
        minimumDiscount: getMinimumDiscountDisplay(
          apiPrefs.minimumDiscountPercentage
        ),
        preferredTypes: apiPrefs.listingTypePreferences || [],
        conditions: [], // Will be added when available in API
        sellingPlatforms: buildSellingPlatforms(apiPrefs.buyerSegments),
        preferredRegions: apiPrefs.preferredRegions || [],
        isCompleted: true,
        completedAt: new Date(),
      };
    },
    [getMinimumDiscountDisplay, buildSellingPlatforms]
  );

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch preferences via service (reliable on client)
        const preferencesData = await getBuyerPreferencesSvc();
        if (preferencesData && preferencesData.length > 0) {
          const local = transformApiPreferencesToLocal(preferencesData[0]);
          setPreferences(local);
          if (local.brands?.length) {
            const names = await getAllBrands({
              ids: local.brands,
              skip: 0,
              take: local.brands.length,
            });
            setAllBrands((prev) => {
              const map = new Map(prev.map((b) => [b.public_id, b]));
              names.forEach((b) => map.set(b.public_id, b));
              return Array.from(map.values());
            });
          }
        }

        // Always load the first page of brands via service (avoids server route issues)
        setBrandsLoading(true);
        try {
          const arr = await getAllBrands({
            search: "",
            skip: 0,
            take: BRANDS_PAGE_SIZE,
          });
          setAllBrands(arr);
          setBrandHasMore(arr.length === BRANDS_PAGE_SIZE);
          setBrandPage(0);
        } finally {
          setBrandsLoading(false);
        }
      } catch {
        toast({
          title: "Error loading preferences",
          description: "Failed to load preferences. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast, transformApiPreferencesToLocal]);

  const brandOptions = useMemo(
    () => allBrands.map((b) => ({ value: b.public_id, label: b.brand_name })),
    [allBrands]
  );

  const regionsOptions = useMemo(
    () =>
      REGIONS_OPTIONS.map((region) => ({
        value: region.value,
        label: region.displayName,
      })),
    []
  );

  // Handler functions
  const updatePreferences = useCallback(
    (updates: Partial<BuyerPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const toggleBrand = useCallback((brand: string) => {
    setPreferences((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }, []);

  // const toggleCondition = useCallback((condition: string) => {
  //   setPreferences((prev) => ({
  //     ...prev,
  //     conditions: prev.conditions.includes(condition)
  //       ? prev.conditions.filter((c) => c !== condition)
  //       : [...prev.conditions, condition],
  //   }));
  // }, []);

  const toggleRegion = useCallback((region: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredRegions: prev.preferredRegions.includes(region)
        ? prev.preferredRegions.filter((r) => r !== region)
        : [...prev.preferredRegions, region],
    }));
  }, []);

  const updateSellingPlatform = useCallback(
    (platform: keyof BuyerPreferences["sellingPlatforms"], value: boolean) => {
      setPreferences((prev) => ({
        ...prev,
        sellingPlatforms: {
          ...prev.sellingPlatforms,
          [platform]: value,
        },
      }));
    },
    []
  );

  const getSelectedSellingPlatforms = useCallback(() => {
    return Object.entries(preferences.sellingPlatforms)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);
  }, [preferences.sellingPlatforms]);

  // Memoized computations for performance
  const selectedPlatformsCount = useMemo(() => {
    return getSelectedSellingPlatforms().length;
  }, [getSelectedSellingPlatforms]);

  const dispatch = useAppDispatch();

  // Optimized handlers
  const handleSavePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      // Transform preferences to API format - convert completedAt from Date | null to Date | undefined
      const localPrefs: LocalBuyerPreferences = {
        categories: preferences.categories,
        subcategories: preferences.subcategories,
        minBudget: preferences.minBudget,
        maxBudget: preferences.maxBudget,
        minimumDiscount: preferences.minimumDiscount,
        preferredTypes: preferences.preferredTypes,
        sellingPlatforms: preferences.sellingPlatforms,
        brands: preferences.brands,
        isCompleted: preferences.isCompleted,
        completedAt: preferences.completedAt || undefined,
        conditions: preferences.conditions,
        preferredRegions: preferences.preferredRegions,
      };
      const apiPreferences = transformLocalPreferencesToApiFormat(localPrefs);
      const response = await setBuyerPreferences(apiPreferences);

      if (!response.success) {
        throw new Error(response.message || "Failed to save preferences");
      }

      // Update Redux state with normalized "get" shape
      dispatch(
        setBuyerPreferencesAction({
          preferredCategories: apiPreferences.preferredCategories,
          preferredSubcategories: apiPreferences.preferredSubcategories,
          budgetMin: apiPreferences.budgetMin ?? null,
          budgetMax: apiPreferences.budgetMax ?? null,
          budgetCurrency: apiPreferences.budgetCurrency,
          minimumDiscountPercentage:
            apiPreferences.minimumDiscountPercentage ?? 0,
          listingTypePreferences: apiPreferences.listingTypePreferences,
          buyerSegments: apiPreferences.buyerSegments,
          preferredRegions: apiPreferences.preferredRegions,
          preferredBrandIds: apiPreferences.preferredBrandIds,
        })
      );

      // Clear cached preference listings to force refresh on marketplace page
      dispatch(clearPreferenceListings());

      toast({
        title: "Preferences saved successfully!",
        description: "Your marketplace preferences have been updated.",
        duration: 3000,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast({
        title: "Error saving preferences",
        description: `Please try again later. ${errorMessage}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences, toast, dispatch]);

  const handleResetPreferences = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to reset all preferences? This action cannot be undone."
    );

    if (confirmed) {
      try {
        setPreferences(DEFAULT_PREFERENCES);

        // Clear Redux state for preferences and listings
        dispatch(clearBuyerPreferences());
        dispatch(clearPreferenceListings());

        toast({
          title: "Preferences reset",
          description: "All preferences have been cleared.",
          duration: 3000,
        });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        toast({
          title: "Error resetting preferences",
          description: `Please try again later. ${errorMessage}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [toast, dispatch]);

  const handleListingTypeToggle = useCallback(
    (type: "AUCTION" | "CATALOG", checked: boolean) => {
      const newTypes = checked
        ? [...preferences.preferredTypes, type]
        : preferences.preferredTypes.filter((t) => t !== type);
      updatePreferences({ preferredTypes: newTypes });
    },
    [preferences.preferredTypes, updatePreferences]
  );

  const handleBudgetChange = useCallback(
    (field: "minBudget" | "maxBudget", value: number | null) => {
      updatePreferences({ [field]: value });
    },
    [updatePreferences]
  );

  if (isLoading) {
    return (
      <div className="max-w-8xl mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
          <div className="h-48 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              Preferences
            </h1>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {preferences.isCompleted && (
                <Button
                  className="w-full border-green-200 bg-green-50 text-green-600 hover:bg-green-100 sm:w-auto"
                  size="sm"
                  variant="outline"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Preferences saved
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-sm lg:text-base">
            Make updates to your preferences here, which help power the best
            recommendations suited just for you.
          </p>
        </div>

        {/* Main Content */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3 lg:mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <svg
                  aria-labelledby="preferencesIconTitle"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  role="img"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title id="preferencesIconTitle">Preferences Icon</title>
                  <path
                    d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Shopping Preferences
                </h3>
                <p className="text-sm text-gray-500">
                  Customize your marketplace experience
                </p>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8">
              {/* Selling Platforms */}
              <div className="space-y-4">
                <Label className="text-md font-medium text-gray-900">
                  Where do you sell?
                </Label>
                <p className="text-sm text-gray-600">
                  Select the platforms where you sell to get more relevant
                  inventory recommendations.
                </p>

                <div className="space-y-3">
                  {Object.entries(SELLING_PLATFORM_DETAILS).map(
                    ([key, platform]) => (
                      <div
                        className="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                        key={key}
                      >
                        <Checkbox
                          checked={
                            preferences.sellingPlatforms[
                              key as keyof typeof preferences.sellingPlatforms
                            ]
                          }
                          className="mt-1"
                          id={`platform-${key}`}
                          onCheckedChange={(checked) =>
                            updateSellingPlatform(
                              key as keyof typeof preferences.sellingPlatforms,
                              checked as boolean
                            )
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <Label
                            className="block cursor-pointer text-sm font-medium text-gray-900"
                            htmlFor={`platform-${key}`}
                          >
                            {platform.title}
                          </Label>
                          <p className="mt-1 text-xs text-gray-600">
                            {platform.description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {selectedPlatformsCount > 0 && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Selected platforms ({selectedPlatformsCount}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedSellingPlatforms().map((platform) => (
                        <Badge
                          className="text-xs"
                          key={platform}
                          variant="secondary"
                        >
                          {SELLING_PLATFORM_DETAILS[
                            platform as keyof typeof SELLING_PLATFORM_DETAILS
                          ]?.title || platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Preferred Regions */}
              <MultiSelectDropdown
                isLoading={isLoading}
                label="Where do you source from? (Regions)"
                onToggle={toggleRegion}
                options={regionsOptions}
                placeholder="Select regions..."
                selectedItems={preferences.preferredRegions}
              />

              {/* Categories & Subcategories */}
              <CascadingCategoryDropdown
                isLoading={isLoading}
                preferences={preferences}
                updatePreferences={updatePreferences}
              />

              {/* Brands */}
              <div className="space-y-3">
                <Label className="text-md font-medium text-gray-900">
                  What brands do you prefer?
                </Label>
                {(() => {
                  // helper values built outside render list
                  const selectedCount = preferences.brands.length;
                  const triggerText =
                    selectedCount > 0
                      ? `${selectedCount} brands selected`
                      : "Select brands...";
                  const filtered = brandOptions.filter(
                    (b) =>
                      !brandSearch ||
                      b.label.toLowerCase().includes(brandSearch.toLowerCase())
                  );
                  const seen = new Set<string>();
                  const unique = filtered.filter((o) => {
                    const key = o.label.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                  });
                  const loadMoreBrands = async () => {
                    if (!brandHasMore || brandsLoading) return;
                    setBrandsLoading(true);
                    try {
                      const nextPage = brandPage + 1;
                      const next = await getAllBrands({
                        search: brandSearch,
                        skip: nextPage * BRANDS_PAGE_SIZE,
                        take: BRANDS_PAGE_SIZE,
                      });
                      if (next.length) {
                        setAllBrands((prev) => [...prev, ...next]);
                        setBrandPage(nextPage);
                        setBrandHasMore(next.length === BRANDS_PAGE_SIZE);
                      } else {
                        setBrandHasMore(false);
                      }
                    } finally {
                      setBrandsLoading(false);
                    }
                  };

                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className="h-12 w-full justify-between border-gray-300 text-left font-normal hover:bg-gray-50"
                          variant="outline"
                        >
                          <span className="truncate">{triggerText}</span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                      >
                        <div className="bg-background border-b p-2">
                          <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                              className="h-9 pl-9"
                              placeholder="Search brands..."
                              value={brandSearch}
                              onChange={async (e) => {
                                const value = e.target.value;
                                setBrandSearch(value);
                                setBrandPage(0);
                                setBrandsLoading(true);
                                try {
                                  const arr = await getAllBrands({
                                    search: value,
                                    skip: 0,
                                    take: BRANDS_PAGE_SIZE,
                                  });
                                  setAllBrands(arr);
                                  setBrandHasMore(
                                    arr.length === BRANDS_PAGE_SIZE
                                  );
                                } finally {
                                  setBrandsLoading(false);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div
                          className="max-h-[300px] overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()}
                          onScroll={(e) => {
                            const el = e.currentTarget;
                            const nearBottom =
                              el.scrollHeight - el.scrollTop - el.clientHeight <
                              48;
                            if (nearBottom) {
                              void loadMoreBrands();
                            }
                          }}
                        >
                          {unique.map((opt) => {
                            const id = `brand-${opt.value}`;
                            const checked = preferences.brands.includes(
                              opt.value
                            );
                            return (
                              <div
                                key={opt.value}
                                className="flex items-center p-3 hover:bg-gray-50"
                              >
                                <Checkbox
                                  checked={checked}
                                  className="mr-3"
                                  id={id}
                                  onCheckedChange={() => toggleBrand(opt.value)}
                                />
                                <label
                                  className="text-foreground/90 flex-1 cursor-pointer text-sm"
                                  htmlFor={id}
                                >
                                  {opt.label}
                                </label>
                              </div>
                            );
                          })}
                          {brandsLoading && (
                            <div className="text-muted-foreground border-t bg-gray-50 p-2 text-center text-sm">
                              Loading…
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                })()}
                {preferences.brands.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferences.brands.map((id) => (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                      >
                        <span className="max-w-[160px] truncate">
                          {brandOptions.find((o) => o.value === id)?.label ??
                            id}
                        </span>
                        <button
                          aria-label={`Remove ${id}`}
                          className="ml-2"
                          onClick={() => toggleBrand(id)}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget Range */}
              <div className="space-y-3">
                <Label className="text-md font-medium text-gray-900">
                  What is your budget?
                </Label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* will add this later if required */}
                  {/* <BudgetInput
                    label="Minimum budget"
                    max={preferences.maxBudget || undefined}
                    onChange={(value) => handleBudgetChange('minBudget', value)}
                    placeholder="Minimum"
                    value={preferences.minBudget}
                  /> */}
                  <BudgetInputShared
                    label="Maximum budget"
                    min={preferences.minBudget || 0}
                    onChange={(value) => handleBudgetChange("maxBudget", value)}
                    placeholder="Maximum"
                    value={preferences.maxBudget}
                  />
                </div>
              </div>

              {/* will add later if required */}
              {/* Minimum Discount */}
              {/* <div className="space-y-3">
                <Label className="font-medium text-gray-900 text-sm">
                  Minimum Discount Preference
                </Label>
                <Select
                  onValueChange={(value) =>
                    updatePreferences({ minimumDiscount: value })
                  }
                  value={preferences.minimumDiscount}
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Select discount preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Listing Types */}
              <div className="space-y-3">
                <Label className="text-md font-medium text-gray-900">
                  What type of listings do you want to see?
                </Label>
                <div className="space-y-3">
                  <ListingTypeSelector
                    selected={
                      preferences.preferredTypes as ("AUCTION" | "CATALOG")[]
                    }
                    onChange={(next) =>
                      updatePreferences({ preferredTypes: next })
                    }
                  />
                </div>
              </div>

              {/* will add this later if required */}

              {/* Conditions */}
              {/* <MultiSelectDropdown
                isLoading={isLoading}
                label="Product Conditions I prefer"
                onToggle={toggleCondition}
                options={CONDITION_OPTIONS}
                placeholder="Select conditions..."
                selectedItems={preferences.conditions || []}
              /> */}

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                <Button
                  className="flex w-full items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
                  onClick={handleResetPreferences}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset All Preferences
                </Button>

                <Button
                  className="w-full px-8 py-3 sm:w-auto"
                  disabled={isSaving}
                  onClick={handleSavePreferences}
                >
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
