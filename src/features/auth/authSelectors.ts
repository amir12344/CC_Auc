import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/src/lib/store';

// Base selector for auth state
const selectAuthState = (state: RootState) => state.auth;

// Memoized selectors
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectUserType = createSelector(
  [selectAuthState],
  (auth) => auth.userType
);

export const selectToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
);

// Combined selectors
export const selectAuthInfo = createSelector(
  [selectIsAuthenticated, selectUserType, selectToken],
  (isAuthenticated, userType, token) => ({
    isAuthenticated,
    userType,
    token,
  })
);

// Selector for checking if user is a buyer
export const selectIsBuyer = createSelector(
  [selectUserType],
  (userType) => userType === 'buyer'
);

// Selector for checking if user is a seller
export const selectIsSeller = createSelector(
  [selectUserType],
  (userType) => userType === 'seller'
);
