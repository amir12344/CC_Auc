import { NextRequest, NextResponse } from "next/server";

import { fetchUserAttributes } from "aws-amplify/auth/server";
import { generateClient } from "aws-amplify/data";

import "@/amplify-config";

import { type Schema } from "@/amplify/data/resource";
import { validateAmplifySession } from "@/src/lib/auth/server-auth";
import { runWithAmplifyServerContext } from "@/src/utils/amplify-server-utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAmplifySession(request);
    if (!auth.isAuthenticated || !auth.username) {
      return NextResponse.json({ booking: null }, { status: 401 });
    }

    // Get user email from Amplify user attributes
    const response = NextResponse.next();
    const result = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const attributes = await fetchUserAttributes(contextSpec);
          return attributes.email || null;
        } catch {
          return null;
        }
      },
    });

    const userEmail = result as string | null;
    if (!userEmail) {
      return NextResponse.json({ booking: null }, { status: 401 });
    }

    const client = generateClient<Schema>({ authMode: "userPool" });

    // Try searching by email first
    let data: any[] = [];
    let errors: any[] = [];
    try {
      const result = await client.models.MeetingBooking.list({
        filter: {
          buyerEmail: { eq: userEmail },
          status: { eq: "BOOKED" },
        },
        limit: 50,
        authMode: "apiKey",
      });
      data = result.data || [];
      errors = result.errors || [];
    } catch (queryError: any) {
      data = [];
      errors = [
        { message: `Query failed: ${queryError?.message || "Unknown error"}` },
      ];
    }

    // If no results found by email, try searching by buyerId as fallback
    if ((!data || data.length === 0) && auth.username) {
      try {
        const fallbackResult = await client.models.MeetingBooking.list({
          filter: {
            buyerId: { eq: auth.username },
            status: { eq: "BOOKED" },
          },
          limit: 50,
          authMode: "apiKey",
        });
        data = fallbackResult.data || [];
        errors = (fallbackResult.errors || []) as any[];
      } catch (fallbackError: any) {}
    }

    if (errors && errors.length > 0) {
      return NextResponse.json({ booking: null, errors }, { status: 500 });
    }

    const sorted = (data || []).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const active = sorted[0] || null;
    return NextResponse.json({ booking: active ?? null }, { status: 200 });
  } catch {
    return NextResponse.json({ booking: null }, { status: 200 });
  }
}
