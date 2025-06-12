'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { BuyerProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { AuthRequiredLayout } from '@/src/components/auth/AuthRequiredLayout';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
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
import { ChevronDown, X } from 'lucide-react';

// Preference options data
const DISCOUNT_OPTIONS = [
  { value: 'no-preference', label: 'No preference' },
  { value: '10-20', label: '10-20%' },
  { value: '20-30', label: '20-30%' },
  { value: '30-50', label: '30-50%' },
  { value: '50-plus', label: '50%+' },
];

const CATEGORY_OPTIONS = [
  'Accessories/Tools', 'Bath & Body', 'Haircare', 'Makeup', 'Skincare', 'Food', 'Active Gear',
  'Bedding & Bath', 'Decor', 'Electronics', 'Furniture', 'Housewares', 'Luggage', 'Pantry',
  'Paper & Novelty', 'Pet', 'Tools & Home Improvement', 'Toys', 'Vitamins & Supplements', 'Window'
];

const BRAND_OPTIONS = [
  'Lulu Dharma', 'Lulu and Georgia', 'Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'LG',
  'West Elm', 'Pottery Barn', 'Williams Sonoma', 'Target', 'Home Depot', 'Lowes'
];

const SPECIALTY_OPTIONS = [
  'Contemporary', 'Luxury', 'Vintage', 'Modern', 'Traditional', 'Minimalist', 'Industrial', 'Rustic'
];

const SELLING_PLATFORMS = [
  'Amazon or Walmart', 'Discount Retail', 'Reseller Marketplaces', 
  'eBay', 'Facebook Marketplace', 'Physical Store', 'Online Store'
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 
  'Australia', 'Japan', 'South Korea', 'China', 'India', 'Brazil', 'Mexico'
];

function PreferencesPage() {
  // State for all preferences
  const [preferredDiscount, setPreferredDiscount] = useState('no-preference');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Accessories/Tools', 'Bath & Body', 'Haircare', 'Makeup', 'Skincare', 'Food', 'Active Gear']);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Lulu Dharma', 'Lulu and Georgia']);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Contemporary', 'Luxury']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Amazon or Walmart', 'Discount Retail', 'Reseller Marketplaces']);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Helper functions
  const toggleSelection = (item: string, selectedItems: string[], setSelectedItems: (items: string[]) => void) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeSelection = (item: string, selectedItems: string[], setSelectedItems: (items: string[]) => void) => {
    setSelectedItems(selectedItems.filter(i => i !== item));
  };

  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selectedItems, 
    setSelectedItems, 
    placeholder = "Select options..."
  }: {
    label: string;
    options: string[];
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    placeholder?: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-900">{label}</Label>
      <div className="max-w-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between h-auto min-h-[44px] text-left font-normal border-gray-300 hover:bg-gray-50"
            >
              <span className="text-gray-700">
                {selectedItems.length > 0 ? `${selectedItems.length} selected` : placeholder}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={selectedItems.includes(option)}
                onCheckedChange={() => toggleSelection(option, selectedItems, setSelectedItems)}
                className="cursor-pointer"
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Selected items as chips */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge 
              key={item} 
              variant="secondary" 
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              {item}
              <button
                onClick={() => removeSelection(item, selectedItems, setSelectedItems)}
                className="ml-2 hover:text-gray-900 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <BuyerProtectedRoute>
      <AuthRequiredLayout>
        <div className="max-w-8xl mx-auto px-8 py-4 lg:py-4">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Preferences</h1>
                <Button variant="outline" size="sm" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                  ✓ Preferences saved
                </Button>
              </div>
              <p className="text-sm lg:text-base text-muted-foreground">
                Make updates to your preferences here, which help power the best recommendations suited just for you.
              </p>
            </div>
          
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-8">
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
              
              <div className="space-y-8">
                {/* My Preferred Discount */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">My Preferred Discount</Label>
                  <Select value={preferredDiscount} onValueChange={setPreferredDiscount}>
                    <SelectTrigger className="w-full max-w-md">
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

                {/* Categories I prefer */}
                <MultiSelectDropdown
                  label="Categories I prefer"
                  options={CATEGORY_OPTIONS}
                  selectedItems={selectedCategories}
                  setSelectedItems={setSelectedCategories}
                  placeholder="Select categories..."
                />

                {/* Brands I prefer */}
                <MultiSelectDropdown
                  label="Brands I prefer"
                  options={BRAND_OPTIONS}
                  selectedItems={selectedBrands}
                  setSelectedItems={setSelectedBrands}
                  placeholder="Select brands..."
                />

                {/* Specialties I prefer */}
                <MultiSelectDropdown
                  label="Specialties I prefer"
                  options={SPECIALTY_OPTIONS}
                  selectedItems={selectedSpecialties}
                  setSelectedItems={setSelectedSpecialties}
                  placeholder="Select specialties..."
                />

                {/* Where I sell */}
                <MultiSelectDropdown
                  label="Where I sell"
                  options={SELLING_PLATFORMS}
                  selectedItems={selectedPlatforms}
                  setSelectedItems={setSelectedPlatforms}
                  placeholder="Select selling platforms..."
                />

                {/* Countries I purchase from */}
                <MultiSelectDropdown
                  label="Countries I purchase from"
                  options={COUNTRIES}
                  selectedItems={selectedCountries}
                  setSelectedItems={setSelectedCountries}
                  placeholder="Select countries..."
                />

                {/* Target pricing per item */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Target pricing per item</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                    <div>
                      <Input
                        type="number"
                        placeholder="Add min."
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="text-gray-700"
                        suppressHydrationWarning
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Add max."
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="text-gray-700"
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <Button className="px-8 py-3">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </AuthRequiredLayout>
    </BuyerProtectedRoute>
  );
}

// Export the component directly without HOC
export default PreferencesPage; 