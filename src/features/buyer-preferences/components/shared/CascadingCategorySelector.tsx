"use client";

import React, { useCallback, useMemo, useState } from "react";

import { ChevronDown, Search, X } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Label } from "@/src/components/ui/label";

import {
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
} from "../../data/preferenceOptions";

interface Props {
  selectedCategories: string[];
  selectedSubcategories: string[];
  onChange: (update: {
    categories?: string[];
    subcategories?: string[];
  }) => void;
  isLoading?: boolean;
}

export const CascadingCategorySelector = ({
  selectedCategories,
  selectedSubcategories,
  onChange,
  isLoading = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategoryExpansion = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }, []);

  const handleCategoryToggle = useCallback(
    (categoryValue: string, isChecked: boolean) => {
      const newCategories = isChecked
        ? [...selectedCategories, categoryValue]
        : selectedCategories.filter((c) => c !== categoryValue);
      const subcategoriesToHandle = (
        SUBCATEGORY_OPTIONS[categoryValue] || []
      ).map((s) => s.value);
      const newSubcategories = isChecked
        ? [...new Set([...selectedSubcategories, ...subcategoriesToHandle])]
        : selectedSubcategories.filter(
            (s) => !subcategoriesToHandle.includes(s)
          );
      onChange({ categories: newCategories, subcategories: newSubcategories });
    },
    [selectedCategories, selectedSubcategories, onChange]
  );

  const handleSubcategoryToggle = useCallback(
    (subcategory: string, category: string, isChecked: boolean) => {
      const newSubcategories = isChecked
        ? [...selectedSubcategories, subcategory]
        : selectedSubcategories.filter((s) => s !== subcategory);
      if (isChecked && !selectedCategories.includes(category)) {
        onChange({
          categories: [...selectedCategories, category],
          subcategories: newSubcategories,
        });
      } else {
        onChange({ subcategories: newSubcategories });
      }
    },
    [selectedCategories, selectedSubcategories, onChange]
  );

  const filteredCategoryOptions = useMemo(() => {
    if (!searchTerm) return CATEGORY_OPTIONS;
    const lower = searchTerm.toLowerCase();
    return CATEGORY_OPTIONS.filter(
      (cat) =>
        cat.label.toLowerCase().includes(lower) ||
        (SUBCATEGORY_OPTIONS[cat.value] || []).some((s) =>
          s.label.toLowerCase().includes(lower)
        )
    );
  }, [searchTerm]);

  const totalSelectedCount =
    selectedCategories.length + selectedSubcategories.length;

  return (
    <div className="space-y-3">
      <Label className="text-md font-medium text-gray-900">
        What categories do you buy?
      </Label>
      <div className="w-full">
        <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-12 w-full justify-between border-gray-300 text-left font-normal hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
              variant="outline"
            >
              <span className="truncate text-gray-700">
                {isLoading
                  ? "Loading..."
                  : totalSelectedCount > 0
                    ? `${totalSelectedCount} items selected`
                    : "Select categories and subcategories..."}
              </span>
              <ChevronDown
                className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            avoidCollisions
            className="max-h-[min(300px,calc(100vh-200px))] w-[--radix-dropdown-menu-trigger-width] overflow-y-auto p-0"
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
            {filteredCategoryOptions.map((cat) => {
              const category = cat.value;
              const categoryLabel = cat.label;
              const subcategories = SUBCATEGORY_OPTIONS[category] || [];
              return (
                <div
                  className="border-b border-gray-100 last:border-b-0"
                  key={category}
                >
                  <div className="flex items-center p-3 hover:bg-gray-50">
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      className="mr-3"
                      id={`category-${category}`}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(category, checked as boolean)
                      }
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <label
                        className="flex-1 cursor-pointer text-sm font-medium"
                        htmlFor={`category-${category}`}
                      >
                        {categoryLabel}
                      </label>
                      {subcategories.length > 0 && (
                        <Button
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCategoryExpansion(category);
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedCategories.has(category) ? "rotate-180" : ""}`}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                  {subcategories.length > 0 &&
                    expandedCategories.has(category) && (
                      <div className="bg-gray-50/50">
                        {subcategories
                          .filter(
                            (sub) =>
                              !searchTerm ||
                              sub.label
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                          )
                          .map((sub) => (
                            <div
                              className="flex items-center p-3 pl-10 hover:bg-gray-50"
                              key={sub.value}
                            >
                              <Checkbox
                                checked={selectedSubcategories.includes(
                                  sub.value
                                )}
                                className="mr-3"
                                id={`subcategory-${sub.value}`}
                                onCheckedChange={(checked) =>
                                  handleSubcategoryToggle(
                                    sub.value,
                                    category,
                                    checked as boolean
                                  )
                                }
                              />
                              <label
                                className="text-foreground/90 flex-1 cursor-pointer text-sm"
                                htmlFor={`subcategory-${sub.value}`}
                              >
                                {sub.label}
                              </label>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {totalSelectedCount > 0 && (
        <div className="space-y-4">
          {selectedCategories.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Selected categories ({selectedCategories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => {
                  const label =
                    CATEGORY_OPTIONS.find((c) => c.value === category)?.label ??
                    category;
                  return (
                    <Badge
                      className="border border-blue-300 bg-blue-100 px-3 py-1.5 text-sm text-blue-800"
                      key={category}
                      variant="default"
                    >
                      <span className="max-w-[120px] truncate">{label}</span>
                      <button
                        aria-label={`Remove ${label}`}
                        className="ml-2"
                        onClick={() =>
                          onChange({
                            categories: selectedCategories.filter(
                              (c) => c !== category
                            ),
                            subcategories: selectedSubcategories.filter(
                              (s) =>
                                !(SUBCATEGORY_OPTIONS[category] || [])
                                  .map((x) => x.value)
                                  .includes(s)
                            ),
                          })
                        }
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          {selectedSubcategories.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Selected subcategories ({selectedSubcategories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSubcategories.map((sub) => {
                  let subLabel = sub;
                  for (const subs of Object.values(SUBCATEGORY_OPTIONS)) {
                    const found = subs.find((s) => s.value === sub);
                    if (found) {
                      subLabel = found.label;
                      break;
                    }
                  }
                  return (
                    <Badge
                      className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                      key={sub}
                      variant="secondary"
                    >
                      <span className="max-w-[120px] truncate">{subLabel}</span>
                      <button
                        aria-label={`Remove ${subLabel}`}
                        className="ml-2"
                        onClick={() =>
                          onChange({
                            subcategories: selectedSubcategories.filter(
                              (s) => s !== sub
                            ),
                          })
                        }
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CascadingCategorySelector;
