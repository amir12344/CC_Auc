import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  authCheckFailed,
  initializeAuth,
  loginWithAmplifyUser,
  logout,
  refreshAuth,
} from "@/src/features/authentication/store/authSlice";

import { getBuyerPreferences } from "../services/buyerPreferenceService";
import type { GetBuyerPreferenceApiRequest } from "../types/preferences";

export interface BuyerPreferencesState {
  data: GetBuyerPreferenceApiRequest | null;
  isSet: boolean; // true if preferences exist server-side
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentUserId: string | null;
}

const initialState: BuyerPreferencesState = {
  data: null,
  isSet: false,
  status: "idle",
  error: null,
  currentUserId: null,
};

// Async thunk for fetching buyer preferences
export const fetchBuyerPreferences = createAsyncThunk(
  "buyerPreferences/fetchBuyerPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const preferences = await getBuyerPreferences();
      // getBuyerPreferences returns an array, but we only need the first user's preferences
      return preferences.length > 0 ? preferences[0] : null;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch buyer preferences"
      );
    }
  }
);

const buyerPreferencesSlice = createSlice({
  name: "buyerPreferences",
  initialState,
  reducers: {
    // Action to manually set preferences (e.g., after popup submit)
    setBuyerPreferences: (
      state,
      action: PayloadAction<GetBuyerPreferenceApiRequest>
    ) => {
      state.data = action.payload;
      state.isSet = true;
      state.status = "succeeded";
      state.error = null;
    },
    // Action to clear preferences
    clearBuyerPreferences: (state) => {
      state.data = null;
      state.isSet = false;
      state.status = "idle";
      state.error = null;
    },
    // Action to reset error state
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuyerPreferences.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        // initializeAuth returns null if unauthenticated
        const newUserId = action.payload?.amplifyUser?.userId ?? null;
        if (state.currentUserId !== newUserId) {
          // User identity changed → clear stale preference state and re-fetch
          state.data = null;
          state.isSet = false;
          state.error = null;
        }
        // Always mark idle so next view triggers a fetch
        state.status = "idle";
        state.currentUserId = newUserId;
      })
      .addCase(fetchBuyerPreferences.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        // Determine if user actually has any preferences selected
        const prefs = action.payload;
        const hasAnyPreferences = Boolean(
          prefs &&
            ((Array.isArray(prefs.preferredCategories) &&
              prefs.preferredCategories.length > 0) ||
              (Array.isArray(prefs.preferredSubcategories) &&
                prefs.preferredSubcategories.length > 0) ||
              (Array.isArray(prefs.preferredBrandIds) &&
                prefs.preferredBrandIds.length > 0) ||
              (Array.isArray(prefs.buyerSegments) &&
                prefs.buyerSegments.length > 0) ||
              (Array.isArray(prefs.listingTypePreferences) &&
                prefs.listingTypePreferences.length > 0) ||
              (Array.isArray(prefs.preferredRegions) &&
                prefs.preferredRegions.length > 0) ||
              (typeof prefs.budgetMin === "number" && prefs.budgetMin > 0) ||
              (typeof prefs.budgetMax === "number" && prefs.budgetMax > 0))
        );
        state.isSet = hasAnyPreferences;
        state.error = null;
      })
      .addCase(fetchBuyerPreferences.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        state.data = null;
        state.isSet = false;
      })
      // Reset preferences when auth state changes to a new user or logs out
      .addCase(logout, (state) => {
        state.data = null;
        state.isSet = false;
        state.status = "idle";
        state.error = null;
        state.currentUserId = null;
      })
      .addCase(authCheckFailed, (state) => {
        state.data = null;
        state.isSet = false;
        state.status = "idle";
        state.error = null;
        state.currentUserId = null;
      })
      // On login/refresh, if the user changed, clear and force re-fetch
      .addCase(loginWithAmplifyUser, (state, action) => {
        const newUserId = action.payload?.amplifyUser?.userId ?? null;
        if (state.currentUserId && state.currentUserId !== newUserId) {
          state.data = null;
          state.isSet = false;
          state.status = "idle";
          state.error = null;
        }
        state.currentUserId = newUserId;
      })
      .addCase(refreshAuth, (state, action) => {
        const newUserId = action.payload?.amplifyUser?.userId ?? null;
        if (state.currentUserId && state.currentUserId !== newUserId) {
          state.data = null;
          state.isSet = false;
          state.status = "idle";
          state.error = null;
        }
        state.currentUserId = newUserId;
      });
  },
});

export const { setBuyerPreferences, clearBuyerPreferences, clearError } =
  buyerPreferencesSlice.actions;

// Selectors
export const selectBuyerPreferences = (state: {
  buyerPreferences: BuyerPreferencesState;
}) => state.buyerPreferences.data;
export const selectBuyerPreferencesStatus = (state: {
  buyerPreferences: BuyerPreferencesState;
}) => state.buyerPreferences.status;
export const selectBuyerPreferencesIsSet = (state: {
  buyerPreferences: BuyerPreferencesState;
}) => state.buyerPreferences.isSet;
export const selectBuyerPreferencesError = (state: {
  buyerPreferences: BuyerPreferencesState;
}) => state.buyerPreferences.error;

export default buyerPreferencesSlice.reducer;
