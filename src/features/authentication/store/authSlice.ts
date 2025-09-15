import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { fetchUserAttributes as amplifyFetchUserAttributes } from "aws-amplify/auth";

import type {
  AmplifyUser,
  AuthState,
  UserProfile,
  UserVerificationStatus,
} from "@/src/lib/interfaces/auth";

// Declare regex literal at top-level per lint rule
const WHITESPACE_SPLIT_REGEX = /\s+/;

// Initialize auth from Amplify (server-auth is SoT; no client cookies written)
export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  try {
    const {
      getCurrentUser,
      fetchAuthSession,
      fetchUserAttributes: fetchUserAttributesAmplify,
    } = await import("aws-amplify/auth");

    // Get current user from Amplify
    const currentUser = await getCurrentUser();

    // Get auth session for credentials and tokens
    const session = await fetchAuthSession();

    if (currentUser && session.credentials && session.tokens) {
      // Fetch user attributes to get custom data
      const attributes = await fetchUserAttributesAmplify();

      // Construct Amplify user object
      const amplifyUser: AmplifyUser = {
        userId: currentUser.userId,
        username: currentUser.username,
        email: attributes.email || "",
        identityId: session.identityId,
        attributes: {
          email: attributes.email || "",
          "custom:fullName": attributes["custom:fullName"],
          phone_number: attributes.phone_number,
          // Legacy fields for backward compatibility
          "custom:firstName": attributes["custom:firstName"] || "",
          "custom:lastName": attributes["custom:lastName"] || "",
          // New fields for updated signup
          "custom:jobTitle": attributes["custom:jobTitle"],
          "custom:companyName": attributes["custom:companyName"],
          "custom:userRole": attributes["custom:userRole"] as
            | "buyer"
            | "seller",
          "custom:termsAccepted": attributes["custom:termsAccepted"] || "false",
        },
        signInDetails: currentUser.signInDetails
          ? {
            loginId: currentUser.signInDetails.loginId || "",
            authFlowType: currentUser.signInDetails.authFlowType || "",
          }
          : undefined,
      };

      // Extract access token
      const accessToken = session.tokens.accessToken.toString();

      return {
        amplifyUser,
        token: accessToken,
      };
    }
    throw new Error("Authentication incomplete");
  } catch (error: unknown) {
    // Don't treat "not authenticated" as an error
    const err = error as { name?: string; message?: string };
    if (
      err?.name === "UserUnAuthenticatedException" ||
      err?.message?.includes("not authenticated") ||
      err?.message?.includes("No current user")
    ) {
      return null; // User is simply not authenticated
    }
    throw error; // Re-throw unexpected errors
  }
});

// Fetch fresh Amplify attributes (used to refresh local state only)
export const fetchUserAttributes = createAsyncThunk(
  "auth/fetchUserAttributes",
  async (_, { rejectWithValue }) => {
    try {
      const attributes = await amplifyFetchUserAttributes();
      return attributes;
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err?.message || "Failed to fetch user attributes");
    }
  }
);

// Fetch buyer verification from backend API and normalize to lowercase
export const fetchVerificationStatus = createAsyncThunk(
  "auth/fetchVerificationStatus",
  async () => {
    try {
      // Call the API endpoint that fetches status AND updates cookies for middleware
      const response = await fetch("/api/auth/verification-status", {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (!response.ok) {
        // A 401 is an expected transient error during token refresh.
        // We can ignore it and let the next action succeed.
        if (response.status === 401) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = (await response.json()) as {
        verificationStatus?: string;
        accountLocked?: boolean;
        userId?: string;
      };

      // Transform API response to match expected format
      const verificationData = {
        data: {
          verification_status: (
            apiData.verificationStatus ?? "pending"
          ).toLowerCase() as UserVerificationStatus["verification_status"],
          account_locked: apiData.accountLocked ?? false,
          user_id: apiData.userId ?? "",
        } as UserVerificationStatus,
        error: undefined,
      };

      return verificationData;
    } catch (error: unknown) {
      // Return error in expected format
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch verification status",
      };
    }
  }
);

// Helper function to transform Amplify user to UserProfile
const transformAmplifyUserToProfile = (
  amplifyUser: AmplifyUser
): UserProfile => {
  const { attributes } = amplifyUser;

  // Handle name logic with backward compatibility
  let firstName = "";
  let lastName = "";
  let fullName = "";

  // New pattern - use the custom 'fullName' attribute first
  if (attributes["custom:fullName"]) {
    fullName = attributes["custom:fullName"];
    // Extract firstName/lastName from full name for backward compatibility
    const nameParts = fullName.trim().split(WHITESPACE_SPLIT_REGEX);
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }
  } else {
    // Old pattern - use custom attributes or standard attributes
    firstName = attributes["custom:firstName"] || attributes.given_name || "";
    lastName = attributes["custom:lastName"] || attributes.family_name || "";
    fullName = `${firstName} ${lastName}`.trim();
  }

  return {
    id: amplifyUser.userId,
    username: amplifyUser.username,
    email: attributes.email,
    firstName,
    lastName,
    fullName,
    userType: attributes["custom:userRole"] as "buyer" | "seller",
    phoneNumber: attributes.phone_number,
    // New buyer fields
    jobTitle: attributes["custom:jobTitle"],
    companyName: attributes["custom:companyName"],
    termsAccepted: attributes["custom:termsAccepted"] === "true",
    // Verification status fields (will be populated from database)
    verificationStatus: null,
    accountLocked: false,
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
  verificationStatus: null,
  accountLocked: false,
};

// Create the auth slice
export const authSlice = createSlice({
  name: "auth",
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
    loginWithAmplifyUser: (
      state,
      action: PayloadAction<{ amplifyUser: AmplifyUser; token: string }>
    ) => {
      const { amplifyUser, token } = action.payload;
      const userProfile = transformAmplifyUserToProfile(amplifyUser);

      state.isAuthenticated = true;
      state.userType = userProfile.userType;
      state.token = token;
      state.user = amplifyUser;
      state.isLoading = false;
      state.error = null;

      // Do not set role cookies client-side; managed server-side as httpOnly
    },

    // Update user attributes (for profile updates)
    updateUserAttributes: (
      state,
      action: PayloadAction<Partial<AmplifyUser["attributes"]>>
    ) => {
      if (state.user) {
        state.user.attributes = {
          ...state.user.attributes,
          ...action.payload,
        };

        // Update userType in state if it changed
        if (action.payload["custom:userRole"]) {
          state.userType = action.payload["custom:userRole"] as
            | "buyer"
            | "seller";
        }
      }
    },

    // Legacy login action (keeping for backward compatibility)
    login: (
      state,
      action: PayloadAction<{ userType: "buyer" | "seller"; token: string }>
    ) => {
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
      state.verificationStatus = null;
      state.accountLocked = false;

      // Do not manipulate cookies client-side; server manages httpOnly cookies
    },

    // Set user type action (for cases where we need to update just the user type)
    setUserType: (state, action: PayloadAction<"buyer" | "seller" | null>) => {
      state.userType = action.payload;

      // Update the Amplify user attributes if user exists
      if (state.user && action.payload) {
        state.user.attributes["custom:userRole"] = action.payload;
      }
    },

    // Refresh authentication state
    refreshAuth: (
      state,
      action: PayloadAction<{ amplifyUser: AmplifyUser; token: string }>
    ) => {
      const { amplifyUser, token } = action.payload;

      state.isAuthenticated = true;
      state.userType = amplifyUser.attributes["custom:userRole"] as
        | "buyer"
        | "seller";
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
      state.verificationStatus = null;
      state.accountLocked = false;
    },

    // Update verification status
    updateVerificationStatus: (
      state,
      action: PayloadAction<{
        verificationStatus: "pending" | "verified" | "rejected" | null;
        accountLocked: boolean;
      }>
    ) => {
      state.verificationStatus = action.payload.verificationStatus;
      state.accountLocked = action.payload.accountLocked;
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

          // Remove client-side role cookie writes; role is managed server-side as httpOnly

          // For buyers, we need to fetch verification status to ensure navbar works properly
          // This is critical for proper state restoration after page refresh
          if (
            userProfile.userType === "buyer" &&
            typeof window !== "undefined"
          ) {
            // Robust verification status fetch with retry logic
            const ensureVerificationStatusFetched = async (
              verificationRetryAttempt = 1,
              maxAttempts = 5
            ): Promise<void> => {
              // Check session validity
              const { fetchAuthSession } = await import("aws-amplify/auth");
              const hasToken = await fetchAuthSession()
                .then((s) => Boolean(s.tokens?.accessToken))
                .catch(() => false);
              if (hasToken) {
                const mod = await import("@/src/lib/store");
                await mod.store.dispatch(fetchVerificationStatus());
                return; // Success, exit retry loop
              }

              // Retry with exponential backoff if we haven't reached max attempts
              if (verificationRetryAttempt < maxAttempts) {
                const delay = Math.min(
                  2000 * 2 ** (verificationRetryAttempt - 1), // Increased base delay from 1000ms to 2000ms
                  15_000 // Increased max delay from 10s to 15s
                );
                setTimeout(() => {
                  ensureVerificationStatusFetched(
                    verificationRetryAttempt + 1,
                    maxAttempts
                  );
                }, delay);
              } else {
                console.warn("Verification status fetch failed after all retry attempts");
              }
            };

            // Increased initial attempt delay from 1s to 3s for better cookie propagation
            setTimeout(() => {
              ensureVerificationStatusFetched();
            }, 3000);

            // Also attempt on window focus (covers tab switching, etc.)
            const handleFocus = (): void => {
              import("@/src/lib/store").then(({ store }) => {
                const authState = store.getState().auth;
                if (
                  authState?.isAuthenticated &&
                  !authState?.verificationStatus
                ) {
                  ensureVerificationStatusFetched(1, 3); // Fewer attempts on focus
                }
              });
            };
            window.addEventListener("focus", handleFocus);

            // Cleanup listener (store reference for later cleanup if needed)
            (
              window as unknown as {
                __VERIFICATION_FOCUS_HANDLER__?: () => void;
              }
            ).__VERIFICATION_FOCUS_HANDLER__ = handleFocus;
          }
        } else {
          // User is not authenticated
          state.isAuthenticated = false;
          state.userType = null;
          state.token = null;
          state.user = null;
          state.verificationStatus = null;
          state.accountLocked = false;

          // No client-side cookie clearing; server manages httpOnly role cookie
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
        state.error =
          action.error?.message ?? "Authentication initialization failed";
        state.verificationStatus = null;
        state.accountLocked = false;
      })
      .addCase(fetchUserAttributes.fulfilled, (state, action) => {
        if (state.user) {
          state.user.attributes = {
            ...state.user.attributes,
            ...action.payload,
          };
        }
      })
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.verificationStatus = action.payload.data.verification_status;
          state.accountLocked = action.payload.data.account_locked;
        }
      })
      .addCase(fetchVerificationStatus.rejected, (state, action) => {
        // Set error state without console logging
        state.error =
          action.error?.message ?? "Failed to fetch verification status";
        // Keep current verification status on error, don't reset to null
      });
  },
});

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
  updateVerificationStatus,
} = authSlice.actions;

export default authSlice.reducer;
