"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import {
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
} from "../../data/preferenceOptions";
import type { StepComponentProps } from "../../types/preferences";

const INITIAL_ITEMS = 15;
const ITEMS_PER_PAGE = 10;

const CategoryStepComponent: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const categoryMap = useMemo(() => {
    return new Map(CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label]));
  }, []);

  const subcategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const subcategoryList of Object.values(SUBCATEGORY_OPTIONS)) {
      for (const sub of subcategoryList) {
        map.set(sub.value, sub.label);
      }
    }
    return map;
  }, []);

  const baseCategories = searchTerm
    ? CATEGORY_OPTIONS
    : CATEGORY_OPTIONS.slice(0, displayCount);
  // Prepare categories with their subcategories
  const categoriesWithSubs = useMemo(() => {
    return baseCategories.map((category) => ({
      ...category,
      subcategories: SUBCATEGORY_OPTIONS[category.value] || [],
      isExpanded: expandedCategories.has(category.value),
    }));
  }, [baseCategories, expandedCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) {
      return categoriesWithSubs;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return categoriesWithSubs.filter((category) => {
      const categoryMatch = category.label.toLowerCase().includes(lowerSearch);
      const subMatches = category.subcategories.some((sub) =>
        sub.label.toLowerCase().includes(lowerSearch)
      );
      return categoryMatch || subMatches;
    });
  }, [categoriesWithSubs, searchTerm]);

  const hasMore = CATEGORY_OPTIONS.length > displayCount;

  // Toggle category expansion
  const toggleCategoryExpansion = useCallback((categoryValue: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryValue)) {
        newSet.delete(categoryValue);
      } else {
        newSet.add(categoryValue);
      }
      return newSet;
    });
  }, []);

  // Handle category selection
  const handleCategoryToggle = useCallback(
    (categoryValue: string, isChecked: boolean) => {
      const newCategories = isChecked
        ? [...preferences.categories, categoryValue]
        : preferences.categories.filter((c) => c !== categoryValue);
      const subcategoriesToHandle = (
        SUBCATEGORY_OPTIONS[categoryValue] || []
      ).map((s) => s.value);
      let newSubcategories = preferences.subcategories;
      if (isChecked) {
        newSubcategories = [
          ...new Set([...newSubcategories, ...subcategoriesToHandle]),
        ];
      } else {
        newSubcategories = newSubcategories.filter(
          (sub) => !subcategoriesToHandle.includes(sub)
        );
      }
      updatePreferences({
        categories: newCategories,
        subcategories: newSubcategories,
      });
    },
    [preferences.categories, preferences.subcategories, updatePreferences]
  );

  // Handle subcategory selection
  const handleSubcategoryToggle = useCallback(
    (subcategoryValue: string, categoryValue: string, isChecked: boolean) => {
      const newSubcategories = isChecked
        ? [...preferences.subcategories, subcategoryValue]
        : preferences.subcategories.filter((s) => s !== subcategoryValue);

      // Auto-select parent category if subcategory is selected
      const newCategories =
        isChecked && !preferences.categories.includes(categoryValue)
          ? [...preferences.categories, categoryValue]
          : preferences.categories;

      updatePreferences({
        categories: newCategories,
        subcategories: newSubcategories,
      });
    },
    [preferences.categories, preferences.subcategories, updatePreferences]
  );

  // Remove selected item
  const removeSelectedItem = useCallback(
    (itemValue: string, type: "category" | "subcategory") => {
      if (type === "category") {
        const newCategories = preferences.categories.filter(
          (c) => c !== itemValue
        );
        const subcategoriesToRemove = (
          SUBCATEGORY_OPTIONS[itemValue] || []
        ).map((s) => s.value);
        const newSubcategories = preferences.subcategories.filter(
          (sub) => !subcategoriesToRemove.includes(sub)
        );
        updatePreferences({
          categories: newCategories,
          subcategories: newSubcategories,
        });
      } else {
        const newSubcategories = preferences.subcategories.filter(
          (s) => s !== itemValue
        );
        updatePreferences({ subcategories: newSubcategories });
      }
    },
    [preferences.categories, preferences.subcategories, updatePreferences]
  );

  // Load more items when scrolling
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const isNearBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - 10;

      if (isNearBottom && hasMore) {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
      }
    },
    [hasMore]
  );

  // Reset when dropdown opens
  const handleDropdownOpenChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
    if (open) {
      setDisplayCount(INITIAL_ITEMS);
    }
  }, []);

  // Get total selected count
  const totalSelectedCount =
    preferences.categories.length + preferences.subcategories.length;

  return (
    <div className="space-y-6">
      {/* Cascading Multi-Select Dropdown */}
      <div className="space-y-3">
        <DropdownMenu
          onOpenChange={handleDropdownOpenChange}
          open={isDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              className="h-12 w-full justify-between border-gray-300 text-left font-normal hover:bg-gray-50"
              variant="outline"
            >
              <span className="text-foreground">
                {totalSelectedCount > 0
                  ? `${totalSelectedCount} items selected`
                  : "Select categories and subcategories..."}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            avoidCollisions={true}
            className="max-h-[min(300px,calc(100vh-200px))] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto p-0"
            onScroll={handleScroll}
            ref={scrollElementRef}
            side="bottom"
            sideOffset={4}
          >
            <div className="bg-background sticky top-0 z-10 border-b p-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  className="border-input placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-md border bg-transparent py-2 pr-3 pl-9 text-sm focus:ring-1 focus:outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  type="search"
                  value={searchTerm}
                />
              </div>
            </div>
            {filteredCategories.length > 0 ? (
              <>
                {filteredCategories.map(({ value, label, subcategories }) => (
                  <div
                    className="border-b border-gray-100 last:border-b-0"
                    key={value}
                  >
                    {/* Category Item */}
                    <div className="flex items-center p-3 hover:bg-gray-50">
                      <Checkbox
                        checked={preferences.categories.includes(value)}
                        className="mr-3"
                        id={`category-${value}`}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(value, checked as boolean)
                        }
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <label
                          className="flex-1 cursor-pointer text-sm font-medium"
                          htmlFor={`category-${value}`}
                        >
                          {label}
                        </label>
                        {subcategories.length > 0 && (
                          <Button
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleCategoryExpansion(value);
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            <ChevronRight
                              className={`h-3 w-3 transition-transform ${
                                expandedCategories.has(value) ? "rotate-90" : ""
                              }`}
                            />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {subcategories.length > 0 &&
                      expandedCategories.has(value) && (
                        <div className="bg-gray-50/50">
                          {subcategories
                            .filter(
                              (sub) =>
                                !searchTerm ||
                                sub.label
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                            )
                            .map((subcategory) => (
                              <div
                                className="flex items-center p-3 pl-10 hover:bg-gray-50"
                                key={subcategory.value}
                              >
                                <Checkbox
                                  checked={preferences.subcategories.includes(
                                    subcategory.value
                                  )}
                                  className="mr-3"
                                  id={`subcategory-${subcategory.value}`}
                                  onCheckedChange={(checked) =>
                                    handleSubcategoryToggle(
                                      subcategory.value,
                                      value,
                                      checked as boolean
                                    )
                                  }
                                />
                                <label
                                  className="text-foreground/90 flex-1 cursor-pointer text-sm"
                                  htmlFor={`subcategory-${subcategory.value}`}
                                >
                                  {subcategory.label}
                                </label>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>
                ))}
                {!searchTerm && hasMore && (
                  <div className="text-muted-foreground border-t p-3 text-center text-sm">
                    Showing {displayCount} of {CATEGORY_OPTIONS.length}{" "}
                    categories
                    <br />
                    <span className="text-xs">Scroll down to load more</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground p-4 text-center text-sm">
                {searchTerm
                  ? "No matching categories found"
                  : "No categories available"}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selected Items Display */}
      {totalSelectedCount > 0 && (
        <div className="space-y-4">
          {/* Selected Categories */}
          {preferences.categories.length > 0 && (
            <div className="space-y-3">
              <p className="text-foreground text-sm font-medium">
                Selected categories ({preferences.categories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.categories.map((categoryValue) => (
                  <Badge
                    className="bg-blue-100 text-sm text-blue-800 hover:bg-blue-200"
                    key={categoryValue}
                    variant="default"
                  >
                    {categoryMap.get(categoryValue) || categoryValue}
                    <button
                      aria-label={`Remove ${categoryMap.get(categoryValue) || categoryValue}`}
                      className="ring-offset-background focus:ring-ring ml-2 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                      onClick={() =>
                        removeSelectedItem(categoryValue, "category")
                      }
                      type="button"
                    >
                      <X className="h-3 w-3 text-blue-600 hover:text-blue-800" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Selected Subcategories */}
          {preferences.subcategories.length > 0 && (
            <div className="space-y-3">
              <p className="text-foreground text-sm font-medium">
                Selected subcategories ({preferences.subcategories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.subcategories.map((subcategoryValue) => (
                  <Badge
                    className="bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                    key={subcategoryValue}
                    variant="secondary"
                  >
                    {subcategoryMap.get(subcategoryValue) || subcategoryValue}
                    <button
                      aria-label={`Remove ${subcategoryMap.get(subcategoryValue) || subcategoryValue}`}
                      className="ring-offset-background focus:ring-ring ml-2 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                      onClick={() =>
                        removeSelectedItem(subcategoryValue, "subcategory")
                      }
                      type="button"
                    >
                      <X className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CategoryStep = React.memo(CategoryStepComponent);
export default CategoryStep;
