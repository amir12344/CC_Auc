"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ChevronDown, ChevronUp, Filter, RotateCcw } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { Label } from "@/src/components/ui/label";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { Slider } from "@/src/components/ui/slider";
import { useIsMobile } from "@/src/hooks/use-mobile";

interface FilterSidebarProps {
  category?: string;
  searchQuery?: string;
}

/**
 * FilterSidebar Component
 *
 * Provides comprehensive filtering options for collection browsing with URL state persistence.
 *
 * COMPONENT STRUCTURE:
 * 1. Price Range Slider - Interactive price filtering with auto-apply
 * 2. Condition Filter - New, Refurbished, Used radio buttons with auto-apply
 * 3. Discount Range - Minimum discount percentage filter with auto-apply
 * 4. Special Events - Clearance, Flash Sale, etc. checkboxes with auto-apply
 * 5. Stock Status - In-stock only filter with auto-apply
 * 6. Sort Options - Price, discount, popularity sorting with auto-apply
 *
 * AUTO-APPLY FILTERING:
 * - Filters apply automatically on user interaction (no Apply button needed)
 * - URL state synchronization happens in real-time
 * - Debounced updates prevent excessive API calls for sliders
 * - Immediate updates for checkboxes and select inputs
 *
 * URL STATE MANAGEMENT:
 * - All filter states are synchronized with URL search parameters automatically
 * - Enables bookmarking and sharing of filtered views
 * - Maintains filter state across navigation and page reloads
 * - Compatible with SSR and client-side routing
 *
 * FILTER CATEGORIES:
 * - Price Range: $0 - $5000+ with slider interface
 * - Condition: New, Refurbished, Used with radio selection
 * - Discount: 0% - 70%+ discount range filtering
 * - Special Events: Clearance, Doorbusters, Flash Sales
 * - Availability: In-stock only toggle
 * - Sorting: Price (asc/desc), discount, newest, popularity
 *
 * RESPONSIVE DESIGN:
 * - Collapsible sections on mobile devices
 * - Sticky sidebar positioning on desktop
 * - Touch-friendly controls and proper spacing
 */
export const FilterSidebar = ({
  category,
  searchQuery,
}: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local state for filter values
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [condition, setCondition] = useState<string>("all");
  const [discountRange, setDiscountRange] = useState<[number, number]>([0, 70]);
  const [specialEvents, setSpecialEvents] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);

  // Collapsible section states
  const [priceOpen, setPriceOpen] = useState(true);
  const [conditionOpen, setConditionOpen] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [retailersOpen, setRetailersOpen] = useState(true);

  /**
   * Initialize filter states from URL parameters on component mount and when searchParams change
   *
   * This ensures that the filter UI reflects the current URL state,
   * supporting direct navigation to filtered views via URL and proper sync
   * when filters are removed via ActiveFilterChips.
   */
  useEffect(() => {
    // Parse price range from URL
    const priceParam = searchParams.get("price");
    if (priceParam) {
      const [min, max] = priceParam.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setPriceRange([min, max]);
      }
    } else {
      // Reset to default if not in URL
      setPriceRange([0, 2000]);
    }

    // Parse condition filter
    const conditionParam = searchParams.get("condition");
    if (conditionParam) {
      setCondition(conditionParam);
    } else {
      // Reset to default if not in URL
      setCondition("all");
    }

    // Parse discount range
    const discountParam = searchParams.get("discount");
    if (discountParam) {
      const [min, max] = discountParam.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setDiscountRange([min, max]);
      }
    } else {
      // Reset to default if not in URL
      setDiscountRange([0, 70]);
    }

    // Parse special events
    const eventsParam = searchParams.get("specialEvent");
    if (eventsParam) {
      setSpecialEvents(eventsParam.split(","));
    } else {
      // Reset to default if not in URL
      setSpecialEvents([]);
    }

    // Parse in-stock filter
    const inStockParam = searchParams.get("inStock");
    if (inStockParam === "true") {
      setInStockOnly(true);
    } else {
      // Reset to default if not in URL
      setInStockOnly(false);
    }

    // Parse sort option
    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSortBy(sortParam);
    } else {
      // Reset to default if not in URL
      setSortBy("featured");
    }

    // Parse retailer filter
    const retailerParam = searchParams.get("retailer");
    if (retailerParam) {
      setSelectedRetailers(retailerParam.split(","));
    } else {
      // Reset to default if not in URL
      setSelectedRetailers([]);
    }
  }, [searchParams]);

  /**
   * Update URL with current filter values
   *
   * Constructs new URLSearchParams with all active filters and navigates
   * to the updated URL, triggering a re-fetch of filtered products.
   * Now used for both immediate updates and debounced slider updates.
   */
  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();

    // Add price range if not default
    if (priceRange[0] > 0 || priceRange[1] < 2000) {
      params.set("price", `${priceRange[0]}-${priceRange[1]}`);
    }

    // Add condition filter (skip 'all' as it means no filter)
    if (condition && condition !== "all") {
      params.set("condition", condition);
    }

    // Add discount range if not default
    if (discountRange[0] > 0 || discountRange[1] < 70) {
      params.set("discount", `${discountRange[0]}-${discountRange[1]}`);
    }

    // Add special events
    if (specialEvents.length > 0) {
      params.set("specialEvent", specialEvents.join(","));
    }

    // Add in-stock filter
    if (inStockOnly) {
      params.set("inStock", "true");
    }

    // Add sort option (skip 'featured' as it's the default)
    if (sortBy && sortBy !== "featured") {
      params.set("sort", sortBy);
    }

    // Add retailer filter
    if (selectedRetailers.length > 0) {
      params.set("retailer", selectedRetailers.join(","));
    }

    // Preserve search query if it exists
    if (searchQuery) {
      params.set("q", searchQuery);
    }

    // Navigate to updated URL
    // If we have a search query, stay on search page
    // If we have a category, go to collections page
    // Otherwise, stay on current page (fallback)
    let baseUrl = "/search";
    if (searchQuery) {
      baseUrl = "/search";
    } else if (category) {
      baseUrl = `/collections/${category}`;
    } else {
      // If no searchQuery and no category, stay on search page
      baseUrl = "/search";
    }

    const newUrl = `${baseUrl}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl);
  }, [
    category,
    searchQuery,
    priceRange,
    condition,
    discountRange,
    specialEvents,
    inStockOnly,
    sortBy,
    selectedRetailers,
    router,
  ]);

  /**
   * Clear all filters and return to unfiltered collection view
   */
  const clearAllFilters = () => {
    setPriceRange([0, 2000]);
    setCondition("all");
    setDiscountRange([0, 70]);
    setSpecialEvents([]);
    setInStockOnly(false);
    setSortBy("featured");
    setSelectedRetailers([]);

    // Determine the correct base URL for clearing filters
    let baseUrl = "/search";
    if (searchQuery) {
      baseUrl = `/search${searchQuery ? `?q=${searchQuery}` : ""}`;
    } else if (category) {
      baseUrl = `/collections/${category}`;
    } else {
      // If no searchQuery and no category, stay on search page
      baseUrl = "/search";
    }

    router.replace(baseUrl);
  };

  /**
   * Handle special event checkbox changes with auto-apply
   */
  const handleSpecialEventChange = (event: string, checked: boolean) => {
    setSpecialEvents((prev) =>
      checked ? [...prev, event] : prev.filter((e) => e !== event)
    );
  };

  /**
   * Handle retailer checkbox changes with auto-apply
   */
  const handleRetailerChange = (retailer: string, checked: boolean) => {
    setSelectedRetailers((prev) =>
      checked ? [...prev, retailer] : prev.filter((r) => r !== retailer)
    );
  };

  /**
   * Auto-apply filters when filter states change
   * Debounced to prevent excessive API calls and race conditions
   */
  useEffect(() => {
    // Skip if this is just the initial URL sync (prevent immediate re-application)
    const isInitialSync = searchParams.toString() !== "";

    // Check if filters have actually changed from defaults
    const hasFilterChanges =
      condition !== "all" ||
      specialEvents.length > 0 ||
      inStockOnly !== false ||
      sortBy !== "featured" ||
      selectedRetailers.length > 0 ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 2000 ||
      discountRange[0] !== 0 ||
      discountRange[1] !== 70;

    // Only apply filters if we have actual changes and it's not just URL sync
    if (hasFilterChanges) {
      const timeoutId = setTimeout(() => {
        updateFilters();
      }, 300); // Debounced call for all filter changes

      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    condition,
    specialEvents,
    inStockOnly,
    sortBy,
    selectedRetailers,
    priceRange,
    discountRange,
    updateFilters,
    // searchParams intentionally omitted to prevent infinite loops
    // updateFilters modifies URL which changes searchParams, causing re-runs
  ]);

  // Available special events for filtering
  const specialEventOptions = [
    {
      id: "clearance",
      label: "Clearance Sale",
      description: "Deep discounts on select items",
    },
    {
      id: "doorbusters",
      label: "Doorbusters",
      description: "Limited-time amazing deals",
    },
    {
      id: "flash-sale",
      label: "Flash Sale",
      description: "Quick, limited-quantity deals",
    },
    {
      id: "refurbished-special",
      label: "Refurbished Special",
      description: "Best refurbished deals",
    },
  ];

  // Available retailers for filtering
  const retailerOptions = [
    { id: "amazon", label: "Amazon", count: 24 },
    { id: "walmart", label: "Walmart", count: 18 },
    { id: "target", label: "Target", count: 15 },
    { id: "wayfair", label: "Wayfair", count: 12 },
    { id: "home depot", label: "Home Depot", count: 9 },
    { id: "ikea", label: "IKEA", count: 8 },
    { id: "lowes", label: "Lowe's", count: 7 },
    { id: "best buy", label: "Best Buy", count: 6 },
  ];

  // Check if any filters are active
  const hasActiveFilters =
    priceRange[0] > 0 ||
    priceRange[1] < 2000 ||
    (condition !== "" && condition !== "all") ||
    discountRange[0] > 0 ||
    discountRange[1] < 70 ||
    specialEvents.length > 0 ||
    inStockOnly ||
    (sortBy !== "" && sortBy !== "featured") ||
    selectedRetailers.length > 0;

  // Filter sections component to be reused in both mobile and desktop
  const FilterSections = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 font-medium text-gray-900"
          >
            <span>Price Range</span>
            {priceOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="px-1">
            <Slider
              value={priceRange}
              onValueChange={(value) =>
                setPriceRange(value as [number, number])
              }
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}+</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Condition Filter */}
      <Collapsible open={conditionOpen} onOpenChange={setConditionOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 font-medium text-gray-900"
          >
            <span>Condition</span>
            {conditionOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {[
            { value: "new", label: "New" },
            { value: "refurbished", label: "Refurbished" },
            { value: "used", label: "Used" },
          ].map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox
                id={`condition-${item.value}`}
                checked={condition === item.value}
                onCheckedChange={(checked) =>
                  checked ? setCondition(item.value) : setCondition("all")
                }
              />
              <Label
                htmlFor={`condition-${item.value}`}
                className="text-sm text-gray-700"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Discount Range Filter */}
      <Collapsible open={discountOpen} onOpenChange={setDiscountOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 font-medium text-gray-900"
          >
            <span>Discount Range</span>
            {discountOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="px-1">
            <Slider
              value={discountRange}
              onValueChange={(value) =>
                setDiscountRange(value as [number, number])
              }
              max={70}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{discountRange[0]}%</span>
              <span>{discountRange[1]}%+</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Special Events Filter */}
      <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 font-medium text-gray-900"
          >
            <span>Special Events</span>
            {eventsOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {specialEventOptions.map((event) => (
            <div key={event.id} className="flex items-center space-x-2">
              <Checkbox
                id={`event-${event.id}`}
                checked={specialEvents.includes(event.id)}
                onCheckedChange={(checked) =>
                  handleSpecialEventChange(event.id, !!checked)
                }
              />
              <div className="flex flex-col">
                <Label
                  htmlFor={`event-${event.id}`}
                  className="text-sm text-gray-700"
                >
                  {event.label}
                </Label>
                <span className="text-xs text-gray-500">
                  {event.description}
                </span>
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Stock Availability Filter */}
      <Collapsible open={availabilityOpen} onOpenChange={setAvailabilityOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 font-medium text-gray-900"
          >
            <span>Availability</span>
            {availabilityOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock-only"
              checked={inStockOnly}
              onCheckedChange={(checked) => setInStockOnly(!!checked)}
            />
            <Label htmlFor="in-stock-only" className="text-sm text-gray-700">
              In Stock Only
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Retailer Filter */}
      <Collapsible open={retailersOpen} onOpenChange={setRetailersOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between p-0 font-medium text-gray-900"
          >
            <span>Original Retailer</span>
            {retailersOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-2">
          {retailerOptions.map((retailer) => (
            <div
              key={retailer.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`retailer-${retailer.id}`}
                  checked={selectedRetailers.includes(retailer.id)}
                  onCheckedChange={(checked) =>
                    handleRetailerChange(retailer.id, !!checked)
                  }
                />
                <Label
                  htmlFor={`retailer-${retailer.id}`}
                  className="text-sm text-gray-700"
                >
                  {retailer.label}
                </Label>
              </div>
              <span className="text-xs text-gray-500">{retailer.count}</span>
            </div>
          ))}
          <Button variant="link" className="h-auto p-0 text-sm text-blue-600">
            Show all retailers
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  // Mobile implementation with Sheet
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="mb-4 w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge
                variant="default"
                className="bg-primary/90 ml-2 px-2 py-1 text-xs"
              >
                {[
                  priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0,
                  condition && condition !== "all" ? 1 : 0,
                  discountRange[0] > 0 || discountRange[1] < 70 ? 1 : 0,
                  specialEvents.length,
                  inStockOnly ? 1 : 0,
                  sortBy && sortBy !== "featured" ? 1 : 0,
                  selectedRetailers.length,
                ].reduce((sum, count) => sum + count, 0)}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-6">
          <SheetHeader className="mb-6">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground mb-4 w-full justify-center gap-2 border-dashed transition-all duration-200 hover:border-solid"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1 pr-4">
              <FilterSections />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop implementation with Card
  return (
    <Card className="bg-card/50 h-fit border-0 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Filter className="text-primary h-4 w-4" />
          </div>
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge
              variant="default"
              className="bg-primary/90 ml-auto px-2 py-1 text-xs"
            >
              {[
                priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0,
                condition && condition !== "all" ? 1 : 0,
                discountRange[0] > 0 || discountRange[1] < 70 ? 1 : 0,
                specialEvents.length,
                inStockOnly ? 1 : 0,
                sortBy && sortBy !== "featured" ? 1 : 0,
                selectedRetailers.length,
              ].reduce((sum, count) => sum + count, 0)}
            </Badge>
          )}
        </CardTitle>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground w-full justify-center gap-2 border-dashed transition-all duration-200 hover:border-solid"
          >
            <RotateCcw className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-1 pr-4">
            <FilterSections />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
