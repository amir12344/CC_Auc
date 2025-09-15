/**
 * OFFER SLICE (Build Offer Modal State Management)
 *
 * PURPOSE:
 * This slice manages the state of the BuildOfferModal component only.
 * It handles the temporary state when users are selecting variants and quantities
 * before confirming and adding items to the offer cart.
 *
 * RELATIONSHIP TO OFFER CART SLICE:
 * - offerSlice.ts (THIS FILE): Temporary modal state (selection, editing)
 * - offerCartSlice.ts: Persistent cart state (confirmed selections, summary)
 *
 * DATA FLOW:
 * 1. User clicks "Build Offer" on product → openOfferModal (this slice)
 * 2. User selects variants and quantities → updateVariant actions (this slice)
 * 3. User confirms selection → addToOffer (offerCartSlice)
 * 4. Modal closes → closeOfferModal (this slice)
 *
 * CRITICAL: All data stored here is temporary and gets cleared on modal close.
 * Persistent selections are stored in offerCartSlice.ts
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { OfferState, OfferVariant } from "../types";

/**
 * INITIAL STATE
 *
 * Empty state with no product selected and modal closed.
 * This gets populated when openOfferModal is called.
 */
const initialState: OfferState = {
  catalogProductId: null,
  productTitle: "",
  variants: [],
  productImage: undefined,
  listingImage: undefined,
  productStats: undefined,
  open: false,

  // Legacy field for backward compatibility
  productId: null,
};

/**
 * OFFER SLICE DEFINITION
 *
 * Manages the BuildOfferModal state with actions for:
 * - Opening/closing the modal
 * - Updating variant selections
 * - Modifying prices and quantities
 */
const offerSlice = createSlice({
  name: "offerManagement",
  initialState,
  reducers: {
    /**
     * OPEN OFFER MODAL
     *
     * Opens the BuildOfferModal with product data and existing selections.
     * Called when user clicks "Build Offer" on a product.
     *
     * @param action.payload.catalogProductId - catalog_product_id from API
     * @param action.payload.productTitle - Product display name
     * @param action.payload.variants - Array of OfferVariant objects
     * @param action.payload.productImage - Primary product image URL
     * @param action.payload.listingImage - Catalog listing image URL
     * @param action.payload.productStats - Product statistics for display
     * @param action.payload.existingSelections - Previously selected variants and quantities
     */
    openOfferModal(
      state,
      action: PayloadAction<{
        catalogProductId: string;
        productTitle: string;
        variants: OfferVariant[];
        productImage?: string;
        listingImage?: string;
        productStats?: {
          upc: string;
          asin: string;
          retailPrice: string;
          totalUnits: string;
          variantCount: string;
        };
        existingSelections?: Array<{
          variantSku: string;
          quantity: number;
          pricePerUnit: number;
        }>;
        // Legacy fields for backward compatibility
        productId?: string;
      }>
    ) {
      // Set product identification
      state.catalogProductId = action.payload.catalogProductId;
      state.productTitle = action.payload.productTitle;

      // Process variants and apply existing selections
      state.variants = action.payload.variants.map((variant) => {
        // Check if this variant has existing selections
        const existingSelection = action.payload.existingSelections?.find(
          (sel) => sel.variantSku === variant.variantSku
        );

        if (existingSelection) {
          // Apply existing selection data
          return {
            ...variant,
            checked: true,
            totalUnits: existingSelection.quantity,
            pricePerUnit: existingSelection.pricePerUnit,
            totalPrice:
              existingSelection.quantity * existingSelection.pricePerUnit,
          };
        }

        // Return variant with default state and ensure totalPrice is calculated
        return {
          ...variant,
          totalPrice: variant.pricePerUnit * variant.totalUnits,
        };
      });

      // Set images and stats
      state.productImage = action.payload.productImage;
      state.listingImage = action.payload.listingImage;
      state.productStats = action.payload.productStats;

      // Open the modal
      state.open = true;

      // Legacy field for backward compatibility
      state.productId =
        action.payload.productId || action.payload.catalogProductId;
    },

    /**
     * CLOSE OFFER MODAL
     *
     * Closes the BuildOfferModal and clears temporary state.
     * All selections are lost unless they were confirmed (added to cart).
     */
    closeOfferModal(state) {
      state.open = false;
      // Note: We don't clear the data here to allow re-opening with same state
      // Data gets cleared when a new modal is opened
    },

    /**
     * UPDATE VARIANT SELECTION
     *
     * Toggles the checked state of a variant.
     * This determines which variants will be included in the offer.
     * Also ensures totalPrice is properly calculated.
     *
     * @param action.payload.variantSku - variant_sku from API
     * @param action.payload.checked - Whether variant is selected
     */
    updateVariant(
      state,
      action: PayloadAction<{ variantSku: string; checked: boolean }>
    ) {
      const variant = state.variants.find(
        (v) => v.variantSku === action.payload.variantSku
      );
      if (variant) {
        variant.checked = action.payload.checked;
        // Ensure totalPrice is properly calculated
        variant.totalPrice = variant.pricePerUnit * variant.totalUnits;
      }
    },

    /**
     * UPDATE VARIANT PRICE
     *
     * Updates the price per unit for a variant.
     * Automatically recalculates the total price.
     *
     * @param action.payload.variantSku - variant_sku from API
     * @param action.payload.pricePerUnit - New price per unit
     */
    updateVariantPrice(
      state,
      action: PayloadAction<{ variantSku: string; pricePerUnit: number }>
    ) {
      const variant = state.variants.find(
        (v) => v.variantSku === action.payload.variantSku
      );
      if (variant) {
        variant.pricePerUnit = action.payload.pricePerUnit;
        variant.totalPrice = variant.pricePerUnit * variant.totalUnits;
      }
    },

    /**
     * UPDATE VARIANT QUANTITY
     *
     * Updates the quantity (inventory) for a variant.
     * Automatically recalculates the total price.
     *
     * @param action.payload.variantSku - variant_sku from API
     * @param action.payload.quantity - New quantity
     */
    updateVariantQuantity(
      state,
      action: PayloadAction<{ variantSku: string; quantity: number }>
    ) {
      const variant = state.variants.find(
        (v) => v.variantSku === action.payload.variantSku
      );
      if (variant) {
        // Update quantity and recalculate total price
        variant.totalUnits = action.payload.quantity;
        variant.totalPrice = variant.pricePerUnit * variant.totalUnits;
      }
    },

    /**
     * LEGACY ACTIONS (Deprecated)
     *
     * These actions are kept for backward compatibility.
     * New code should use the actions above with proper API field names.
     */
    updateVariantInventory(
      state,
      action: PayloadAction<{ id: string; inventory: number }>
    ) {
      // Find variant by legacy ID and update quantity
      const variant = state.variants.find((v) => v.id === action.payload.id);
      if (variant) {
        variant.totalUnits = action.payload.inventory;
        variant.totalPrice = variant.pricePerUnit * variant.totalUnits;
      }
    },
  },
});

/**
 * EXPORTED ACTIONS
 *
 * These actions are used by UI components to interact with the modal state.
 */
export const {
  openOfferModal,
  closeOfferModal,
  updateVariant,
  updateVariantPrice,
  updateVariantQuantity,
  updateVariantInventory, // Legacy action
} = offerSlice.actions;

/**
 * EXPORTED REDUCER
 *
 * This reducer is registered in the store configuration.
 */
export default offerSlice.reducer;

/**
 * SELECTORS
 *
 * These selectors provide access to the modal state.
 */
export const selectOfferModalState = (state: { offerManagement: OfferState }) =>
  state.offerManagement;
export const selectOfferModalOpen = (state: { offerManagement: OfferState }) =>
  state.offerManagement.open;
export const selectOfferModalVariants = (state: {
  offerManagement: OfferState;
}) => state.offerManagement.variants;
export const selectOfferModalProduct = (state: {
  offerManagement: OfferState;
}) => ({
  catalogProductId: state.offerManagement.catalogProductId,
  productTitle: state.offerManagement.productTitle,
  productImage: state.offerManagement.productImage,
  listingImage: state.offerManagement.listingImage,
  productStats: state.offerManagement.productStats,
});

/**
 * USAGE EXAMPLE:
 *
 * // Opening the modal with product data
 * dispatch(openOfferModal({
 *   catalogProductId: 'product-123',
 *   productTitle: 'Sample Product',
 *   variants: [...],
 *   productImage: 'https://...',
 *   listingImage: 'https://...',
 *   productStats: { ... }
 * }))
 *
 * // Selecting a variant
 * dispatch(updateVariant({
 *   variantSku: 'SKU-123',
 *   checked: true
 * }))
 *
 * // Updating price
 * dispatch(updateVariantPrice({
 *   variantSku: 'SKU-123',
 *   pricePerUnit: 29.99
 * }))
 *
 * // Updating quantity
 * dispatch(updateVariantQuantity({
 *   variantSku: 'SKU-123',
 *   quantity: 100
 * }))
 *
 * // Closing the modal
 * dispatch(closeOfferModal())
 */
