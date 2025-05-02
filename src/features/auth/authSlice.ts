import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthToken } from '@/src/lib/interfaces/auth';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  userType: null,
  token: null,
};

// Create the auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action
    login: (state, action: PayloadAction<AuthToken>) => {
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
      state.token = action.payload.token;
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.userType = null;
      state.token = null;
    },
    
    // Set user type action (for cases where we need to update just the user type)
    setUserType: (state, action: PayloadAction<'buyer' | 'seller' | null>) => {
      state.userType = action.payload;
    },
  },
});

// Export actions
export const { login, logout, setUserType } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

