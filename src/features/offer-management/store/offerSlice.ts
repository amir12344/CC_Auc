import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OfferVariant {
  id: string;
  name: string;
  upc?: string;
  asin?: string;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
  checked: boolean;
}

export interface OfferState {
  productId: string | null;
  productTitle: string;
  variants: OfferVariant[];
  open: boolean;
}

const initialState: OfferState = {
  productId: null,
  productTitle: '',
  variants: [],
  open: false,
};

const offerSlice = createSlice({
  name: 'offerManagement',
  initialState,
  reducers: {
    openOfferModal(state, action: PayloadAction<{ productId: string; productTitle: string; variants: OfferVariant[] }>) {
      state.productId = action.payload.productId;
      state.productTitle = action.payload.productTitle;
      state.variants = action.payload.variants;
      state.open = true;
    },
    closeOfferModal(state) {
      state.open = false;
    },
    updateVariant(state, action: PayloadAction<{ id: string; checked: boolean }>) {
      const variant = state.variants.find(v => v.id === action.payload.id);
      if (variant) {
        variant.checked = action.payload.checked;
      }
    },
    updateVariantUnits(state, action: PayloadAction<{ id: string; units: number }>) {
      const variant = state.variants.find(v => v.id === action.payload.id);
      if (variant) {
        variant.totalUnits = action.payload.units;
        variant.totalPrice = variant.pricePerUnit * variant.totalUnits;
      }
    },
  },
});

export const { openOfferModal, closeOfferModal, updateVariant, updateVariantUnits } = offerSlice.actions;
export default offerSlice.reducer; 