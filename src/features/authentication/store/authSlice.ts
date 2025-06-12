import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, AmplifyUser, UserProfile } from '@/src/lib/interfaces/auth';

// Async thunk for initializing auth state
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    try {
      const { getCurrentUser, fetchAuthSession, fetchUserAttributes } = await import('aws-amplify/auth');
      


      // Get current user from Amplify
      const currentUser = await getCurrentUser();

      // Get auth session for credentials and tokens
      const session = await fetchAuthSession();

      if (currentUser && session.credentials && session.tokens) {
        // Fetch user attributes to get custom data
        const attributes = await fetchUserAttributes();

        // Construct Amplify user object
        const amplifyUser: AmplifyUser = {
          userId: currentUser.userId,
          username: currentUser.username,
          email: attributes.email || '',
          identityId: session.identityId,
          attributes: {
            email: attributes.email || '',
            'custom:fullName': attributes['custom:fullName'],
            phone_number: attributes.phone_number,
            // Legacy fields for backward compatibility
            'custom:firstName': attributes['custom:firstName'] || '',
            'custom:lastName': attributes['custom:lastName'] || '',
            // New fields for updated signup
            'custom:jobTitle': attributes['custom:jobTitle'],
            'custom:companyName': attributes['custom:companyName'],
            'custom:userRole': attributes['custom:userRole'] as 'buyer' | 'seller',
            'custom:termsAccepted': attributes['custom:termsAccepted'] || 'false',
            'custom:hasCert': attributes['custom:hasCert'],
            'custom:certPaths': attributes['custom:certPaths'],
            'custom:certUploadDate': attributes['custom:certUploadDate'],
            'custom:certStatus': attributes['custom:certStatus'] as 'pending' | 'approved' | 'rejected',
          },
          signInDetails: currentUser.signInDetails ? {
            loginId: currentUser.signInDetails.loginId || '',
            authFlowType: currentUser.signInDetails.authFlowType || '',
          } : undefined
        };

        // Extract access token
        const accessToken = session.tokens.accessToken.toString();
        
        return {
          amplifyUser,
          token: accessToken
        };

      } else {
        throw new Error('Authentication incomplete');
      }
    } catch (error: any) {
      
      // Don't treat "not authenticated" as an error
      if (error.name === 'UserUnAuthenticatedException' || 
          error.message?.includes('not authenticated') ||
          error.message?.includes('No current user')) {
        return null; // User is simply not authenticated
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
  }
);

// Async thunk for signing out
export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch }) => {
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
      
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        const { authSessionStorage } = await import('@/src/utils/sessionStorage');
        authSessionStorage.clearAll();
      }
      
      return true;
    } catch (error: any) {
      throw error;
    }
  }
);

// Helper function to transform Amplify user to UserProfile
const transformAmplifyUserToProfile = (amplifyUser: AmplifyUser): UserProfile => {
  const { attributes } = amplifyUser;
  
  // Handle name logic with backward compatibility
  let firstName = '';
  let lastName = '';
  let fullName = '';
  
  // New pattern - use the custom 'fullName' attribute first
  if (attributes['custom:fullName']) {
    fullName = attributes['custom:fullName'];
    // Extract firstName/lastName from full name for backward compatibility
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }
  } else {
    // Old pattern - use custom attributes or standard attributes
    firstName = attributes['custom:firstName'] || attributes.given_name || '';
    lastName = attributes['custom:lastName'] || attributes.family_name || '';
    fullName = `${firstName} ${lastName}`.trim();
  }
  
  return {
    id: amplifyUser.userId,
    username: amplifyUser.username,
    email: attributes.email,
    firstName,
    lastName,
    fullName,
    userType: attributes['custom:userRole'] as 'buyer' | 'seller',
    phoneNumber: attributes.phone_number,
    // New buyer fields
    jobTitle: attributes['custom:jobTitle'],
    companyName: attributes['custom:companyName'],
    termsAccepted: attributes['custom:termsAccepted'] === 'true',
    // Seller-specific fields
    hasResellerCertificate: attributes['custom:hasCert'] === 'true',
    certificateStatus: attributes['custom:certStatus'] as 'pending' | 'approved' | 'rejected' | undefined,
    certificateUploadDate: attributes['custom:certUploadDate'] ? new Date(attributes['custom:certUploadDate']) : undefined,
    // Timestamps (you might get these from tokens or set them here)
    createdAt: new Date(), // This could be extracted from token claims if available
    lastLoginAt: new Date(),
  };
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  userType: null,
  token: null,
  user: null,
  isLoading: true, // Start with loading true since we'll check auth on init
  error: null,
};

// Create the auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Login with Amplify user data
    loginWithAmplifyUser: (state, action: PayloadAction<{ amplifyUser: AmplifyUser; token: string }>) => {
      const { amplifyUser, token } = action.payload;
      const userProfile = transformAmplifyUserToProfile(amplifyUser);
      
      state.isAuthenticated = true;
      state.userType = userProfile.userType;
      state.token = token;
      state.user = amplifyUser;
      state.isLoading = false;
      state.error = null;

      // Set userRole cookie for middleware access
      if (typeof window !== 'undefined') {
        document.cookie = `userRole=${userProfile.userType}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
    },

    // Update user attributes (for profile updates)
    updateUserAttributes: (state, action: PayloadAction<Partial<AmplifyUser['attributes']>>) => {
      if (state.user) {
        state.user.attributes = {
          ...state.user.attributes,
          ...action.payload,
        };
        
        // Update userType in state if it changed
        if (action.payload['custom:userRole']) {
          state.userType = action.payload['custom:userRole'] as 'buyer' | 'seller';
        }
      }
    },

    // Legacy login action (keeping for backward compatibility)
    login: (state, action: PayloadAction<{ userType: 'buyer' | 'seller'; token: string }>) => {
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    
    // Logout action
    logout: (state) => {
      state.isAuthenticated = false;
      state.userType = null;
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;

      // Clear userRole cookie
      if (typeof window !== 'undefined') {
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },
    
    // Set user type action (for cases where we need to update just the user type)
    setUserType: (state, action: PayloadAction<'buyer' | 'seller' | null>) => {
      state.userType = action.payload;
      
      // Update the Amplify user attributes if user exists
      if (state.user && action.payload) {
        state.user.attributes['custom:userRole'] = action.payload;
      }
    },

    // Refresh authentication state
    refreshAuth: (state, action: PayloadAction<{ amplifyUser: AmplifyUser; token: string }>) => {
      const { amplifyUser, token } = action.payload;
      
      state.isAuthenticated = true;
      state.userType = amplifyUser.attributes['custom:userRole'] as 'buyer' | 'seller';
      state.token = token;
      state.user = amplifyUser;
      state.isLoading = false;
      state.error = null;
    },

    // Handle authentication check failure
    authCheckFailed: (state, action: PayloadAction<string | null>) => {
      state.isAuthenticated = false;
      state.userType = null;
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          // User is authenticated
          const { amplifyUser, token } = action.payload;
          const userProfile = transformAmplifyUserToProfile(amplifyUser);
          
          state.isAuthenticated = true;
          state.userType = userProfile.userType;
          state.token = token;
          state.user = amplifyUser;

          // Set userRole cookie for middleware access
          if (typeof window !== 'undefined') {
            document.cookie = `userRole=${userProfile.userType}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
                  } else {
            // User is not authenticated
            state.isAuthenticated = false;
            state.userType = null;
            state.token = null;
            state.user = null;

            // Clear userRole cookie when not authenticated
            if (typeof window !== 'undefined') {
              document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
          }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.userType = null;
        state.token = null;
        state.user = null;
        state.isLoading = false;
        state.error = action.error.message || 'Authentication initialization failed';
      })
      // Sign out async thunk
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.userType = null;
        state.token = null;
        state.user = null;
        state.isLoading = false;
        state.error = null;

        // Clear userRole cookie on logout
        if (typeof window !== 'undefined') {
          document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to sign out';
      });
  },
});

// Export actions
export const { 
  setLoading,
  setError,
  loginWithAmplifyUser,
  updateUserAttributes,
  login, 
  logout, 
  setUserType,
  refreshAuth,
  authCheckFailed,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer; 