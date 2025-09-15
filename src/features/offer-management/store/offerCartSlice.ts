/**
 * OFFER CART SLICE (Catalog-Scoped Offer Management)
 *
 * PURPOSE:
 * This slice manages catalog-scoped offer cart functionality where each catalog listing
 * maintains its own independent offer state. This prevents mixing products from different
 * catalogs and provides a cleaner user experience.
 *
 * ARCHITECTURE:
 * - Each catalog has its own CatalogOffer with independent state
 * - Current catalog context determines which offer is displayed
 * - All operations are scoped to the current catalog
 * - localStorage persistence maintains separation between catalogs
 *
 * DATA FLOW:
 * 1. User enters catalog page → setCatalogContext (sets current catalog)
 * 2. User selects products → addToCatalogOffer (adds to current catalog's offer)
 * 3. User views summary → displays current catalog's offer only
 * 4. User can switch catalogs → different catalog context shows different offer
 */
import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  CatalogContext,
  CatalogOffer,
  GroupedProduct,
  MultiCatalogOfferSummary,
  OfferCartItem,
  OfferCartState,
} from "../types";

/**
 * INITIAL STATE
 *
 * Starts with empty catalog-scoped state structure.
 * State is loaded from localStorage on client-side initialization.
 */
const initialState: OfferCartState = {
  offersByCatalog: {},
  currentCatalogId: null,
  isSubmitting: false,
  error: null,

  // Legacy fields for backward compatibility
  items: [],
  expandedProducts: {},
};

/**
 * LOCALSTORAGE HELPER FUNCTIONS
 *
 * Enhanced to handle catalog-scoped persistence with proper error handling.
 * Maintains separation between different catalog offers.
 */

/**
 * Save catalog-scoped state to localStorage (client-side only)
 * @param state - Current offer cart state with catalog separation
 */
const saveState = (state: OfferCartState) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Convert Date objects to timestamps for serialization
    const serializableState = {
      offersByCatalog: Object.fromEntries(
        Object.entries(state.offersByCatalog).map(([catalogId, offer]) => [
          catalogId,
          {
            ...offer,
            lastUpdated:
              offer.lastUpdated instanceof Date
                ? offer.lastUpdated.getTime()
                : offer.lastUpdated,
          },
        ])
      ),
      currentCatalogId: state.currentCatalogId,
    };

    const serializedState = JSON.stringify(serializableState);
    localStorage.setItem("catalogOfferState", serializedState);
  } catch {
    // Silent error handling for localStorage failures
  }
};

/**
 * Load catalog-scoped state from localStorage (client-side only)
 * @returns Loaded state or empty state if not available
 */
const loadState = (): Partial<OfferCartState> => {
  if (typeof window === "undefined") {
    return { offersByCatalog: {}, currentCatalogId: null };
  }

  try {
    const serializedState = localStorage.getItem("catalogOfferState");
    if (serializedState === null) {
      return { offersByCatalog: {}, currentCatalogId: null };
    }
    return JSON.parse(serializedState);
  } catch {
    // Clear corrupted localStorage data and return empty state
    localStorage.removeItem("catalogOfferState");
    return { offersByCatalog: {}, currentCatalogId: null };
  }
};

/**
 * Clear catalog-scoped state from localStorage
 */
const clearLocalStorageState = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("catalogOfferState");
  }
};

/**
 * Sanitize loaded offer data to ensure proper structure
 */
const sanitizeLoadedOffer = (
  offer: unknown,
  catalogId: string
): CatalogOffer => {
  const safeOffer = offer as Record<string, unknown>;

  // Handle lastUpdated - could be Date string, number, or Date object
  let lastUpdated: Date | number = Date.now();
  if (typeof safeOffer.lastUpdated === "number") {
    lastUpdated = safeOffer.lastUpdated;
  } else if (typeof safeOffer.lastUpdated === "string") {
    const parsed = new Date(safeOffer.lastUpdated);
    lastUpdated = Number.isNaN(parsed.getTime())
      ? Date.now()
      : parsed.getTime();
  }

  return {
    catalogId: (safeOffer.catalogId as string) || catalogId,
    catalogTitle: (safeOffer.catalogTitle as string) || "Unknown Catalog",
    sellerInfo: safeOffer.sellerInfo as string | undefined,
    minimumOrderValue:
      typeof safeOffer.minimumOrderValue === "number"
        ? safeOffer.minimumOrderValue
        : 0,
    items: Array.isArray(safeOffer.items) ? safeOffer.items : [],
    expandedProducts:
      (safeOffer.expandedProducts as Record<string, boolean>) || {},
    lastUpdated,
    totalValue:
      typeof safeOffer.totalValue === "number" ? safeOffer.totalValue : 0,
    totalQuantity:
      typeof safeOffer.totalQuantity === "number" ? safeOffer.totalQuantity : 0,
  };
};

/**
 * Create empty catalog offer
 * @param catalogContext - Catalog information
 * @returns New empty CatalogOffer
 */
const createEmptyCatalogOffer = (
  catalogContext: CatalogContext
): CatalogOffer => ({
  catalogId: catalogContext.catalogId,
  catalogTitle: catalogContext.catalogTitle,
  sellerInfo: catalogContext.sellerInfo,
  minimumOrderValue: catalogContext.minimumOrderValue ?? 0,
  items: [],
  expandedProducts: {},
  lastUpdated: Date.now(),
  totalValue: 0,
  totalQuantity: 0,
});

/**
 * Calculate catalog offer totals
 * @param offer - CatalogOffer to calculate totals for
 * @returns Updated offer with calculated totals
 */
const calculateOfferTotals = (offer: CatalogOffer): CatalogOffer => {
  const totalValue = offer.items.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const totalQuantity = offer.items.reduce(
    (sum, item) => sum + item.selectedQuantity,
    0
  );

  return {
    ...offer,
    totalValue,
    totalQuantity,
    lastUpdated: Date.now(),
  };
};

/**
 * CATALOG-SCOPED OFFER CART SLICE
 *
 * All actions now operate within catalog context to maintain separation.
 */
const offerCartSlice = createSlice({
  name: "offerCart",
  initialState,
  reducers: {
    /**
     * SET CATALOG CONTEXT
     *
     * Sets the current catalog context for offer operations.
     * Creates empty offer if catalog doesn't exist yet.
     *
     * @param action.payload - CatalogContext for the current catalog
     */
    setCatalogContext: (state, action: PayloadAction<CatalogContext>) => {
      const { catalogId } = action.payload;
      state.currentCatalogId = catalogId;

      // ONLY create empty offer if catalog truly doesn't exist
      if (state.offersByCatalog[catalogId]) {
        // Update existing offer's minimumOrderValue to ensure it's current
        const existingOffer = state.offersByCatalog[catalogId];
        existingOffer.minimumOrderValue = action.payload.minimumOrderValue ?? 0;
        existingOffer.catalogTitle = action.payload.catalogTitle; // Also update title in case it changed
      } else {
        state.offersByCatalog[catalogId] = createEmptyCatalogOffer(
          action.payload
        );
      }

      // Update legacy items field for backward compatibility
      state.items = state.offersByCatalog[catalogId]?.items || [];
      state.expandedProducts =
        state.offersByCatalog[catalogId]?.expandedProducts || {};

      // Save to localStorage
      saveState(state);
    },

    /**
     * ADD TO CATALOG OFFER
     *
     * Adds item to the current catalog's offer only.
     * Creates catalog offer if it doesn't exist.
     *
     * @param action.payload - OfferCartItem to add to current catalog
     */
    addToCatalogOffer: (state, action: PayloadAction<OfferCartItem>) => {
      const { currentCatalogId } = state;
      if (!currentCatalogId) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      if (!catalogOffer) {
        return;
      }

      // Check if item already exists
      const existingIndex = catalogOffer.items.findIndex(
        (item) =>
          item.catalogProductId === action.payload.catalogProductId &&
          item.variantSku === action.payload.variantSku
      );

      if (existingIndex !== -1) {
        // Update existing item
        catalogOffer.items[existingIndex] = action.payload;
      } else {
        // Add new item
        catalogOffer.items.push(action.payload);
      }

      // Recalculate totals and update
      state.offersByCatalog[currentCatalogId] =
        calculateOfferTotals(catalogOffer);

      // Update legacy fields for backward compatibility
      state.items = state.offersByCatalog[currentCatalogId].items;

      // Save to localStorage
      saveState(state);
    },

    /**
     * ADD ALL VARIANTS TO CATALOG OFFER
     *
     * Adds all variants of a product to the current catalog's offer.
     * Used for bulk operations like "Add All" button.
     *
     * @param action.payload.catalogProductId - Product ID
     * @param action.payload.productName - Product name
     * @param action.payload.variants - Array of variant data to add
     */
    addAllVariantsToCatalogOffer: (
      state,
      action: PayloadAction<{
        catalogProductId: string;
        productName: string;
        variants: Array<{
          variantSku: string;
          variantId: string;
          name: string;
          pricePerUnit: number;
          totalUnits: number;
          totalPrice: number;
          // Add new fields
          identifier?: string | null;
          identifier_type?: string | null;
          category?: string | null;
          subcategory?: string | null;
          packaging?: string | null;
          product_condition?: string | null;
        }>;
      }>
    ) => {
      const { currentCatalogId } = state;
      if (!currentCatalogId) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      if (!catalogOffer) {
        return;
      }

      const { catalogProductId, productName, variants } = action.payload;

      // Remove existing variants for this product first
      catalogOffer.items = catalogOffer.items.filter(
        (item) => item.catalogProductId !== catalogProductId
      );

      // Add all new variants
      for (const variant of variants) {
        const offerItem: OfferCartItem = {
          catalogProductId,
          variantSku: variant.variantSku,
          variantId: variant.variantId,
          productName,
          variantName: variant.name,
          selectedQuantity: variant.totalUnits,
          availableQuantity: variant.totalUnits,
          retailPrice: variant.pricePerUnit,
          offerPrice: variant.pricePerUnit,
          pricePerUnit: variant.pricePerUnit,
          totalPrice: variant.totalPrice,
          listingImage: "",
          productImage: "",
          variantImage: "",
          // Use variant fields or null
          identifier: variant.identifier || null,
          identifier_type: variant.identifier_type || null,
          category: variant.category || null,
          subcategory: variant.subcategory || null,
          packaging: variant.packaging || null,
          product_condition: variant.product_condition || null,
        };

        catalogOffer.items.push(offerItem);
      }

      // Recalculate totals and update
      state.offersByCatalog[currentCatalogId] =
        calculateOfferTotals(catalogOffer);

      // Update legacy fields for backward compatibility
      state.items = state.offersByCatalog[currentCatalogId].items;

      // Save to localStorage
      saveState(state);
    },

    /**
     * REMOVE FROM CATALOG OFFER
     *
     * Removes specific item from current catalog's offer.
     *
     * @param action.payload.catalogProductId - Product ID to remove
     * @param action.payload.variantSku - Variant SKU to remove
     */
    removeFromCatalogOffer: (
      state,
      action: PayloadAction<{ catalogProductId: string; variantSku: string }>
    ) => {
      const { currentCatalogId } = state;
      if (!(currentCatalogId && state.offersByCatalog[currentCatalogId])) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      catalogOffer.items = catalogOffer.items.filter(
        (item) =>
          !(
            item.catalogProductId === action.payload.catalogProductId &&
            item.variantSku === action.payload.variantSku
          )
      );

      // Recalculate totals and update
      state.offersByCatalog[currentCatalogId] =
        calculateOfferTotals(catalogOffer);

      // Update legacy fields
      state.items = catalogOffer.items;

      // Save to localStorage
      saveState(state);
    },

    /**
     * REMOVE PRODUCT FROM CATALOG OFFER
     *
     * Removes all variants of a product from current catalog's offer.
     *
     * @param action.payload.catalogProductId - Product ID to remove
     */
    removeProductFromCatalogOffer: (
      state,
      action: PayloadAction<{ catalogProductId: string }>
    ) => {
      const { currentCatalogId } = state;
      if (!(currentCatalogId && state.offersByCatalog[currentCatalogId])) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      catalogOffer.items = catalogOffer.items.filter(
        (item) => item.catalogProductId !== action.payload.catalogProductId
      );

      // Recalculate totals and update
      state.offersByCatalog[currentCatalogId] =
        calculateOfferTotals(catalogOffer);

      // Update legacy fields
      state.items = catalogOffer.items;

      // Save to localStorage
      saveState(state);
    },

    /**
     * CLEAR CATALOG OFFER
     *
     * Clears all items from current catalog's offer.
     */
    clearCatalogOffer: (state) => {
      const { currentCatalogId } = state;
      if (!(currentCatalogId && state.offersByCatalog[currentCatalogId])) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      catalogOffer.items = [];
      catalogOffer.expandedProducts = {};

      // Recalculate totals
      state.offersByCatalog[currentCatalogId] =
        calculateOfferTotals(catalogOffer);

      // Update legacy fields
      state.items = [];
      state.expandedProducts = {};

      // Save to localStorage
      saveState(state);
    },

    /**
     * CLEAR ALL OFFERS
     *
     * Clears offers from all catalogs.
     */
    clearAllOffers: (state) => {
      state.offersByCatalog = {};
      state.currentCatalogId = null;

      // Update legacy fields
      state.items = [];
      state.expandedProducts = {};

      // Save to localStorage
      saveState(state);
    },

    /**
     * CLEAR STORED STATE
     *
     * Clears localStorage and resets state to initial values.
     * Useful for fixing corrupted data issues.
     */
    clearStoredState: (state) => {
      clearLocalStorageState();
      state.offersByCatalog = {};
      state.currentCatalogId = null;
      state.items = [];
      state.expandedProducts = {};
    },

    /**
     * TOGGLE PRODUCT EXPANSION IN CATALOG
     *
     * Toggles expansion state for product in current catalog's offer.
     *
     * @param action.payload.catalogProductId - Product ID to toggle
     */
    toggleProductExpansionInCatalog: (
      state,
      action: PayloadAction<{ catalogProductId: string }>
    ) => {
      const { currentCatalogId } = state;
      if (!(currentCatalogId && state.offersByCatalog[currentCatalogId])) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      const { catalogProductId } = action.payload;

      catalogOffer.expandedProducts[catalogProductId] =
        !catalogOffer.expandedProducts[catalogProductId];

      // Update last modified time
      catalogOffer.lastUpdated = Date.now();

      // Update legacy fields
      state.expandedProducts = catalogOffer.expandedProducts;

      // Save to localStorage
      saveState(state);
    },

    /**
     * UPDATE VARIANT IN CATALOG SUMMARY
     *
     * Updates variant properties in current catalog's offer.
     *
     * @param action.payload.catalogProductId - Product ID
     * @param action.payload.variantSku - Variant SKU
     * @param action.payload.updates - Partial updates to apply
     */
    updateVariantInCatalogSummary: (
      state,
      action: PayloadAction<{
        catalogProductId: string;
        variantSku: string;
        updates: Partial<OfferCartItem>;
      }>
    ) => {
      const { currentCatalogId } = state;
      if (!(currentCatalogId && state.offersByCatalog[currentCatalogId])) {
        return;
      }

      const catalogOffer = state.offersByCatalog[currentCatalogId];
      const { catalogProductId, variantSku, updates } = action.payload;

      const itemIndex = catalogOffer.items.findIndex(
        (item) =>
          item.catalogProductId === catalogProductId &&
          item.variantSku === variantSku
      );

      if (itemIndex !== -1) {
        // Apply updates and recalculate total price if relevant
        const item = { ...catalogOffer.items[itemIndex], ...updates };

        if (
          updates.selectedQuantity !== undefined ||
          updates.pricePerUnit !== undefined
        ) {
          item.totalPrice = item.pricePerUnit * item.selectedQuantity;
        }

        catalogOffer.items[itemIndex] = item;

        // Recalculate catalog totals
        state.offersByCatalog[currentCatalogId] =
          calculateOfferTotals(catalogOffer);

        // Update legacy fields
        state.items = catalogOffer.items;

        // Save to localStorage
        saveState(state);
      }
    },

    /**
     * INITIALIZE FROM STORAGE
     *
     * Loads catalog-scoped state from localStorage on app initialization.
     * Ensures all data is properly formatted (no Date objects).
     */
    initializeFromStorage: (state) => {
      const loadedState = loadState();

      if (
        loadedState.offersByCatalog &&
        typeof loadedState.offersByCatalog === "object"
      ) {
        const sanitizedOffers: Record<string, CatalogOffer> = {};
        for (const [catalogId, offer] of Object.entries(
          loadedState.offersByCatalog
        )) {
          if (offer && typeof offer === "object") {
            sanitizedOffers[catalogId] = sanitizeLoadedOffer(offer, catalogId);
          }
        }
        state.offersByCatalog = sanitizedOffers;
      }

      if (loadedState.currentCatalogId) {
        state.currentCatalogId = loadedState.currentCatalogId;

        // Update legacy fields for current catalog
        const currentOffer =
          state.offersByCatalog[loadedState.currentCatalogId];
        if (currentOffer) {
          state.items = currentOffer.items;
          state.expandedProducts = currentOffer.expandedProducts;
        }
      }
    },

    /**
     * LEGACY ACTIONS (Backward Compatibility)
     *
     * These actions maintain backward compatibility with existing code.
     * They operate on the current catalog context.
     */
    addToOffer: (state, action: PayloadAction<OfferCartItem>) => {
      // Delegate to catalog-scoped action
      offerCartSlice.caseReducers.addToCatalogOffer(state, action);
    },

    removeFromOffer: (
      state,
      action: PayloadAction<{ catalogProductId: string; variantSku: string }>
    ) => {
      // Delegate to catalog-scoped action
      offerCartSlice.caseReducers.removeFromCatalogOffer(state, action);
    },

    removeProductFromOffer: (
      state,
      action: PayloadAction<{ catalogProductId: string }>
    ) => {
      // Delegate to catalog-scoped action
      offerCartSlice.caseReducers.removeProductFromCatalogOffer(state, action);
    },

    clearOffer: (state) => {
      // Delegate to catalog-scoped action
      offerCartSlice.caseReducers.clearCatalogOffer(state);
    },

    toggleProductExpansion: (
      state,
      action: PayloadAction<{ catalogProductId: string }>
    ) => {
      // Delegate to catalog-scoped action
      offerCartSlice.caseReducers.toggleProductExpansionInCatalog(
        state,
        action
      );
    },

    updateVariantInSummary: (
      state,
      action: PayloadAction<{
        catalogProductId: string;
        variantSku: string;
        updates: Partial<OfferCartItem>;
      }>
    ) => {
      // Delegate to catalog-scoped action
      offerCartSlice.caseReducers.updateVariantInCatalogSummary(state, action);
    },
  },
});

/**
 * CATALOG-SCOPED SELECTORS
 *
 * These selectors work with the new catalog-scoped state structure.
 * They provide computed values for the current catalog context.
 */

/**
 * Select current catalog context
 */
export const selectCurrentCatalogId = (state: {
  offerCart: OfferCartState;
}) => {
  return state.offerCart.currentCatalogId;
};

/**
 * Select current catalog offer
 */
export const selectCurrentCatalogOffer = (state: {
  offerCart: OfferCartState;
}) => {
  const { currentCatalogId, offersByCatalog } = state.offerCart;
  return currentCatalogId ? offersByCatalog[currentCatalogId] || null : null;
};

/**
 * Select current catalog items (for current catalog only)
 */
export const selectCurrentCatalogItems = createSelector(
  [selectCurrentCatalogOffer],
  (catalogOffer) => catalogOffer?.items || []
);

/**
 * Select current catalog expanded products
 */
export const selectCurrentCatalogExpandedProducts = createSelector(
  [selectCurrentCatalogOffer],
  (catalogOffer) => catalogOffer?.expandedProducts || {}
);

/**
 * Select current catalog totals
 */
export const selectCurrentCatalogTotals = createSelector(
  [selectCurrentCatalogOffer],
  (catalogOffer) => {
    if (!catalogOffer) {
      return {
        totalProducts: 0,
        totalUnits: 0,
        totalPrice: 0,
        totalRetailPrice: 0,
        avgPricePerUnit: 0,
        minimumOrderValue: 0,
        msrpDiscountPercentage: 0,
      };
    }

    const totalProducts = catalogOffer.items.length;
    const totalUnits = catalogOffer.totalQuantity;
    const totalPrice = catalogOffer.totalValue;

    // Calculate total retail price (MSRP)
    const totalRetailPrice = catalogOffer.items.reduce(
      (sum, item) => sum + item.retailPrice * item.selectedQuantity,
      0
    );

    const avgPricePerUnit = totalUnits > 0 ? totalPrice / totalUnits : 0;
    const minimumOrderValue = catalogOffer.minimumOrderValue ?? 0;

    // Calculate MSRP discount percentage: (Retail - Asking Price) / Retail * 100
    const msrpDiscountPercentage =
      totalRetailPrice > 0
        ? ((totalRetailPrice - totalPrice) / totalRetailPrice) * 100
        : 0;

    return {
      totalProducts,
      totalUnits,
      totalPrice,
      totalRetailPrice,
      avgPricePerUnit,
      minimumOrderValue,
      msrpDiscountPercentage,
    };
  }
);

/**
 * Select current catalog products grouped by catalogProductId
 */
export const selectCurrentCatalogProductsGrouped = createSelector(
  [selectCurrentCatalogItems],
  (items): GroupedProduct[] => {
    const productMap = new Map<string, GroupedProduct>();

    // Group items by product ID
    for (const item of items) {
      if (!productMap.has(item.catalogProductId)) {
        productMap.set(item.catalogProductId, {
          catalogProductId: item.catalogProductId,
          productName: item.productName,
          totalVariants: 0,
          totalUnits: 0,
          totalPrice: 0,
          avgPricePerUnit: 0,
          retailPrice: item.retailPrice,
          variants: [],
          productImage: item.productImage,
          listingImage: item.listingImage,

          // Legacy fields
          productId: item.catalogProductId,
          msrp: item.retailPrice,
        });
      }

      const product = productMap.get(item.catalogProductId);
      if (product) {
        product.variants.push(item);
        product.totalVariants += 1;
        product.totalUnits += item.selectedQuantity;
        product.totalPrice += item.totalPrice;
      }
    }

    // Calculate average price per unit for each product
    for (const product of productMap.values()) {
      product.avgPricePerUnit =
        product.totalUnits > 0 ? product.totalPrice / product.totalUnits : 0;
    }

    return Array.from(productMap.values());
  }
);

/**
 * Select all catalog offers summary
 */
export const selectAllCatalogOffersSummary = createSelector(
  [(state: { offerCart: OfferCartState }) => state.offerCart.offersByCatalog],
  (offersByCatalog): MultiCatalogOfferSummary => {
    const catalogSummaries = Object.values(offersByCatalog).map((offer) => ({
      catalogId: offer.catalogId,
      catalogTitle: offer.catalogTitle,
      itemCount: offer.items.length,
      totalValue: offer.totalValue,
      totalQuantity: offer.totalQuantity,
    }));

    const totalCatalogs = catalogSummaries.length;
    const totalValue = catalogSummaries.reduce(
      (sum, catalog) => sum + catalog.totalValue,
      0
    );
    const totalQuantity = catalogSummaries.reduce(
      (sum, catalog) => sum + catalog.totalQuantity,
      0
    );

    return {
      totalCatalogs,
      totalValue,
      totalQuantity,
      catalogSummaries,
    };
  }
);

/**
 * Check if current catalog has any items
 */
export const selectCurrentCatalogHasItems = createSelector(
  [selectCurrentCatalogItems],
  (items) => items.length > 0
);

/**
 * Check if a product has variants in current catalog offer
 */
export const selectHasProductInCurrentCatalog = createSelector(
  [
    selectCurrentCatalogItems,
    (_state: { offerCart: OfferCartState }, productId: string) => productId,
  ],
  (items, productId) =>
    items.some((item) => item.catalogProductId === productId)
);

/**
 * LEGACY SELECTORS (Backward Compatibility)
 *
 * These selectors maintain backward compatibility by delegating to catalog-scoped versions.
 */
export const selectOfferItems = selectCurrentCatalogItems;
export const selectExpandedProducts = selectCurrentCatalogExpandedProducts;
export const selectOfferTotals = selectCurrentCatalogTotals;
export const selectProductsGrouped = selectCurrentCatalogProductsGrouped;
export const selectHasProductInOffer = selectHasProductInCurrentCatalog;

/**
 * EXPORTED ACTIONS
 */
export const {
  // New catalog-scoped actions
  setCatalogContext,
  addToCatalogOffer,
  addAllVariantsToCatalogOffer,
  removeFromCatalogOffer,
  removeProductFromCatalogOffer,
  clearCatalogOffer,
  clearAllOffers,
  clearStoredState,
  toggleProductExpansionInCatalog,
  updateVariantInCatalogSummary,
  initializeFromStorage,

  // Legacy actions (backward compatibility)
  addToOffer,
  removeFromOffer,
  removeProductFromOffer,
  clearOffer,
  toggleProductExpansion,
  updateVariantInSummary,
} = offerCartSlice.actions;

// Legacy action alias
export const addAllVariantsToOffer = addAllVariantsToCatalogOffer;

/**
 * EXPORTED REDUCER
 */
export default offerCartSlice.reducer;

/**
 * USAGE EXAMPLES:
 *
 * // Adding a single item to offer
 * dispatch(addToOffer({
 *   catalogProductId: 'product-123',
 *   variantSku: 'SKU-456',
 *   productName: 'Sample Product',
 *   variantName: 'Sample Variant',
 *   selectedQuantity: 10,
 *   availableQuantity: 100,
 *   retailPrice: 39.99,
 *   offerPrice: 29.99,
 *   pricePerUnit: 29.99,
 *   totalPrice: 299.90,
 *   listingImage: 'https://...',
 *   productImage: 'https://...',
 *   variantImage: 'https://...'
 * }))
 *
 * // Removing a specific variant
 * dispatch(removeFromOffer({
 *   catalogProductId: 'product-123',
 *   variantSku: 'SKU-456'
 * }))
 *
 * // Removing all variants of a product
 * dispatch(removeProductFromOffer({
 *   catalogProductId: 'product-123'
 * }))
 *
 * // Updating a variant in the summary
 * dispatch(updateVariantInSummary({
 *   catalogProductId: 'product-123',
 *   variantSku: 'SKU-456',
 *   updates: { selectedQuantity: 20 }
 * }))
 *
 * // Toggling product expansion
 * dispatch(toggleProductExpansion({
 *   catalogProductId: 'product-123'
 * }))
 *
 * // Clearing all items
 * dispatch(clearOffer())
 */
