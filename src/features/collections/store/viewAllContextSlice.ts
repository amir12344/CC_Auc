import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { GetBuyerPreferenceApiRequest } from "../../buyer-preferences/types/preferences";

export interface ViewAllContext {
  sectionType:
    | "category"
    | "subcategory"
    | "buyerSegment"
    | "catalog"
    | "auction"
    | "nearYou";
  sectionValue: string | string[]; // Can be single value or array of values
  userPreferences: GetBuyerPreferenceApiRequest;
  timestamp: number;
  sectionTitle: string; // Human-readable title like "Home, Beauty & Grooming"
}

interface ViewAllContextState {
  context: ViewAllContext | null;
}

const initialState: ViewAllContextState = {
  context: null,
};

const viewAllContextSlice = createSlice({
  name: "viewAllContext",
  initialState,
  reducers: {
    setViewAllContext: (state, action: PayloadAction<ViewAllContext>) => {
      state.context = action.payload;
    },
    clearViewAllContext: (state) => {
      state.context = null;
    },
  },
});

export const { setViewAllContext, clearViewAllContext } =
  viewAllContextSlice.actions;
export default viewAllContextSlice.reducer;

// Selectors
export const selectViewAllContext = (state: {
  viewAllContext: ViewAllContextState;
}) => state.viewAllContext.context;

export const selectHasViewAllContext = (state: {
  viewAllContext: ViewAllContextState;
}) => state.viewAllContext.context !== null;

export const selectViewAllContextAge = (state: {
  viewAllContext: ViewAllContextState;
}) => {
  if (!state.viewAllContext.context) return null;
  return Date.now() - state.viewAllContext.context.timestamp;
};

// Helper to check if context is still fresh (within 10 minutes)
export const selectIsViewAllContextFresh = (state: {
  viewAllContext: ViewAllContextState;
}) => {
  const age = selectViewAllContextAge(state);
  return age !== null && age < 10 * 60 * 1000; // 10 minutes
};
