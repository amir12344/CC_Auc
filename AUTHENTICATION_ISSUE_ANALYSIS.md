# Authentication Flow Analysis & Fix Documentation

## Executive Summary

The authentication issue you're experiencing has **THREE ROOT CAUSES**:

1. **Incorrect Amplify Server Context Usage**: The app is using the wrong context format for Next.js App Router
2. **Race Condition**: Verification status API is called before auth cookies are properly set
3. **Session Persistence**: User session not properly cleared when switching accounts

## Detailed Issue Analysis

### 🔴 Issue 1: Incorrect Amplify Server Context Implementation

**Current Implementation (WRONG):**
```typescript
// In server-auth.ts line 30-31
nextServerContext: { request, response }
```

**Problem:** 
- This format is for Next.js **Pages Router**, not App Router
- Amplify Gen2 for Next.js App Router requires the `cookies` function from `next/headers`
- This causes `UserUnAuthenticatedException` even when valid cookies exist

**Evidence from your logs:**
- `GET /api/auth/verification-status 401` - failing because server context can't read auth cookies
- Fallback JWT parsing is working (your temporary fix) but shouldn't be necessary

### 🔴 Issue 2: Race Condition in Authentication Flow

**Current Flow:**
1. User logs in → `signIn()` completes
2. `handleSuccessfulLogin()` immediately calls `dispatch(initializeAuth())`
3. `initializeAuth` triggers `fetchVerificationStatus()` API call
4. **PROBLEM**: API call happens before auth cookies are fully propagated
5. API returns 401 because cookies aren't ready yet

**Evidence:**
- Verification API returns 401 immediately after login
- Works in production (likely due to different timing/latency)
- Your log: `GET /api/auth/verification-status 401 in 6792ms`

### 🔴 Issue 3: Session Not Properly Cleared When Switching Users

**Current Issue:**
- When `UserAlreadyAuthenticatedException` occurs, the old user's session persists
- `forceSessionCleanup` doesn't properly clear server-side cookies
- Amplify's cookie names include dynamic user pool IDs that aren't being matched

**Evidence:**
- "user already logged in syncing in but it instead logs into my last user"
- Cookie patterns in `getAuthCookies` are incomplete

## Complete Fix Implementation

### Fix 1: Update Amplify Server Context for App Router

**File: `src/utils/amplify-server-utils.ts`**
```typescript
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { cookies } from "next/headers";
import { outputs } from "../../amplify-config";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

// Helper function for App Router context
export async function runWithAmplifyServerContextAppRouter<T>(
  operation: (contextSpec: any) => Promise<T>
): Promise<T> {
  const cookieStore = await cookies();
  
  return runWithAmplifyServerContext({
    nextServerContext: { cookies: cookieStore },
    operation,
  });
}
```

### Fix 2: Update server-auth.ts to Use Correct Context

**File: `src/lib/auth/server-auth.ts`**
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "../../utils/amplify-server-utils";

export interface AuthResult {
  isAuthenticated: boolean;
  userRole?: "buyer" | "seller";
  username?: string;
  verificationStatus?: "pending" | "verified" | "rejected" | null;
  accountLocked?: boolean;
  response?: NextResponse;
}

/**
 * Validates Amplify session with proper App Router context
 */
export async function validateAmplifySession(
  request: NextRequest
): Promise<AuthResult> {
  const response = NextResponse.next();

  try {
    // For middleware context, we need to use request/response
    // This is a special case for middleware only
    const isMiddlewareContext = !!(request as any).nextUrl;
    
    if (isMiddlewareContext) {
      // Middleware context - use request/response pattern
      return await validateAmplifySessionMiddleware(request, response);
    }
    
    // API Route context - use cookies pattern
    const cookieStore = await cookies();
    
    const result = await runWithAmplifyServerContext({
      nextServerContext: { cookies: cookieStore },
      operation: async (contextSpec) => {
        try {
          const user = await getCurrentUser(contextSpec);
          
          if (!user) {
            return { isAuthenticated: false };
          }

          const attributes = await fetchUserAttributes(contextSpec);
          const userRole = attributes["custom:userRole"] as "buyer" | "seller" | undefined;

          return {
            isAuthenticated: true,
            userRole,
            username: user.username,
          };
        } catch (error) {
          console.error("Auth validation error:", error);
          return { isAuthenticated: false };
        }
      },
    });

    // Cache successful authentication
    if (result.isAuthenticated && result.userRole) {
      cacheAuthData(response, result);
    }

    return { ...result, response };
  } catch (error) {
    console.error("Session validation failed:", error);
    return { isAuthenticated: false, response };
  }
}

/**
 * Special validation for middleware context only
 */
async function validateAmplifySessionMiddleware(
  request: NextRequest,
  response: NextResponse
): Promise<AuthResult> {
  try {
    // For middleware, we still need request/response pattern
    const result = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const user = await getCurrentUser(contextSpec);
          
          if (!user) {
            return { isAuthenticated: false };
          }

          const attributes = await fetchUserAttributes(contextSpec);
          const userRole = attributes["custom:userRole"] as "buyer" | "seller" | undefined;

          return {
            isAuthenticated: true,
            userRole,
            username: user.username,
          };
        } catch (error) {
          // Check cookies as fallback for middleware
          const authCookies = getAuthCookies(request);
          if (authCookies.hasValidCookies) {
            const userInfo = parseUserInfoFromCookies(request);
            if (userInfo.isValid) {
              return {
                isAuthenticated: true,
                userRole: userInfo.userRole || getCachedUserRole(request),
                username: userInfo.username || getCachedUsername(request),
              };
            }
          }
          return { isAuthenticated: false };
        }
      },
    });

    if (result.isAuthenticated && result.userRole) {
      cacheAuthData(response, result);
    }

    return { ...result, response };
  } catch (error) {
    console.error("Middleware session validation failed:", error);
    return { isAuthenticated: false, response };
  }
}

// Keep existing helper functions...
```

### Fix 3: Update API Route to Use Proper Context

**File: `src/app/api/auth/verification-status/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/src/utils/amplify-server-utils";
import { fetchUserVerificationStatus } from "@/src/app/(shop)/buyer/account/services/profileQueryService";

export async function GET(request: NextRequest) {
  try {
    // Use cookies context for App Router API routes
    const cookieStore = await cookies();
    
    const auth = await runWithAmplifyServerContext({
      nextServerContext: { cookies: cookieStore },
      operation: async (contextSpec) => {
        try {
          const user = await getCurrentUser(contextSpec);
          if (!user) {
            return { isAuthenticated: false };
          }

          const attributes = await fetchUserAttributes(contextSpec);
          return {
            isAuthenticated: true,
            username: user.username,
            userRole: attributes["custom:userRole"] as "buyer" | "seller",
          };
        } catch (error) {
          console.error("Auth check in verification API:", error);
          return { isAuthenticated: false };
        }
      },
    });

    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    let verificationStatus: "verified" | "pending" | "rejected" | null = null;
    let accountLocked: boolean | null = null;

    if (auth.userRole === "buyer") {
      const result = await fetchUserVerificationStatus(auth.username);

      if (result.error && result.error !== "User not authenticated") {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      if (result.data) {
        verificationStatus = result.data.verification_status?.toLowerCase() as
          | "verified"
          | "pending"
          | "rejected"
          | null;
        accountLocked = result.data.account_locked;
      }
    } else if (auth.userRole === "seller") {
      verificationStatus = "verified";
      accountLocked = false;
    }

    verificationStatus = verificationStatus || "pending";
    accountLocked = accountLocked ?? false;

    const response = NextResponse.json({
      verificationStatus,
      accountLocked,
    });

    // Set cookies for middleware caching
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24,
      path: "/",
    };

    response.cookies.set("verification-status", verificationStatus, cookieOptions);
    response.cookies.set("account-locked", String(accountLocked), cookieOptions);

    return response;
  } catch (error) {
    console.error("Verification status API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### Fix 4: Improve Session Cleanup and Cookie Management

**File: `src/utils/sessionCleanup.ts`**
```typescript
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
 */
export function hasValidAuthCookies(): boolean {
  if (typeof document === "undefined") return false;

  const cookies = document.cookie;
  
  // Check for any Cognito/Amplify cookies with improved patterns
  const patterns = [
    /CognitoIdentityServiceProvider\.[^.]+\.(accessToken|idToken|refreshToken)/,
    /amplify-(access|id|refresh)-token/,
    /aws-amplify/
  ];

  return patterns.some(pattern => pattern.test(cookies));
}
```

### Fix 5: Add Retry Logic to Login Flow

**File: `src/app/auth/login/LoginForm.tsx` (Update handleSuccessfulLogin)**
```typescript
async function handleSuccessfulLogin() {
  try {
    setIsRedirecting(true);
    
    // Wait for auth cookies to be set before proceeding
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch user attributes with retry
    const fetchAttributesWithRetry = async (attempts = 3): Promise<string> => {
      for (let i = 0; i < attempts; i++) {
        try {
          const attributes = await fetchUserAttributes();
          return (attributes["custom:userRole"] as "buyer" | "seller") ?? "buyer";
        } catch (error) {
          if (i === attempts - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
      return "buyer";
    };

    const userType = await fetchAttributesWithRetry();
    
    toast({
      title: "Login Successful! 🎉",
      description:
        userType === "seller"
          ? "Redirecting you to seller dashboard..."
          : "Redirecting you to marketplace...",
    });
    
    // Initialize auth state with retry
    let authInitialized = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await dispatch(initializeAuth()).unwrap();
        authInitialized = true;
        break;
      } catch (error) {
        console.warn(`Auth initialization attempt ${attempt + 1} failed:`, error);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    if (!authInitialized) {
      throw new Error("Failed to initialize authentication");
    }
    
    // Fetch verification status for buyers with retry
    if (userType === "buyer") {
      let verificationFetched = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await dispatch(fetchVerificationStatus()).unwrap();
          verificationFetched = true;
          break;
        } catch (error) {
          console.warn(`Verification fetch attempt ${attempt + 1} failed:`, error);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
          }
        }
      }
      
      if (!verificationFetched) {
        // Set default verification status if fetch fails
        dispatch(updateVerificationStatus({ 
          verificationStatus: "pending", 
          accountLocked: false 
        }));
      }
    }
    
    if (redirectTo !== "/marketplace") {
      authSessionStorage.saveRedirectUrl(redirectTo);
    }
    
    const finalUrl = await getRedirectUrlForUser();
    setTimeout(() => router.push(finalUrl), 1500);
  } catch (error) {
    console.error("Login successful but post-login setup failed:", error);
    setIsRedirecting(false);
    toast({
      variant: "destructive",
      title: "Login Error",
      description:
        "Authentication successful but there was an issue setting up your session. Please refresh the page.",
    });
    setTimeout(() => router.push(redirectTo), 2000);
  }
}
```

## Environment-Specific Configuration

### Local Development Fix
Add to `.env.local`:
```env
# Increase cookie timeout for local development
NEXT_PUBLIC_AUTH_COOKIE_TIMEOUT=86400
NEXT_PUBLIC_AUTH_RETRY_ATTEMPTS=5
NEXT_PUBLIC_AUTH_RETRY_DELAY=2000
```

### Production Configuration
The issue doesn't occur in production likely due to:
1. Faster cookie propagation with proper domain settings
2. Different latency characteristics
3. Potentially different Amplify configuration

## Testing Checklist

After implementing these fixes, test:

- [ ] Fresh login works without 401 errors
- [ ] Switching between users clears previous session completely
- [ ] Verification status loads correctly for buyers
- [ ] No redirect loops on login page
- [ ] Session persists across page refreshes
- [ ] Logout completely clears all auth state

## Additional Recommendations

1. **Add comprehensive logging** in development to track auth flow
2. **Implement auth state monitoring** in Redux DevTools
3. **Consider using Amplify Hub** to listen for auth events
4. **Add session refresh mechanism** for long-running sessions
5. **Implement proper error boundaries** for auth failures

## Migration Steps

1. Update `amplify-server-utils.ts` first
2. Update `server-auth.ts` with new context handling
3. Update all API routes to use proper context
4. Update `sessionCleanup.ts` for better cookie clearing
5. Add retry logic to `LoginForm.tsx`
6. Test thoroughly in local environment
7. Deploy to staging and verify
8. Deploy to production with monitoring

## References

- [Amplify Gen2 Next.js Documentation](https://docs.amplify.aws/gen2/build-a-backend/auth/connect-your-frontend/nextjs/)
- [Next.js App Router Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [AWS Amplify Server-Side Rendering Guide](https://docs.amplify.aws/gen2/build-a-backend/server-side-rendering/)

---

**Created**: 2025-01-10
**Status**: Ready for Implementation
**Priority**: Critical
**Impact**: Affects all user authentication flows
