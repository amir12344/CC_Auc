import { NextResponse, type NextRequest } from "next/server";

import {
  redirectToLogin,
  validateAmplifySession,
} from "./lib/auth/server-auth";

// REMOVED: getVerificationStatusFromCookies - no longer trust client-side cookies for security

/**
 * Check if user has valid authentication cookies
 * Prevents API calls when user is not actually authenticated
 */
function hasValidAuthCookies(request: NextRequest): boolean {
  const cookies = request.cookies;

  // Check for AWS Cognito or Amplify authentication cookies
  const accessToken =
    cookies.get("CognitoIdentityServiceProvider.access_token")?.value ||
    cookies.get("amplify-access-token")?.value;
  const idToken =
    cookies.get("CognitoIdentityServiceProvider.id_token")?.value ||
    cookies.get("amplify-id-token")?.value;
  const refreshToken =
    cookies.get("CognitoIdentityServiceProvider.refresh_token")?.value ||
    cookies.get("amplify-refresh-token")?.value;

  return !!(accessToken || idToken || refreshToken);
}

/**
 * Checks if the pathname is for a static file or public page that should skip middleware
 */
function isStaticOrPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/website") ||
    pathname === "/"
  );
}

/**
 * Handles role-based access control and redirects
 * SECURITY: Always validates against server-side data, never trusts client cookies
 */
async function handleRoleBasedAccess(
  pathname: string,
  userRole: "buyer" | "seller" | undefined,
  request: NextRequest
): Promise<NextResponse | null> {
  // If no role is defined, redirect to login
  if (!userRole) {
    return redirectToLogin(request);
  }

  if (pathname.startsWith("/buyer") && userRole !== "buyer") {
    if (userRole === "seller") {
      return NextResponse.redirect(new URL("/seller/dashboard", request.url));
    }
    return redirectToLogin(request);
  }

  if (pathname.startsWith("/seller") && userRole !== "seller") {
    if (userRole === "buyer") {
      return NextResponse.redirect(new URL("/buyer/deals", request.url));
    }
    return redirectToLogin(request);
  }

  // SECURITY: For buyers, ALWAYS validate verification status server-side
  if (userRole !== "buyer") {
    return null;
  }

  // Allow access to verification pending page and auth routes
  const allowlist = new Set(["/buyer/verification-pending", "/"]);
  if (allowlist.has(pathname) || pathname.startsWith("/auth/")) {
    return null;
  }

  const isBuyerProtectedRoute =
    pathname.startsWith("/buyer") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/collections");

  if (!isBuyerProtectedRoute) {
    return null;
  }

  // CRITICAL SECURITY FIX: Always validate server-side, never trust cookies
  try {
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${process.env.NODE_ENV === "production" ? "https" : "http"}://${host}`;
    const absoluteUrl = new URL("/api/auth/verification-status", baseUrl);
    const apiResponse = await fetch(absoluteUrl.toString(), {
      headers: { Cookie: request.headers.get("cookie") || "" },
    });
    
    if (apiResponse.ok) {
      const data = (await apiResponse.json()) as {
        verificationStatus?: string;
        accountLocked?: boolean;
      };
      
      // Check for account lock status
      if (data.accountLocked) {
        return NextResponse.redirect(new URL("/auth/account-locked", request.url));
      }
      
      // Allow verified users through
      if (data.verificationStatus === "verified") {
        return null;
      }
    } else if (apiResponse.status === 401) {
      return redirectToLogin(request);
    }
  } catch {
    // On API failure, fail secure - redirect to verification pending
  }

  // Default: redirect unverified users to verification pending
  return NextResponse.redirect(
    new URL("/buyer/verification-pending", request.url)
  );
}

function normalizePathname(pathname: string): string {
  let newPathname = pathname;

  // Remove trailing slash if present (except for root path)
  if (pathname !== "/" && pathname.endsWith("/")) {
    newPathname = newPathname.slice(0, -1);
  }

  // Convert to lowercase if needed, but preserve case for dynamic params in marketplace routes
  if (newPathname !== newPathname.toLowerCase()) {
    if (newPathname.startsWith("/marketplace")) {
      // Split path and lowercase only static segments (up to /marketplace/segment/)
      const parts = newPathname.split("/");
      const normalizedParts = parts.map((part, index) => {
        // Lowercase only the first 3 parts (e.g., '', 'marketplace', 'catalog') and leave dynamic ID as is
        return index < 3 ? part.toLowerCase() : part;
      });
      newPathname = normalizedParts.join("/");
    } else {
      newPathname = newPathname.toLowerCase();
    }
  }

  return newPathname;
}

/* MAINTAINS SECURITY: Never allows unauthorized access to protected routes
 * Graceful failure: Prevents site crashes while maintaining security
 * URL Normalization: Converts URLs to lowercase and handles trailing slashes
 */
export async function middleware(request: NextRequest) {
  // First, clone the request headers and set the pathname
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-pathname", request.nextUrl.pathname);

  // Create a response object that continues the chain with the new headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and public pages
  if (isStaticOrPublicPath(pathname)) {
    return response; // Return the response with the added header
  }

  // Normalize the pathname
  const normalizedPathname = normalizePathname(pathname);

  // If normalization changed the pathname, redirect to the normalized URL
  if (normalizedPathname !== pathname) {
    const newUrl = new URL(normalizedPathname, request.url);
    return NextResponse.redirect(newUrl);
  }

  // Protect buyer, seller, and marketplace routes; allow /auth/* to pass through until we know auth status
  const protectedRoutes = [
    "/buyer",
    "/seller",
    "/marketplace",
    "/search",
    "/collections",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return response; // Return the response with the added header
  }

  // SECURITY: For protected and auth routes, we MUST validate authentication
  try {
    const authResult = await validateAmplifySession(request);

    // Allow all /auth/* routes to continue; we handle redirects inside those pages to prevent loops
    if (pathname.startsWith("/auth")) return response;

    // If authentication validation fails on protected routes, ALWAYS redirect to login
    if (!authResult.isAuthenticated) {
      return redirectToLogin(request);
    }

    // SECURITY FIX: Use server-side validation only, no cookie trust
    const roleBasedResponse = await handleRoleBasedAccess(
      pathname,
      authResult.userRole,
      request
    );
    if (roleBasedResponse) {
      return roleBasedResponse;
    }

    // Preserve any Set-Cookie headers from auth validation response
    if (authResult.response) {
      const setCookieHeader = authResult.response.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.append("set-cookie", setCookieHeader);
      }
    }

    return response;
  } catch {
    // SECURITY: If middleware crashes, we REDIRECT TO LOGIN for protected routes
    // This ensures security is maintained even during system failures
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest (PWA manifest)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.).*)",
  ],
};
