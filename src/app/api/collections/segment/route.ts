import { NextResponse } from "next/server";

import {
  fetchSegmentOnlyListings,
  type PreferenceBasedListingsResponse,
} from "@/src/features/marketplace-catalog/services/catalogPreferenceQueryService";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";
import { runWithAmplifyServerContext } from "@/src/utils/amplify-server-utils";
import { resolveImageUrlCached } from "@/src/utils/serverImageCache";

export const revalidate = 60;

export async function POST(req: Request) {
  const { segments, limit } = (await req.json()) as {
    segments: string[];
    limit?: number;
  };
  const data = (await runWithAmplifyServerContext({
    nextServerContext: { request: req as any, response: NextResponse.next() },
    operation: () =>
      fetchSegmentOnlyListings(segments, limit ? { limit } : undefined),
  })) as PreferenceBasedListingsResponse;
  const listings = await Promise.all(
    (data.listings as CombinedListing[]).map(async (l: CombinedListing) => {
      if (l.images && l.images[0]) {
        const url = await resolveImageUrlCached(l.images[0].s3_key);
        const withCatalogImages: CombinedListing = {
          ...l,
          catalog_listing_images: [
            {
              images: { s3_key: l.images[0].s3_key, processed_url: url ?? "" },
            },
          ],
        };
        return withCatalogImages;
      }
      return l;
    })
  );
  return NextResponse.json({ ...(data as object), listings });
}
