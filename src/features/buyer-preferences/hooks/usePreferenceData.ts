"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_PREFERENCES } from "../data/preferenceOptions";
import type { BuyerPreferences } from "../types/preferences";

const STORAGE_KEY = "buyer-preferences";

// Error types for better error handling
interface PreferenceError {
  code: "STORAGE_ERROR" | "VALIDATION_ERROR" | "UNKNOWN_ERROR";
  message: string;
}

// Helper functions
const hasValidPreferenceStructure = (
  prefs: unknown
): prefs is BuyerPreferences => {
  if (!prefs || typeof prefs !== "object") {
    return false;
  }

  const p = prefs as Partial<BuyerPreferences>;
  return (
    Array.isArray(p.brands) &&
    Array.isArray(p.categories) &&
    Array.isArray(p.subcategories) &&
    Array.isArray(p.preferredTypes) &&
    typeof p.sellingPlatforms === "object" &&
    p.sellingPlatforms !== null
  );
};

const calculateProgress = (
  prefs: BuyerPreferences,
  platforms: string[]
): number => {
  let completed = 0;
  const total = 8;

  if (prefs.brands.length > 0) {
    completed++;
  }
  if (prefs.categories.length > 0) {
    completed++;
  }
  if (prefs.minBudget !== null || prefs.maxBudget !== null) {
    completed++;
  }
  if (prefs.minimumDiscount) {
    completed++;
  }
  if (prefs.preferredTypes.length > 0) {
    completed++;
  }
  if ((prefs.conditions || []).length > 0) {
    completed++;
  }
  if (platforms.length > 0) {
    completed++;
  }
  if (prefs.isCompleted) {
    completed++;
  }

  return Math.round((completed / total) * 100);
};

// Custom hook with optimized performance and error handling
export const usePreferenceData = () => {
  const [preferences, setPreferences] =
    useState<BuyerPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PreferenceError | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedPreferences = localStorage.getItem(STORAGE_KEY);
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);

          if (hasValidPreferenceStructure(parsed)) {
            setPreferences(parsed);
          } else {
            throw new Error("Invalid preferences format");
          }
        }
      } catch (err) {
        const storageError: PreferenceError = {
          code: "STORAGE_ERROR",
          message:
            err instanceof Error ? err.message : "Failed to load preferences",
        };
        setError(storageError);
        setPreferences({ ...DEFAULT_PREFERENCES });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save function with error handling
  const savePreferences = useCallback((newPreferences: BuyerPreferences) => {
    try {
      setError(null);

      if (!hasValidPreferenceStructure(newPreferences)) {
        throw new Error("Invalid preferences data");
      }

      setPreferences(newPreferences);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (err) {
      const saveError: PreferenceError = {
        code: "STORAGE_ERROR",
        message:
          err instanceof Error ? err.message : "Failed to save preferences",
      };
      setError(saveError);
      throw saveError;
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback(
    (updates: Partial<BuyerPreferences>) => {
      const newPreferences = { ...preferences, ...updates };
      savePreferences(newPreferences);
    },
    [preferences, savePreferences]
  );

  // Toggle functions
  const toggleBrand = useCallback(
    (brand: string) => {
      if (!brand.trim()) {
        return;
      }

      const newBrands = preferences.brands.includes(brand)
        ? preferences.brands.filter((b) => b !== brand)
        : [...new Set([...preferences.brands, brand])];

      updatePreferences({ brands: newBrands });
    },
    [preferences.brands, updatePreferences]
  );

  const toggleCategory = useCallback(
    (category: string) => {
      if (!category.trim()) {
        return;
      }

      const newCategories = preferences.categories.includes(category)
        ? preferences.categories.filter((c) => c !== category)
        : [...new Set([...preferences.categories, category])];

      const newSubcategories = preferences.subcategories.filter(() => {
        return newCategories.length > 0;
      });

      updatePreferences({
        categories: newCategories,
        subcategories: newSubcategories,
      });
    },
    [preferences.categories, preferences.subcategories, updatePreferences]
  );

  const toggleSubcategory = useCallback(
    (subcategory: string) => {
      if (!subcategory.trim()) {
        return;
      }

      const newSubcategories = preferences.subcategories.includes(subcategory)
        ? preferences.subcategories.filter((s) => s !== subcategory)
        : [...new Set([...preferences.subcategories, subcategory])];

      updatePreferences({ subcategories: newSubcategories });
    },
    [preferences.subcategories, updatePreferences]
  );

  const toggleCondition = useCallback(
    (condition: string) => {
      if (!condition.trim()) {
        return;
      }

      const currentConditions = preferences.conditions || [];
      const newConditions = currentConditions.includes(condition)
        ? currentConditions.filter((c) => c !== condition)
        : [...new Set([...currentConditions, condition])];

      updatePreferences({ conditions: newConditions });
    },
    [preferences.conditions, updatePreferences]
  );

  const updateSellingPlatform = useCallback(
    (platform: keyof BuyerPreferences["sellingPlatforms"], value: boolean) => {
      const newSellingPlatforms = {
        ...preferences.sellingPlatforms,
        [platform]: value,
      };

      updatePreferences({ sellingPlatforms: newSellingPlatforms });
    },
    [preferences.sellingPlatforms, updatePreferences]
  );

  const clearPreferences = useCallback(() => {
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    const resetPreferences = { ...DEFAULT_PREFERENCES };
    setPreferences(resetPreferences);
  }, []);

  // Computed values
  const computedValues = useMemo(() => {
    const selectedSellingPlatforms = Object.entries(
      preferences.sellingPlatforms
    )
      .filter(([_, value]) => value)
      .map(([key, _]) => key);

    const completionPercentage = calculateProgress(
      preferences,
      selectedSellingPlatforms
    );

    const hasAnyPreferences =
      preferences.brands.length > 0 ||
      preferences.categories.length > 0 ||
      preferences.subcategories.length > 0 ||
      preferences.minBudget !== null ||
      preferences.maxBudget !== null ||
      preferences.minimumDiscount !== "" ||
      preferences.preferredTypes.length > 0 ||
      selectedSellingPlatforms.length > 0;

    return {
      selectedSellingPlatforms,
      completionPercentage,
      hasAnyPreferences,
    };
  }, [preferences]);

  const getSelectedSellingPlatforms = useCallback(() => {
    return computedValues.selectedSellingPlatforms;
  }, [computedValues.selectedSellingPlatforms]);

  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    updatePreferences,
    toggleBrand,
    toggleCategory,
    toggleSubcategory,
    toggleCondition,
    updateSellingPlatform,
    clearPreferences,
    ...computedValues,
    getSelectedSellingPlatforms,
    validatePreferences: hasValidPreferenceStructure,
  };
};
