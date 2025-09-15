import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import type { GetBuyerPreferenceApiRequest } from "../../buyer-preferences/types/preferences";
import { fetchPreferenceBasedListings } from "../services/catalogPreferenceQueryService";

export interface PreferenceListingsState {
  listings: CombinedListing[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  isFiltered: boolean;
  appliedFilters: {
    categories?: string[];
    subcategories?: string[];
    brandIds?: string[];
    listingTypes?: string[];
    buyerSegments?: string[];
  };
}

const initialState: PreferenceListingsState = {
  listings: [],
  status: "idle",
  error: null,
  isFiltered: false,
  appliedFilters: {},
};

// Async thunk to fetch listings based on buyer preferences
export const fetchPreferenceListings = createAsyncThunk(
  "preferenceListings/fetchPreferenceListings",
  async (preferences: GetBuyerPreferenceApiRequest) => {
    const response = await fetchPreferenceBasedListings(preferences);
    return response;
  }
);

const preferenceListingsSlice = createSlice({
  name: "preferenceListings",
  initialState,
  reducers: {
    clearPreferenceListings: (state) => {
      state.listings = [];
      state.status = "idle";
      state.error = null;
      state.isFiltered = false;
      state.appliedFilters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferenceListings.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPreferenceListings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.listings = action.payload.listings;
        state.isFiltered = action.payload.isFiltered;
        state.appliedFilters = action.payload.appliedFilters;
      })
      .addCase(fetchPreferenceListings.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Failed to fetch preference listings";
        state.listings = [];
      });
  },
});

export const { clearPreferenceListings } = preferenceListingsSlice.actions;

// Selectors
export const selectPreferenceListings = (state: {
  preferenceListings: PreferenceListingsState;
}) => state.preferenceListings.listings;
export const selectPreferenceListingsStatus = (state: {
  preferenceListings: PreferenceListingsState;
}) => state.preferenceListings.status;
export const selectPreferenceListingsError = (state: {
  preferenceListings: PreferenceListingsState;
}) => state.preferenceListings.error;
export const selectIsFiltered = (state: {
  preferenceListings: PreferenceListingsState;
}) => state.preferenceListings.isFiltered;

export default preferenceListingsSlice.reducer;
