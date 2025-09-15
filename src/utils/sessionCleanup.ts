import { signOut } from "aws-amplify/auth";
import { logout } from "@/src/features/authentication/store/authSlice";
import type { AppDispatch } from "@/src/lib/store";

/**
 * Comprehensive session cleanup with improved cookie clearing
 */
export async function forceSessionCleanup(dispatch: AppDispatch): Promise<void> {
  try {
    // Step 1: Sign out from AWS Amplify with global flag
    try {
      await signOut({ global: true });
    } catch (signOutError) {
      console.warn("Amplify signOut failed, continuing cleanup:", signOutError);
    }

    // Step 2: Clear Redux state
    dispatch(logout());

    // Step 3: Clear ALL Cognito-related cookies (improved pattern matching)
    if (typeof window !== "undefined") {
      // Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes("CognitoIdentityServiceProvider") ||
          key.includes("amplify") ||
          key.includes("aws") ||
          key.startsWith("commerce-central-") ||
          key.startsWith("cc-")
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear cookies via document.cookie (client-side accessible ones)
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        if (name.includes("CognitoIdentityServiceProvider") || 
            name.includes("amplify") ||
            name.includes("aws")) {
          // Clear for all possible domains and paths
          const domains = [window.location.hostname, "." + window.location.hostname, ""];
          const paths = ["/", window.location.pathname];
          
          domains.forEach(domain => {
            paths.forEach(path => {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domain ? `; domain=${domain}` : ""}`;
            });
          });
        }
      });
    }

    // Step 4: Wait for cleanup to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.error("Session cleanup failed:", error);
    // Force reload as last resort
    if (typeof window !== "undefined") {
      setTimeout(() => window.location.reload(), 1000);
    }
    throw error;
  }
}

/**
 * Improved cookie detection with better pattern matching
 * Check if user has valid authentication cookies
 * Used to determine if user is potentially authenticated
 */
export function hasValidAuthCookies(): boolean {
    if (typeof document === "undefined") return false;

    const cookies = document.cookie;

    // Check for AWS Cognito or Amplify authentication cookies
    const authCookiePatterns = [
        "CognitoIdentityServiceProvider",
        "amplify-access-token",
        "amplify-id-token",
        "amplify-refresh-token"
    ];

    return authCookiePatterns.some(pattern => cookies.includes(pattern));
}

/**
 * Wait for authentication cookies to be set
 * Useful after login to ensure server-side operations can read cookies
 */
export async function waitForAuthCookies(
    maxWaitTimeMs: number = 5000,
    checkIntervalMs: number = 500
): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTimeMs) {
        if (hasValidAuthCookies()) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }

    return false;
}

/**
 * Retry function with exponential backoff
 * Generic utility for retrying operations that might fail due to timing
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 1000,
    maxDelayMs: number = 10000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                break;
            }

            const delay = Math.min(
                baseDelayMs * Math.pow(2, attempt - 1),
                maxDelayMs
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
