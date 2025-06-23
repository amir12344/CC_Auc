import { type NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '../../utils/amplify-server-utils';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth/server';

export interface AuthResult {
  isAuthenticated: boolean;
  userRole?: 'buyer' | 'seller';
  username?: string;
  response?: NextResponse;
}

export async function validateAmplifySession(request: NextRequest): Promise<AuthResult> {
  const response = NextResponse.next();
  const result: Omit<AuthResult, 'response'> = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const user = await getCurrentUser(contextSpec);
        const attributes = await fetchUserAttributes(contextSpec);
        const userRole = attributes['custom:userRole'] as 'buyer' | 'seller' | undefined;
        
        return { isAuthenticated: !!user, userRole, username: user.username };
      } catch (error) {
        console.log('validateAmplifySession: No authenticated user found.');
        return { isAuthenticated: false };
      }
    },
  });

  return { ...result, response };
}

export function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL('/auth/login', request.url);
    const originalUrl = request.nextUrl.pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', originalUrl);
    return NextResponse.redirect(loginUrl);
} 