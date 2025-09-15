/**
 * Session storage utilities for persistent authentication state
 * Integrates with Amplify Gen 2 and Redux for seamless user experience
 */
import { SessionData, UserProfile } from "@/src/lib/interfaces/auth";

const SESSION_KEYS = {
  AUTH_STATE: "commerce_central_auth_state",
  USER_PROFILE: "commerce_central_user_profile",
  REDIRECT_URL: "commerce_central_redirect_url",
  LAST_ACTIVITY: "commerce_central_last_activity",
} as const;

/**
 * Check if we're running in the browser
 */
const isBrowser = typeof window !== "undefined";

/**
 * Safely get item from sessionStorage
 */
const getStorageItem = (key: string): string | null => {
  if (!isBrowser) return null;

  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get item from sessionStorage: ${key}`, error);
    return null;
  }
};

/**
 * Safely set item in sessionStorage
 */
const setStorageItem = (key: string, value: string): void => {
  if (!isBrowser) return;

  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set item in sessionStorage: ${key}`, error);
  }
};

/**
 * Safely remove item from sessionStorage
 */
const removeStorageItem = (key: string): void => {
  if (!isBrowser) return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove item from sessionStorage: ${key}`, error);
  }
};

/**
 * Session data management
 */
export const authSessionStorage = {
  /**
   * Save authentication state to session storage
   */
  saveAuthState: (authState: Partial<SessionData>): void => {
    const existingState = authSessionStorage.getAuthState();
    const newState = {
      ...existingState,
      ...authState,
      lastUpdated: new Date().toISOString(),
    };

    setStorageItem(SESSION_KEYS.AUTH_STATE, JSON.stringify(newState));
    setStorageItem(SESSION_KEYS.LAST_ACTIVITY, new Date().toISOString());
  },

  /**
   * Get authentication state from session storage
   */
  getAuthState: (): SessionData | null => {
    const stored = getStorageItem(SESSION_KEYS.AUTH_STATE);
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored);

      // Check if session is expired (24 hours)
      const lastUpdated = new Date(parsed.lastUpdated || 0);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        authSessionStorage.clearAuthState();
        return null;
      }

      return parsed as SessionData;
    } catch (error) {
      console.warn("Failed to parse stored auth state", error);
      return null;
    }
  },

  /**
   * Clear authentication state from session storage
   */
  clearAuthState: (): void => {
    removeStorageItem(SESSION_KEYS.AUTH_STATE);
    removeStorageItem(SESSION_KEYS.USER_PROFILE);
    removeStorageItem(SESSION_KEYS.LAST_ACTIVITY);
  },

  /**
   * Save user profile to session storage
   */
  saveUserProfile: (profile: UserProfile): void => {
    setStorageItem(SESSION_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  /**
   * Get user profile from session storage
   */
  getUserProfile: (): UserProfile | null => {
    const stored = getStorageItem(SESSION_KEYS.USER_PROFILE);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as UserProfile;
    } catch (error) {
      console.warn("Failed to parse stored user profile", error);
      return null;
    }
  },

  /**
   * Save redirect URL for post-login navigation
   */
  saveRedirectUrl: (url: string): void => {
    setStorageItem(SESSION_KEYS.REDIRECT_URL, url);
  },

  /**
   * Get and clear redirect URL
   */
  getAndClearRedirectUrl: (): string | null => {
    const url = getStorageItem(SESSION_KEYS.REDIRECT_URL);
    if (url) {
      removeStorageItem(SESSION_KEYS.REDIRECT_URL);
    }
    return url;
  },

  /**
   * Update last activity timestamp
   */
  updateLastActivity: (): void => {
    setStorageItem(SESSION_KEYS.LAST_ACTIVITY, new Date().toISOString());
  },

  /**
   * Check if session is still active (within 30 minutes of last activity)
   */
  isSessionActive: (): boolean => {
    const lastActivity = getStorageItem(SESSION_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return false;

    try {
      const lastActivityDate = new Date(lastActivity);
      const now = new Date();
      const minutesDiff =
        (now.getTime() - lastActivityDate.getTime()) / (1000 * 60);

      return minutesDiff < 30; // 30 minutes
    } catch (error) {
      return false;
    }
  },

  /**
   * Get session metadata
   */
  getSessionMetadata: () => {
    const lastActivity = getStorageItem(SESSION_KEYS.LAST_ACTIVITY);
    const authState = authSessionStorage.getAuthState();

    return {
      lastActivity: lastActivity ? new Date(lastActivity) : null,
      isAuthenticated: authState?.isAuthenticated || false,
      userType: authState?.userProfile?.userType || null,
      sessionAge: lastActivity
        ? Math.floor(
            (new Date().getTime() - new Date(lastActivity).getTime()) /
              (1000 * 60)
          )
        : null, // in minutes
    };
  },

  /**
   * Clear all Commerce Central related storage
   */
  clearAll: (): void => {
    Object.values(SESSION_KEYS).forEach((key) => {
      removeStorageItem(key);
    });
  },
};

/**
 * Hook for automatic session activity tracking
 */
export const useSessionActivity = () => {
  if (!isBrowser) return;

  const updateActivity = () => {
    authSessionStorage.updateLastActivity();
  };

  // Track user activity
  const events = ["click", "keypress", "scroll", "mousemove"];

  events.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true });
  });

  // Cleanup function (should be called in useEffect cleanup)
  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, updateActivity);
    });
  };
};
