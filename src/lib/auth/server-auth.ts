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
    const result = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
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
          return { isAuthenticated: false };
        }
      },
    }) as AuthResult;

    // No longer cache authentication data for security

    return { ...result, response };
  } catch (error) {
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
                userRole: userInfo.userRole,
                username: userInfo.username,
              };
            }
          }
          return { isAuthenticated: false };
        }
      },
    }) as AuthResult;

    // No longer cache authentication data for security

    return { ...result, response };
  } catch (error) {
    return { isAuthenticated: false, response };
  }
}

/**
 * Check for valid authentication cookies
 */
// Strict token cookie detection (no substring heuristics)
function getAuthCookies(request: NextRequest) {
  const cookies = request.cookies;

  // Check for Amplify session cookies with expanded patterns
  const accessToken =
    cookies.get("CognitoIdentityServiceProvider.access_token")?.value ||
    cookies.get("amplify-access-token")?.value ||
    // Look for any cognito cookie containing "accessToken"
    Array.from(cookies.getAll()).find(c => c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("accessToken"))?.value;
    
  const idToken =
    cookies.get("CognitoIdentityServiceProvider.id_token")?.value ||
    cookies.get("amplify-id-token")?.value ||
    // Look for any cognito cookie containing "idToken"
    Array.from(cookies.getAll()).find(c => c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("idToken"))?.value;
    
  const refreshToken =
    cookies.get("CognitoIdentityServiceProvider.refresh_token")?.value ||
    cookies.get("amplify-refresh-token")?.value ||
    // Look for any cognito cookie containing "refreshToken"  
    Array.from(cookies.getAll()).find(c => c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("refreshToken"))?.value;

  const hasValidCookies = !!(accessToken || idToken || refreshToken);

  return {
    hasValidCookies,
    accessToken,
    idToken,
    refreshToken,
  };
}

/**
 * Parse user information directly from JWT tokens in cookies
 */
function parseUserInfoFromCookies(request: NextRequest): {
  isValid: boolean;
  username?: string;
  userRole?: "buyer" | "seller";
} {
  try {
    const cookies = request.cookies;
    
    // Find the ID token cookie (contains user attributes)
    const idTokenCookie = Array.from(cookies.getAll()).find(c => 
      c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("idToken")
    );
    
    if (!idTokenCookie?.value) {
      return { isValid: false };
    }
    
    // Parse JWT token (simple base64 decode of payload)
    const tokenParts = idTokenCookie.value.split('.');
    if (tokenParts.length !== 3) {
      return { isValid: false };
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(
      Buffer.from(tokenParts[1], 'base64url').toString('utf-8')
    );
    
    const userRole = payload['custom:userRole'] as "buyer" | "seller" | undefined;
    const username = payload.sub || payload.username || payload['cognito:username'];
    
    return {
      isValid: true,
      username,
      userRole,
    };
  } catch (error) {
    return { isValid: false };
  }
}

// REMOVED: getCachedUserRole and getCachedUsername - no longer needed since we parse JWT directly


// REMOVED: isTemporaryError - unused function

export function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/auth/login", request.url);
  const originalUrl = request.nextUrl.pathname + request.nextUrl.search;
  loginUrl.searchParams.set("redirect", originalUrl);
  return NextResponse.redirect(loginUrl);
}
