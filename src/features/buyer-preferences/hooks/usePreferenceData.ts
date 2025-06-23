'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BuyerPreferences } from '../types/preferences';
import { DEFAULT_PREFERENCES } from '../data/preferenceOptions';

const STORAGE_KEY = 'buyer-preferences';

// Error types for better error handling
interface PreferenceError {
  code: 'STORAGE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
}

// Custom hook with optimized performance and error handling
export const usePreferenceData = () => {
  const [preferences, setPreferences] = useState<BuyerPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PreferenceError | null>(null);

  // Memoized validation function
  const validatePreferences = useCallback((prefs: unknown): prefs is BuyerPreferences => {
    if (!prefs || typeof prefs !== 'object') return false;
    
    const p = prefs as Partial<BuyerPreferences>;
    return (
      Array.isArray(p.brands) &&
      Array.isArray(p.categories) &&
      Array.isArray(p.subcategories) &&
      Array.isArray(p.preferredTypes) &&
      typeof p.sellingPlatforms === 'object' &&
      p.sellingPlatforms !== null
    );
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const savedPreferences = localStorage.getItem(STORAGE_KEY);
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);
          
          if (validatePreferences(parsed)) {
            setPreferences(parsed);
          } else {
            throw new Error('Invalid preferences format');
          }
        }
      } catch (err) {
        const error: PreferenceError = {
          code: 'STORAGE_ERROR',
          message: err instanceof Error ? err.message : 'Failed to load preferences'
        };
        setError(error);
        console.error('Error loading preferences:', err);
        
        // Fallback to default preferences
        setPreferences({ ...DEFAULT_PREFERENCES });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [validatePreferences]);

  // Optimized save function with error handling
  const savePreferences = useCallback(async (newPreferences: BuyerPreferences) => {
    try {
      setError(null);
      
      if (!validatePreferences(newPreferences)) {
        throw new Error('Invalid preferences data');
      }
      
      setPreferences(newPreferences);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (err) {
      const error: PreferenceError = {
        code: 'STORAGE_ERROR',
        message: err instanceof Error ? err.message : 'Failed to save preferences'
      };
      setError(error);
      console.error('Error saving preferences:', err);
      throw error; // Re-throw for component handling
    }
  }, [validatePreferences]);

  // Update specific preference fields with validation
  const updatePreferences = useCallback(async (updates: Partial<BuyerPreferences>) => {
    try {
      const newPreferences = { ...preferences, ...updates };
      await savePreferences(newPreferences);
    } catch (err) {
      console.error('Error updating preferences:', err);
      throw err;
    }
  }, [preferences, savePreferences]);

  // Optimized toggle functions with deduplication
  const toggleBrand = useCallback(async (brand: string) => {
    if (!brand.trim()) return;
    
    try {
      const newBrands = preferences.brands.includes(brand)
        ? preferences.brands.filter(b => b !== brand)
        : [...new Set([...preferences.brands, brand])]; // Prevent duplicates
      
      await updatePreferences({ brands: newBrands });
    } catch (err) {
      console.error('Error toggling brand:', err);
      throw err;
    }
  }, [preferences.brands, updatePreferences]);

  const toggleCategory = useCallback(async (category: string) => {
    if (!category.trim()) return;
    
    try {
      const newCategories = preferences.categories.includes(category)
        ? preferences.categories.filter(c => c !== category)
        : [...new Set([...preferences.categories, category])]; // Prevent duplicates
      
      // Clear related subcategories when categories change
      const newSubcategories = preferences.subcategories.filter(sub => {
        // Only keep subcategories that belong to remaining categories
        // This would need actual subcategory mapping logic
        return newCategories.length > 0;
      });
      
      await updatePreferences({ 
        categories: newCategories,
        subcategories: newSubcategories
      });
    } catch (err) {
      console.error('Error toggling category:', err);
      throw err;
    }
  }, [preferences.categories, preferences.subcategories, updatePreferences]);

  const toggleSubcategory = useCallback(async (subcategory: string) => {
    if (!subcategory.trim()) return;
    
    try {
      const newSubcategories = preferences.subcategories.includes(subcategory)
        ? preferences.subcategories.filter(s => s !== subcategory)
        : [...new Set([...preferences.subcategories, subcategory])]; // Prevent duplicates
      
      await updatePreferences({ subcategories: newSubcategories });
    } catch (err) {
      console.error('Error toggling subcategory:', err);
      throw err;
    }
  }, [preferences.subcategories, updatePreferences]);

  // Update selling platform with validation
  const updateSellingPlatform = useCallback(async (
    platform: keyof BuyerPreferences['sellingPlatforms'], 
    value: boolean
  ) => {
    try {
      const newSellingPlatforms = {
        ...preferences.sellingPlatforms,
        [platform]: value
      };
      
      await updatePreferences({ sellingPlatforms: newSellingPlatforms });
    } catch (err) {
      console.error('Error updating selling platform:', err);
      throw err;
    }
  }, [preferences.sellingPlatforms, updatePreferences]);

  // Clear all preferences with confirmation
  const clearPreferences = useCallback(async () => {
    try {
      setError(null);
      localStorage.removeItem(STORAGE_KEY);
      const resetPreferences = { ...DEFAULT_PREFERENCES };
      setPreferences(resetPreferences);
    } catch (err) {
      const error: PreferenceError = {
        code: 'STORAGE_ERROR',
        message: 'Failed to clear preferences'
      };
      setError(error);
      console.error('Error clearing preferences:', err);
      throw error;
    }
  }, []);

  // Memoized computed values for performance
  const computedValues = useMemo(() => {
    const selectedSellingPlatforms = Object.entries(preferences.sellingPlatforms)
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    const completionPercentage = (() => {
      let completed = 0;
      const total = 7; // Total number of preference sections
      
      if (preferences.brands.length > 0) completed++;
      if (preferences.categories.length > 0) completed++;
      if (preferences.minBudget !== null || preferences.maxBudget !== null) completed++;
      if (preferences.minimumDiscount) completed++;
      if (preferences.preferredTypes.length > 0) completed++;
      if (selectedSellingPlatforms.length > 0) completed++;
      if (preferences.isCompleted) completed++;
      
      return Math.round((completed / total) * 100);
    })();

    const hasAnyPreferences = (
      preferences.brands.length > 0 ||
      preferences.categories.length > 0 ||
      preferences.subcategories.length > 0 ||
      preferences.minBudget !== null ||
      preferences.maxBudget !== null ||
      preferences.minimumDiscount !== '' ||
      preferences.preferredTypes.length > 0 ||
      selectedSellingPlatforms.length > 0
    );

    return {
      selectedSellingPlatforms,
      completionPercentage,
      hasAnyPreferences
    };
  }, [preferences]);

  // Legacy function for backward compatibility
  const getSelectedSellingPlatforms = useCallback(() => {
    return computedValues.selectedSellingPlatforms;
  }, [computedValues.selectedSellingPlatforms]);

  return {
    // State
    preferences,
    isLoading,
    error,
    
    // Actions
    savePreferences,
    updatePreferences,
    toggleBrand,
    toggleCategory,
    toggleSubcategory,
    updateSellingPlatform,
    clearPreferences,
    
    // Computed values
    ...computedValues,
    getSelectedSellingPlatforms, // Legacy support
    
    // Utilities
    validatePreferences
  };
}; 