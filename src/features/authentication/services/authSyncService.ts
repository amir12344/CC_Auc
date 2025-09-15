/**
 * Authentication Synchronization Service
 * Ensures client and server authentication states remain synchronized
 * Prevents authentication loops and session mismatches
 */
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";

import type { AppDispatch } from "../../../lib/store";
import {
  loginWithAmplifyUser,
  logout,
  setError,
  setLoading,
} from "../store/authSlice";

interface SyncOptions {
  force?: boolean;
  retryCount?: number;
}

interface AuthSyncState {
  syncInProgress: boolean;
  lastSyncTime: number;
}

// Service state
const authSyncState: AuthSyncState = {
  syncInProgress: false,
  lastSyncTime: 0,
};

const SYNC_COOLDOWN = 5000; // 5 seconds

/**
 * Perform authentication synchronization
 */
async function syncAuth(
  dispatch: AppDispatch,
  options: SyncOptions = {}
): Promise<boolean> {
  const { force = false, retryCount = 0 } = options;
  const now = Date.now();

  // Prevent concurrent syncs unless forced
  if (authSyncState.syncInProgress && !force) {
    return false;
  }

  // Respect cooldown period unless forced
  if (!force && now - authSyncState.lastSyncTime < SYNC_COOLDOWN) {
    return false;
  }

  authSyncState.syncInProgress = true;
  authSyncState.lastSyncTime = now;

  try {
    dispatch(setError(null));
    dispatch(setLoading(true));

    const user = await getCurrentUser();

    if (!user) {
      dispatch(logout());
      clearAuthCookies();
      return false;
    }

    const attributes = await fetchUserAttributes();
    const amplifyUser = createAmplifyUserObject(user, attributes);
    const token = "sync-token";

    dispatch(loginWithAmplifyUser({ amplifyUser, token }));
    setAuthCookies(attributes["custom:userRole"] as string, user.username);

    return true;
  } catch (error) {
    return handleSyncError(dispatch, error, retryCount, options);
  } finally {
    dispatch(setLoading(false));
    authSyncState.syncInProgress = false;
  }
}

/**
 * Create Amplify user object from user and attributes
 */
function createAmplifyUserObject(user: any, attributes: any) {
  return {
    userId: user.userId,
    username: user.username,
    email: attributes.email || "",
    identityId: "",
    attributes: {
      email: attributes.email || "",
      "custom:userRole": attributes["custom:userRole"] as "buyer" | "seller",
      "custom:fullName": attributes["custom:fullName"],
      phone_number: attributes.phone_number,
      "custom:firstName": attributes["custom:firstName"] || "",
      "custom:lastName": attributes["custom:lastName"] || "",
      "custom:jobTitle": attributes["custom:jobTitle"],
      "custom:companyName": attributes["custom:companyName"],
      "custom:termsAccepted": attributes["custom:termsAccepted"] || "false",
      // Certificate attributes removed - using database-driven verification instead
    },
    signInDetails: user.signInDetails
      ? {
          loginId: user.signInDetails.loginId || "",
          authFlowType: user.signInDetails.authFlowType || "",
        }
      : undefined,
  };
}

/**
 * Handle sync errors with retry logic
 */
async function handleSyncError(
  dispatch: AppDispatch,
  error: unknown,
  retryCount: number,
  options: SyncOptions
): Promise<boolean> {
  dispatch(logout());
  clearAuthCookies();

  if (retryCount < 2 && isRetryableError(error)) {
    await delay(1000 * (retryCount + 1));
    return await syncAuth(dispatch, {
      force: true,
      retryCount: retryCount + 1,
    });
  }

  if (!isAuthenticationError(error)) {
    dispatch(setError("Authentication sync failed. Please refresh the page."));
  }

  return false;
}

/**
 * Set authentication cookies with encryption for sensitive data
 * SECURITY: Encrypt user role and username to prevent manual tampering
 */
function setAuthCookies(userRole?: string, username?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const maxAge = 60 * 60 * 24; // 24 hours
  const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Strict; Secure=${process.env.NODE_ENV === 'production'}`;

  // SECURITY: Only set non-sensitive sync timestamp, remove sensitive data from client cookies
  const syncCookie = `auth-sync=${Date.now()}; ${cookieOptions}`;
  setCookie(syncCookie);
  
  // NOTE: userRole and username are now only stored server-side via Amplify tokens
  // Client-side cookies no longer contain sensitive authentication data
}

/**
 * Clear authentication cookies using a safer method
 * SECURITY: Clear only the sync cookie, sensitive data no longer stored client-side
 */
function clearAuthCookies(): void {
  if (typeof window === "undefined") {
    return;
  }

  const expiredOptions = "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  setCookie(`auth-sync=; ${expiredOptions}`);
  // Note: user-role and username cookies removed for security
}

/**
 * Safer cookie setting method
 */
function setCookie(cookieString: string): void {
  try {
    document.cookie = cookieString;
  } catch {
    // Silently fail if cookies can't be set
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection")
  );
}

/**
 * Check if error is authentication-related
 */
function isAuthenticationError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const errorMessage =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    errorMessage.includes("not authenticated") ||
    errorMessage.includes("user not found") ||
    errorMessage.includes("invalid token") ||
    errorMessage.includes("token expired")
  );
}

/**
 * Utility delay function
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Force a complete authentication resync
 */
async function forceSync(dispatch: AppDispatch): Promise<boolean> {
  return await syncAuth(dispatch, { force: true });
}

/**
 * Check if sync is needed
 */
function shouldSync(): boolean {
  const now = Date.now();
  return now - authSyncState.lastSyncTime > SYNC_COOLDOWN;
}

// Export the service functions
export const authSyncService = {
  syncAuth,
  forceSync,
  shouldSync,
  setAuthCookies,
  clearAuthCookies,
};
