'use client';

import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  ChevronDown,
  X,
  DollarSign,
  RotateCcw,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/src/hooks/use-toast';
import { usePreferenceData } from '@/src/features/buyer-preferences/hooks/usePreferenceData';
import { usePreferencePopup } from '@/src/features/buyer-preferences/hooks/usePreferencePopup';
import {
  BRAND_OPTIONS,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  DISCOUNT_OPTIONS,
  SELLING_PLATFORM_DETAILS
} from '@/src/features/buyer-preferences/data/preferenceOptions';
import type { BuyerPreferences } from '@/src/features/buyer-preferences/types/preferences';

// Extracted component for better reusability and performance
interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
}

const MultiSelectDropdown = ({
  label,
  options,
  selectedItems,
  onToggle,
  placeholder = "Select options...",
  isLoading = false,
  error
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback((item: string) => {
    onToggle(item);
  }, [onToggle]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900">{label}</Label>
      <div className="w-full">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 text-left font-normal border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              <span className="text-gray-700 truncate">
                {isLoading
                  ? 'Loading...'
                  : selectedItems.length > 0
                    ? `${selectedItems.length} selected`
                    : placeholder
                }
              </span>
              <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selectedItems.includes(option)}
                onCheckedChange={() => handleToggle(option)}
                className="cursor-pointer"
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              <span className="truncate max-w-[120px]">{item}</span>
              <button
                onClick={() => handleToggle(item)}
                className="ml-2 hover:text-gray-900 transition-colors"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Cascading Category Dropdown Component
interface CascadingCategoryDropdownProps {
  preferences: BuyerPreferences;
  toggleCategory: (category: string) => void;
  toggleSubcategory: (subcategory: string) => void;
  isLoading?: boolean;
}

const CascadingCategoryDropdown = ({
  preferences,
  toggleCategory,
  toggleSubcategory,
  isLoading = false
}: CascadingCategoryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const handleCategoryToggle = useCallback((category: string, isChecked: boolean) => {
    toggleCategory(category);

    // If unchecking category, remove all its subcategories
    if (!isChecked) {
      const categorySubcategories = SUBCATEGORY_OPTIONS[category] || [];
      categorySubcategories.forEach(sub => {
        if (preferences.subcategories.includes(sub)) {
          toggleSubcategory(sub);
        }
      });
    }
  }, [toggleCategory, toggleSubcategory, preferences.subcategories]);

  const handleSubcategoryToggle = useCallback((subcategory: string, category: string, isChecked: boolean) => {
    toggleSubcategory(subcategory);

    // Auto-select parent category if subcategory is selected
    if (isChecked && !preferences.categories.includes(category)) {
      toggleCategory(category);
    }
  }, [toggleSubcategory, toggleCategory, preferences.categories]);

  const removeSelectedItem = useCallback((item: string, type: 'category' | 'subcategory') => {
    if (type === 'category') {
      // Remove category and all its subcategories
      const categorySubcategories = SUBCATEGORY_OPTIONS[item] || [];
      categorySubcategories.forEach(sub => {
        if (preferences.subcategories.includes(sub)) {
          toggleSubcategory(sub);
        }
      });
      toggleCategory(item);
    } else {
      toggleSubcategory(item);
    }
  }, [toggleCategory, toggleSubcategory, preferences.subcategories]);

  const totalSelectedCount = preferences.categories.length + preferences.subcategories.length;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900">Categories & Subcategories I prefer</Label>
      <div className="w-full">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-12 text-left font-normal border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={isLoading}
            >
              <span className="text-gray-700 truncate">
                {isLoading
                  ? 'Loading...'
                  : totalSelectedCount > 0
                    ? `${totalSelectedCount} items selected`
                    : 'Select categories and subcategories...'
                }
              </span>
              <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] max-h-[min(300px,calc(100vh-200px))] overflow-y-auto p-0"
            align="start"
            side="bottom"
            sideOffset={4}
            avoidCollisions={true}
          >
            {CATEGORY_OPTIONS.map((category) => {
              const subcategories = SUBCATEGORY_OPTIONS[category] || [];
              return (
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
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''
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
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selected Items Display */}
      {totalSelectedCount > 0 && (
        <div className="space-y-4">
          {/* Selected Categories */}
          {preferences.categories.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Selected categories ({preferences.categories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="default"
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 transition-colors"
                  >
                    <span className="truncate max-w-[120px]">{category}</span>
                    <button
                      onClick={() => removeSelectedItem(category, 'category')}
                      className="ml-2 hover:text-blue-900 transition-colors"
                      aria-label={`Remove ${category}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Selected Subcategories */}
          {preferences.subcategories.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Selected subcategories ({preferences.subcategories.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {preferences.subcategories.map((subcategory) => (
                  <Badge
                    key={subcategory}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors"
                  >
                    <span className="truncate max-w-[120px]">{subcategory}</span>
                    <button
                      onClick={() => removeSelectedItem(subcategory, 'subcategory')}
                      className="ml-2 hover:text-gray-900 transition-colors"
                      aria-label={`Remove ${subcategory}`}
                    >
                      <X className="h-3 w-3" />
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

// Extracted component for budget inputs
interface BudgetInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  min?: number;
  max?: number;
}

const BudgetInput = ({ label, value, onChange, placeholder, min = 0, max }: BudgetInputProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(null);
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue >= min && (!max || numValue <= max)) {
        onChange(numValue);
      }
    }
  }, [onChange, min, max]);

  return (
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="number"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={handleChange}
        className="pl-10 h-12"
        min={min}
        max={max}
        step="0.01"
        aria-label={label}
      />
    </div>
  );
};

// Extracted component for listing type preference
interface ListingTypePreferenceProps {
  id: string;
  type: 'auction' | 'catalog';
  title: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const ListingTypePreference = ({
  id,
  type,
  title,
  description,
  checked,
  onToggle
}: ListingTypePreferenceProps) => {
  const handleToggle = useCallback((checkedValue: boolean) => {
    onToggle(checkedValue);
  }, [onToggle]);

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor={id} className="font-medium text-gray-900 cursor-pointer flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 font-normal">{description}</div>
      </Label>
    </div>
  );
};

// Main component
export default function PreferencesPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    preferences,
    isLoading,
    updatePreferences,
    toggleBrand,
    toggleCategory,
    toggleSubcategory,
    updateSellingPlatform,
    clearPreferences,
    getSelectedSellingPlatforms
  } = usePreferenceData();

  const { openPopup } = usePreferencePopup();

  // Memoized computations for performance
  const selectedPlatformsCount = useMemo(() => {
    return getSelectedSellingPlatforms().length;
  }, [getSelectedSellingPlatforms]);

  // Optimized handlers
  const handleSavePreferences = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!preferences.isCompleted) {
        updatePreferences({
          isCompleted: true,
          completedAt: new Date()
        });
      }

      toast({
        title: "Preferences saved successfully!",
        description: "Your marketplace preferences have been updated.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again later.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [preferences.isCompleted, updatePreferences, toast]);

  const handleRetriggerPopup = useCallback(() => {
    openPopup();
  }, [openPopup]);

  const handleResetPreferences = useCallback(() => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all preferences? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        clearPreferences();
        toast({
          title: "Preferences reset",
          description: "All preferences have been cleared.",
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error resetting preferences",
          description: "Please try again later.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [clearPreferences, toast]);

  const handleListingTypeToggle = useCallback((type: 'auction' | 'catalog', checked: boolean) => {
    const newTypes = checked
      ? [...preferences.preferredTypes, type]
      : preferences.preferredTypes.filter(t => t !== type);
    updatePreferences({ preferredTypes: newTypes });
  }, [preferences.preferredTypes, updatePreferences]);

  const handleBudgetChange = useCallback((field: 'minBudget' | 'maxBudget', value: number | null) => {
    updatePreferences({ [field]: value });
  }, [updatePreferences]);

  if (isLoading) {
    return (
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Preferences</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {preferences.isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Preferences saved
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetriggerPopup}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Settings className="h-4 w-4" />
                Setup Wizard
              </Button>
            </div>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">
            Make updates to your preferences here, which help power the best recommendations suited just for you.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6 lg:mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Shopping Preferences</h3>
                <p className="text-sm text-gray-500">Customize your marketplace experience</p>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8">
              {/* Brands */}
              <MultiSelectDropdown
                label="Brands I prefer"
                options={BRAND_OPTIONS}
                selectedItems={preferences.brands}
                onToggle={toggleBrand}
                placeholder="Select brands..."
                isLoading={isLoading}
              />

              {/* Categories & Subcategories */}
              <CascadingCategoryDropdown
                preferences={preferences}
                toggleCategory={toggleCategory}
                toggleSubcategory={toggleSubcategory}
                isLoading={isLoading}
              />

              {/* Budget Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Budget Range per Item</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BudgetInput
                    label="Minimum budget"
                    value={preferences.minBudget}
                    onChange={(value) => handleBudgetChange('minBudget', value)}
                    placeholder="Minimum"
                    max={preferences.maxBudget || undefined}
                  />
                  <BudgetInput
                    label="Maximum budget"
                    value={preferences.maxBudget}
                    onChange={(value) => handleBudgetChange('maxBudget', value)}
                    placeholder="Maximum"
                    min={preferences.minBudget || 0}
                  />
                </div>
              </div>

              {/* Minimum Discount */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Minimum Discount Preference</Label>
                <Select
                  value={preferences.minimumDiscount}
                  onValueChange={(value) => updatePreferences({ minimumDiscount: value })}
                >
                  <SelectTrigger className="w-full h-12">
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
              </div>

              {/* Listing Types */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">Listing Types I'm Interested In</Label>
                <div className="space-y-3">
                  <ListingTypePreference
                    id="auction-preference"
                    type="auction"
                    title="Auction-Based Sourcing"
                    description="Place bids on live lots, competing in time-bound auctions"
                    checked={preferences.preferredTypes.includes('auction')}
                    onToggle={(checked) => handleListingTypeToggle('auction', checked)}
                  />

                  <ListingTypePreference
                    id="catalog-preference"
                    type="catalog"
                    title="Offer-Based Sourcing"
                    description="Browse available catalog listings and submit a private offer on specific items"
                    checked={preferences.preferredTypes.includes('catalog')}
                    onToggle={(checked) => handleListingTypeToggle('catalog', checked)}
                  />
                </div>
              </div>

              {/* Selling Platforms */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-900">Where I Sell</Label>
                <p className="text-sm text-gray-600">
                  Select the platforms where you sell to get more relevant inventory recommendations.
                </p>

                <div className="space-y-3">
                  {Object.entries(SELLING_PLATFORM_DETAILS).map(([key, platform]) => (
                    <div key={key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={`platform-${key}`}
                        checked={preferences.sellingPlatforms[key as keyof typeof preferences.sellingPlatforms]}
                        onCheckedChange={(checked) =>
                          updateSellingPlatform(key as keyof typeof preferences.sellingPlatforms, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`platform-${key}`}
                          className="text-sm font-medium text-gray-900 cursor-pointer block"
                        >
                          {platform.title}
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPlatformsCount > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected platforms ({selectedPlatformsCount}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getSelectedSellingPlatforms().map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {SELLING_PLATFORM_DETAILS[platform as keyof typeof SELLING_PLATFORM_DETAILS]?.title || platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handleResetPreferences}
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset All Preferences
                </Button>

                <Button
                  onClick={handleSavePreferences}
                  className="px-8 py-3 w-full sm:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 