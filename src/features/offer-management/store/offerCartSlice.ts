import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OfferCartItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  offeredPrice: number;
  msrp: number;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
}

export interface OfferCartState {
  items: OfferCartItem[];
}

// We'll initialize with empty state and update on client-side
// This avoids hydration mismatches between server and client

// Always start with empty state to avoid hydration mismatches
const initialState: OfferCartState = { items: [] };

// Helper function to save state to localStorage (client-side only)
const saveState = (state: OfferCartState) => {
  if (typeof window === 'undefined') return;
  
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('offerCartState', serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

const offerCartSlice = createSlice({
  name: 'offerCart',
  initialState,
  reducers: {
    addToOffer: (state, action: PayloadAction<OfferCartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
      );
      if (existingIndex !== -1) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }
      // Save to localStorage
      saveState(state);
    },
    removeFromOffer: (
      state,
      action: PayloadAction<{ productId: string; variantId?: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(item.productId === action.payload.productId &&
            item.variantId === action.payload.variantId)
      );
      // Save to localStorage
      saveState(state);
    },
    clearOffer: (state) => {
      state.items = [];
      // Save to localStorage
      saveState(state);
    },
    updateOfferItem: (state, action: PayloadAction<OfferCartItem>) => {
      const index = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
      );
      if (index !== -1) {
        state.items[index] = action.payload;
        // Save to localStorage
        saveState(state);
      }
    },
  },
});

// Selectors with explicit RootState type
export const selectOfferItems = (state: { offerCart: OfferCartState }) => {
  return state.offerCart.items;
};

export const selectOfferTotals = (state: { offerCart: OfferCartState }) => {
  // Log the state for debugging
  console.log('Redux state in selectOfferTotals:', state.offerCart);
  
  const items = state.offerCart.items;
  const totalProducts = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const avgPricePerUnit = totalUnits > 0 ? totalPrice / totalUnits : 0;

  return {
    totalProducts,
    totalUnits,
    totalPrice,
    avgPricePerUnit,
  };
};

export const { addToOffer, removeFromOffer, clearOffer, updateOfferItem } = offerCartSlice.actions;
export default offerCartSlice.reducer;
