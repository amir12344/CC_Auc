'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { StepComponentProps } from '../../types/preferences';
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS } from '../../data/preferenceOptions';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Checkbox } from '@/src/components/ui/checkbox';

const INITIAL_ITEMS = 15;
const ITEMS_PER_PAGE = 10;

interface CategoryWithSubcategories {
  category: string;
  subcategories: string[];
  isExpanded: boolean;
}

const CategoryStepComponent: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Prepare categories with their subcategories
  const categoriesWithSubs = useMemo(() => {
    return CATEGORY_OPTIONS.slice(0, displayCount).map(category => ({
      category,
      subcategories: SUBCATEGORY_OPTIONS[category] || [],
      isExpanded: expandedCategories.has(category)
    }));
  }, [displayCount, expandedCategories]);

  const hasMore = CATEGORY_OPTIONS.length > displayCount;

  // Toggle category expansion
  const toggleCategoryExpansion = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // Handle category selection
  const handleCategoryToggle = useCallback((category: string, isChecked: boolean) => {
    const newCategories = isChecked
      ? [...preferences.categories, category]
      : preferences.categories.filter(c => c !== category);
    
    // If unchecking category, remove all its subcategories
    const newSubcategories = isChecked
      ? preferences.subcategories
      : preferences.subcategories.filter(sub => 
          !(SUBCATEGORY_OPTIONS[category] || []).includes(sub)
        );
    
    updatePreferences({ 
      categories: newCategories,
      subcategories: newSubcategories
    });
  }, [preferences.categories, preferences.subcategories, updatePreferences]);

  // Handle subcategory selection
  const handleSubcategoryToggle = useCallback((subcategory: string, category: string, isChecked: boolean) => {
    const newSubcategories = isChecked
      ? [...preferences.subcategories, subcategory]
      : preferences.subcategories.filter(s => s !== subcategory);
    
    // Auto-select parent category if subcategory is selected
    const newCategories = isChecked && !preferences.categories.includes(category)
      ? [...preferences.categories, category]
      : preferences.categories;
    
    updatePreferences({ 
      categories: newCategories,
      subcategories: newSubcategories
    });
  }, [preferences.categories, preferences.subcategories, updatePreferences]);

  // Remove selected item
  const removeSelectedItem = useCallback((item: string, type: 'category' | 'subcategory') => {
    if (type === 'category') {
      const newCategories = preferences.categories.filter(c => c !== item);
      const newSubcategories = preferences.subcategories.filter(sub => 
        !(SUBCATEGORY_OPTIONS[item] || []).includes(sub)
      );
      updatePreferences({ 
        categories: newCategories,
        subcategories: newSubcategories
      });
    } else {
      const newSubcategories = preferences.subcategories.filter(s => s !== item);
      updatePreferences({ subcategories: newSubcategories });
    }
  }, [preferences.categories, preferences.subcategories, updatePreferences]);

  // Load more items when scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 10;
    
    if (isNearBottom && hasMore) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  }, [hasMore]);

  // Reset when dropdown opens
  const handleDropdownOpenChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
    if (open) {
      setDisplayCount(INITIAL_ITEMS);
    }
  }, []);

  // Get total selected count
  const totalSelectedCount = preferences.categories.length + preferences.subcategories.length;

  return (
    <div className="space-y-6">
      {/* Cascading Multi-Select Dropdown */}
      <div className="space-y-3">
        <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between h-12 text-left font-normal border-gray-300 hover:bg-gray-50"
            >
              <span className="text-foreground">
                {totalSelectedCount > 0 
                  ? `${totalSelectedCount} items selected` 
                  : 'Select categories and subcategories...'
                }
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            ref={scrollElementRef}
            className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[min(300px,calc(100vh-200px))] overflow-y-auto p-0" 
            align="start"
            side="bottom"
            sideOffset={4}
            avoidCollisions={true}
            onScroll={handleScroll}
          >
            {categoriesWithSubs.length > 0 ? (
              <>
                {categoriesWithSubs.map(({ category, subcategories }) => (
                  <div key={category} className="border-b border-gray-100 last:border-b-0">
                    {/* Category Item */}
                    <div className="flex items-center p-3 hover:bg-gray-50">
                      <Checkbox
                        id={`category-${category}`}
                        checked={preferences.categories.includes(category)}
                        onCheckedChange={(checked) => 
                          handleCategoryToggle(category, checked as boolean)
                        }
                        className="mr-3"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {category}
                        </label>
                        {subcategories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleCategoryExpansion(category);
                            }}
                          >
                            <ChevronRight 
                              className={`h-3 w-3 transition-transform ${
                                expandedCategories.has(category) ? 'rotate-90' : ''
                              }`} 
                            />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {subcategories.length > 0 && expandedCategories.has(category) && (
                      <div className="bg-gray-50/50">
                        {subcategories.map((subcategory) => (
                          <div 
                            key={subcategory} 
                            className="flex items-center p-3 pl-10 hover:bg-gray-50"
                          >
                            <Checkbox
                              id={`subcategory-${subcategory}`}
                              checked={preferences.subcategories.includes(subcategory)}
                              onCheckedChange={(checked) => 
                                handleSubcategoryToggle(subcategory, category, checked as boolean)
                              }
                              className="mr-3"
                            />
                            <label 
                              htmlFor={`subcategory-${subcategory}`}
                              className="text-sm cursor-pointer flex-1 text-foreground/90"
                            >
                              {subcategory}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {hasMore && (
                  <div className="p-3 text-center text-sm text-muted-foreground border-t">
                    Showing {categoriesWithSubs.length} of {CATEGORY_OPTIONS.length} categories
                    <br />
                    <span className="text-xs">Scroll down to load more</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No categories available
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
              <p className="text-sm font-medium text-foreground">
                Selected categories ({preferences.categories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant="default" 
                    className="text-sm bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    {category}
                    <button
                      onClick={() => removeSelectedItem(category, 'category')}
                      className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label={`Remove ${category}`}
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
              <p className="text-sm font-medium text-foreground">
                Selected subcategories ({preferences.subcategories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.subcategories.map((subcategory) => (
                  <Badge 
                    key={subcategory} 
                    variant="secondary" 
                    className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    {subcategory}
                    <button
                      onClick={() => removeSelectedItem(subcategory, 'subcategory')}
                      className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label={`Remove ${subcategory}`}
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

      {/* Description */}
      <div className="text-sm text-muted-foreground">
        {totalSelectedCount === 0 ? (
          <p>Choose the product categories and subcategories that interest you most. This helps us show you the most relevant inventory.</p>
        ) : (
          <p>Perfect! We'll focus on showing you inventory in these categories and subcategories. You can expand categories to see their subcategories.</p>
        )}
      </div>
    </div>
  );
};

export const CategoryStep = React.memo(CategoryStepComponent); 