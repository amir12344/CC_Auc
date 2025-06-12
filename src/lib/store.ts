import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/src/features/authentication/store/authSlice'
import buildOfferReducer from '@/src/features/offer-management/store/offerSlice';
import offerCartReducer from '@/src/features/offer-management/store/offerCartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    buildOffer: buildOfferReducer,
    offerCart: offerCartReducer,
    // Add other reducers here as needed
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

