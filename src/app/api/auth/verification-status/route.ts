import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/src/utils/amplify-server-utils";
import { fetchUserVerificationStatus } from "@/src/app/(shop)/buyer/account/services/profileQueryService";

// Import helper functions from server-auth for JWT fallback
function getAuthCookies(request: NextRequest) {
  const cookies = request.cookies;
  const accessToken = Array.from(cookies.getAll()).find(c => 
    c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("accessToken")
  )?.value;
  const idToken = Array.from(cookies.getAll()).find(c => 
    c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("idToken")
  )?.value;
  const refreshToken = Array.from(cookies.getAll()).find(c => 
    c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("refreshToken")
  )?.value;
  
  return {
    hasValidCookies: !!(accessToken || idToken || refreshToken),
    accessToken, idToken, refreshToken,
  };
}

function parseUserInfoFromCookies(request: NextRequest): {
  isValid: boolean; username?: string; userRole?: "buyer" | "seller";
} {
  try {
    const cookies = request.cookies;
    const idTokenCookie = Array.from(cookies.getAll()).find(c => 
      c.name.includes("CognitoIdentityServiceProvider") && c.name.includes("idToken")
    );
    
    if (!idTokenCookie?.value) return { isValid: false };
    
    const tokenParts = idTokenCookie.value.split('.');
    if (tokenParts.length !== 3) return { isValid: false };
    
    const payload = JSON.parse(
      Buffer.from(tokenParts[1], 'base64url').toString('utf-8')
    );
    
    return {
      isValid: true,
      username: payload.sub || payload.username || payload['cognito:username'],
      userRole: payload['custom:userRole'] as "buyer" | "seller" | undefined,
    };
  } catch {
    return { isValid: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use cookies context for App Router API routes with JWT fallback
    const auth = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
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
          // Fallback: Parse JWT from cookies like middleware does
          const authCookies = getAuthCookies(request);
          if (authCookies.hasValidCookies) {
            const userInfo = parseUserInfoFromCookies(request);
            if (userInfo.isValid) {
              return {
                isAuthenticated: true,
                username: userInfo.username,
                userRole: userInfo.userRole,
              };
            }
          }
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

    // SECURITY FIX: No longer set verification status in cookies
    // Middleware now always validates server-side instead of trusting cookies
    const response = NextResponse.json({
      verificationStatus,
      accountLocked,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
