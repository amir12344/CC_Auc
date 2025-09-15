// Typed hooks for better TypeScript support
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer from "@/src/features/authentication/store/authSlice";
import buyerPreferencesReducer from "@/src/features/buyer-preferences/store/buyerPreferencesSlice";
import viewAllContextReducer from "@/src/features/collections/store/viewAllContextSlice";
import preferenceListingsReducer from "@/src/features/marketplace-catalog/store/preferenceListingsSlice";
import sectionsCacheReducer from "@/src/features/marketplace-catalog/store/sectionsCacheSlice";
import notificationReducer from "@/src/features/notifications/store/notificationSlice";
import buildOfferReducer from "@/src/features/offer-management/store/offerSlice";

// Static reducers always present in the store
const staticReducers = {
  auth: authReducer,
  buildOffer: buildOfferReducer,
  buyerPreferences: buyerPreferencesReducer,
  preferenceListings: preferenceListingsReducer,
  sectionsCache: sectionsCacheReducer,
  viewAllContext: viewAllContextReducer,
  notifications: notificationReducer,
};

// Helper to create the root reducer from static + async reducers
function createRootReducer(asyncReducers: Record<string, unknown>) {
  return combineReducers({
    ...staticReducers,
    ...(asyncReducers as Record<string, any>),
  });
}

// Create the store with only static reducers; async ones injected at runtime
export const store = configureStore({
  reducer: createRootReducer({}),
  devTools: process.env.NODE_ENV !== "production",
});

// Keep a registry of async reducers on the store instance
(store as any).asyncReducers = {};

export function injectReducer(key: string, reducer: unknown) {
  const s = store as any;
  if (s.asyncReducers[key]) return;
  s.asyncReducers[key] = reducer;
  store.replaceReducer(createRootReducer(s.asyncReducers));
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
