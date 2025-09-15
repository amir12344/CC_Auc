import { useEffect, useMemo, useRef, useState } from "react";

import { selectAmplifyUser } from "@/src/features/authentication/store/authSelectors";
import { useAppDispatch, useAppSelector } from "@/src/lib/store";

import { getStateCodesForRegions } from "../../buyer-preferences/data/preferenceOptions";
import { getBuyerSegmentDisplayName } from "../../buyer-preferences/data/segments";
import {
  fetchBuyerPreferences,
  selectBuyerPreferences,
  selectBuyerPreferencesIsSet,
  selectBuyerPreferencesStatus,
} from "../../buyer-preferences/store/buyerPreferencesSlice";
import type { GetBuyerPreferenceApiRequest } from "../../buyer-preferences/types/preferences";
import { setViewAllContext } from "../../collections/store/viewAllContextSlice";
import {
  fetchPreferenceBasedListings as svcFetchPreferenceBasedListings,
  fetchPrivateOffersListings as svcFetchPrivateOffersListings,
  fetchRegionOnlyListings as svcFetchRegionOnlyListings,
} from "../services/catalogPreferenceQueryService";
// Server-first: use Next API routes with ISR instead of calling Amplify on the client
import type { PreferenceSectionData } from "../services/preferenceSectionService";
import { selectPreferenceListingsStatus } from "../store/preferenceListingsSlice";
import { setSectionsCacheEntry } from "../store/sectionsCacheSlice";
import type { CombinedListing } from "../types/combined-listing";
import { createPreferencesCacheKey } from "../utils/preferencesCacheKey";

interface UsePreferenceSectionsReturn {
  sections: PreferenceSectionData[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  hasPreferences: boolean;
  shouldShowPopup: boolean;
  sectionsLoading: boolean;
  loadingSectionCount: number;
  totalSectionCount: number;
}

/**
 * Builder: Segment-only section ("Because you sell …")
 */
async function buildSegmentSection(
  userPrefs: GetBuyerPreferenceApiRequest,
  createViewAll: ViewAllContextCreator
): Promise<PreferenceSectionData | null> {
  if (!userPrefs.buyerSegments || userPrefs.buyerSegments.length === 0) {
    return null;
  }

  const segmentOnlyPreferences: GetBuyerPreferenceApiRequest = {
    buyerSegments: userPrefs.buyerSegments,
    preferredCategories: [],
    preferredSubcategories: [],
    preferredBrandIds: [],
    budgetMin: 0,
    budgetMax: 999_999,
    listingTypePreferences: [],
    preferredRegions: [],
  };

  let segmentResponse: { listings: CombinedListing[] };
  try {
    const res = await fetch("/api/collections/segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments: userPrefs.buyerSegments, limit: 8 }),
    });
    if (!res.ok) throw new Error("api failed");
    segmentResponse = await res.json();
  } catch {
    segmentResponse = await svcFetchPreferenceBasedListings(
      segmentOnlyPreferences,
      "segment-priority"
    );
  }
  const segmentCatalogListings = (
    segmentResponse.listings as CombinedListing[]
  ).filter((l): l is CombinedListing => l.listing_source === "catalog");
  if (segmentCatalogListings.length === 0) {
    return null;
  }

  const segmentNames = (userPrefs.buyerSegments || [])
    .filter(Boolean)
    .map(getBuyerSegmentDisplayName);
  const title = `Because you sell on ${segmentNames.join(", ")}`;

  const segmentParams = (userPrefs.buyerSegments || [])
    .filter(Boolean)
    .map((segment) =>
      getBuyerSegmentDisplayName(segment).toLowerCase().replace(/\s/g, "-")
    )
    .join(",");
  const viewAllLink = `/collections/segment/multiple?segments=${encodeURIComponent(
    segmentParams
  )}`;

  createViewAll(
    "buyerSegment",
    userPrefs.buyerSegments || [],
    title,
    segmentOnlyPreferences
  );

  return {
    title,
    listings: segmentCatalogListings,
    type: "buyerSegment",
    viewAllLink,
  };
}

/**
 * Builder: Live Auctions section
 */
async function buildAuctionsSection(
  userPrefs: GetBuyerPreferenceApiRequest
): Promise<PreferenceSectionData | null> {
  const auctionOnlyPreferences: GetBuyerPreferenceApiRequest = {
    buyerSegments: [],
    preferredCategories: [],
    preferredSubcategories: [],
    preferredBrandIds: [],
    budgetMin: 0,
    budgetMax: 999_999,
    listingTypePreferences: ["AUCTION"],
    preferredRegions: [],
  };

  let auctionResponse: { listings: CombinedListing[] };
  try {
    const res = await fetch("/api/collections/preference-based", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: auctionOnlyPreferences }),
    });
    if (!res.ok) throw new Error("api failed");
    auctionResponse = await res.json();
  } catch {
    auctionResponse = await svcFetchPreferenceBasedListings(
      auctionOnlyPreferences
    );
  }
  const auctionListings = (
    auctionResponse.listings as CombinedListing[]
  ).filter((l): l is CombinedListing => l.listing_source === "auction");
  if (auctionListings.length === 0) {
    return null;
  }
  return {
    title: "Live Auctions",
    listings: auctionListings,
    type: "auction",
    viewAllLink: "/collections/auctions",
  };
}

/**
 * Builder: Private Offers Listings section
 */
async function buildPrivateOffersSection(): Promise<PreferenceSectionData | null> {
  let privateOffersResponse: { listings: CombinedListing[] };
  try {
    const res = await fetch("/api/collections/private-offers", {
      method: "GET",
    });
    if (!res.ok) throw new Error("api failed");
    privateOffersResponse = await res.json();
  } catch {
    privateOffersResponse = await svcFetchPrivateOffersListings({ limit: 8 });
  }
  const privateOfferListings = (
    privateOffersResponse.listings as CombinedListing[]
  ).filter((l): l is CombinedListing => l.listing_source === "catalog");
  if (privateOfferListings.length === 0) {
    return null;
  }
  return {
    title: "Private Offers Listings",
    listings: privateOfferListings,
    type: "catalog",
    viewAllLink: "/collections/private-offers",
  };
}

/**
 * Builder: Categories For You section
 */
async function buildCategoriesSection(
  userPrefs: GetBuyerPreferenceApiRequest,
  createViewAll: ViewAllContextCreator
): Promise<PreferenceSectionData | null> {
  const hasCats = (userPrefs.preferredCategories?.length || 0) > 0;
  const hasSubs = (userPrefs.preferredSubcategories?.length || 0) > 0;
  if (!hasCats && !hasSubs) {
    return null;
  }

  const categoryOnlyPreferences: GetBuyerPreferenceApiRequest = {
    buyerSegments: [],
    preferredCategories: userPrefs.preferredCategories || [],
    preferredSubcategories: userPrefs.preferredSubcategories || [],
    preferredBrandIds: [],
    budgetMin: userPrefs.budgetMin || 0,
    budgetMax: userPrefs.budgetMax || 999_999,
    listingTypePreferences: [],
    preferredRegions: [],
  };

  let categoryResponse: { listings: CombinedListing[] };
  try {
    const res = await fetch("/api/collections/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categories: categoryOnlyPreferences.preferredCategories,
        limit: 8,
      }),
    });
    if (!res.ok) throw new Error("api failed");
    categoryResponse = await res.json();
  } catch {
    categoryResponse = await svcFetchPreferenceBasedListings(
      categoryOnlyPreferences
    );
  }
  const categoryCatalogListings = (
    categoryResponse.listings as CombinedListing[]
  ).filter((l): l is CombinedListing => l.listing_source === "catalog");
  if (categoryCatalogListings.length === 0) {
    return null;
  }

  const title = "Categories For You";
  const actualCategories = userPrefs.preferredCategories || [];
  const categoryParams = actualCategories.join(",");
  const viewAllLink = `/collections/category/multiple?actualCategories=${encodeURIComponent(categoryParams)}`;

  createViewAll("category", actualCategories, title, categoryOnlyPreferences);

  return {
    title,
    listings: categoryCatalogListings,
    type: "category",
    viewAllLink,
  };
}

/**
 * Builder: Near You section
 */
async function buildNearYouSection(
  userPrefs: GetBuyerPreferenceApiRequest,
  createViewAll: ViewAllContextCreator
): Promise<PreferenceSectionData | null> {
  const regions = userPrefs.preferredRegions || [];
  if (regions.length === 0) return null;

  // Map enum values to REGION_OPTIONS keys
  const regionEnumToKey: Record<string, string> = {
    NORTHEAST_US: "Northeast",
    MIDWEST_US: "Midwest",
    SOUTH_US: "South",
    WEST_US: "West",
  };
  const regionKeys = regions
    .map((enumValue) => regionEnumToKey[enumValue])
    .filter(Boolean);
  const stateCodes = getStateCodesForRegions(regionKeys);
  if (!stateCodes || stateCodes.length === 0) return null;

  let regionResponse: { listings: CombinedListing[] };
  try {
    const res = await fetch("/api/collections/near-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateCodes, limit: 8 }),
    });
    if (!res.ok) throw new Error("api failed");
    regionResponse = await res.json();
  } catch {
    regionResponse = await svcFetchRegionOnlyListings(stateCodes, { limit: 8 });
  }
  const regionCatalogListings = (
    regionResponse.listings as CombinedListing[]
  ).filter((l): l is CombinedListing => l.listing_source === "catalog");
  if (regionCatalogListings.length === 0) {
    return null;
  }

  const title = "Near You";
  const viewAllLink = "/collections/near-you";
  const nearYouContextPreferences: GetBuyerPreferenceApiRequest = {
    buyerSegments: [],
    preferredCategories: [],
    preferredSubcategories: [],
    preferredBrandIds: [],
    budgetMin: 0,
    budgetMax: 999_999,
    listingTypePreferences: [],
    preferredRegions: regions,
  };

  createViewAll("nearYou", regions, title, nearYouContextPreferences);

  return {
    title,
    listings: regionCatalogListings,
    type: "nearYou",
    viewAllLink,
  };
}

/**
 * Create ViewAll context for Redux dispatch
 */
type ViewAllContextCreator = (
  sectionType:
    | "category"
    | "subcategory"
    | "buyerSegment"
    | "catalog"
    | "auction"
    | "nearYou",
  sectionValue: string | string[],
  sectionTitle: string,
  userPreferences: GetBuyerPreferenceApiRequest
) => void;

/**
 * Hook to manage dynamic preference-based sections on the marketplace page
 */
export function usePreferenceSections(): UsePreferenceSectionsReturn {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectAmplifyUser)?.userId || null;
  const preferences = useAppSelector(selectBuyerPreferences);
  const preferencesStatus = useAppSelector(selectBuyerPreferencesStatus);
  const hasPreferences = useAppSelector(selectBuyerPreferencesIsSet);
  const listingsStatus = useAppSelector(selectPreferenceListingsStatus);

  const [sections, setSections] = useState<PreferenceSectionData[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [loadingSectionCount, setLoadingSectionCount] = useState(0);
  const [totalSectionCount, setTotalSectionCount] = useState(0);
  const [sectionsError, setSectionsError] = useState<string | null>(null);
  const generationRef = useRef(0);

  // Clear local sections immediately when user changes to avoid stale UI
  useEffect(() => {
    setSections([]);
    setLoadingSectionCount(0);
    setTotalSectionCount(0);
  }, [userId]);

  // Fetch preferences when status is idle OR when we have no preferences but sections exist (cleanup stale)
  useEffect(() => {
    if (preferencesStatus === "idle") {
      dispatch(fetchBuyerPreferences());
    }
  }, [dispatch, preferencesStatus]);

  // Safety: if API later tells us no preferences, clear any previously rendered sections
  useEffect(() => {
    if (
      preferencesStatus === "succeeded" &&
      !hasPreferences &&
      sections.length > 0
    ) {
      setSections([]);
      setLoadingSectionCount(0);
      setTotalSectionCount(0);
    }
  }, [preferencesStatus, hasPreferences, sections.length]);

  // Simple in-memory cache for sections keyed by userId + stable prefs key
  const cacheRef = useRef<
    Record<string, { sections: PreferenceSectionData[]; fetchedAt: number }>
  >({});
  const globalCache = useAppSelector((s) => (s as any).sectionsCache);
  const prefsKey = useMemo(
    () => createPreferencesCacheKey(preferences),
    [preferences]
  );

  // Generate sections with targeted API calls when preferences are available
  useEffect(() => {
    if (!(preferences && hasPreferences && preferencesStatus === "succeeded")) {
      setSections([]);
      return;
    }

    const generateSectionsWithTargetedCalls = async () => {
      if (!(preferences && hasPreferences)) {
        setSections([]);
        setLoadingSectionCount(0);
        setTotalSectionCount(0);
        return;
      }

      try {
        const myGeneration = ++generationRef.current;
        setSectionsLoading(true);
        setSectionsError(null);

        // Check cache: reuse if fresh (TTL 10 minutes)
        const cacheId = `${userId ?? "anon"}::${prefsKey}`;
        const cachedLocal = cacheRef.current[cacheId];
        const cachedGlobal = globalCache?.entries?.[cacheId];
        const now = Date.now();
        const TTL_MS = 10 * 60 * 1000;
        if (cachedLocal && now - cachedLocal.fetchedAt < TTL_MS) {
          setSections(cachedLocal.sections);
          setSectionsLoading(false);
          setLoadingSectionCount(0);
          setTotalSectionCount(cachedLocal.sections.length);
          return;
        }
        if (cachedGlobal && now - cachedGlobal.fetchedAt < TTL_MS) {
          setSections(cachedGlobal.sections);
          setSectionsLoading(false);
          setLoadingSectionCount(0);
          setTotalSectionCount(cachedGlobal.sections.length);
          return;
        }
        const usingStaleCache = Boolean(
          (cachedLocal && now - cachedLocal.fetchedAt >= TTL_MS) ||
            (cachedGlobal && now - cachedGlobal.fetchedAt >= TTL_MS)
        );
        if (usingStaleCache) {
          const stale =
            cachedLocal && now - cachedLocal.fetchedAt >= TTL_MS
              ? cachedLocal
              : cachedGlobal!;
          setSections(stale.sections);
          setTotalSectionCount(stale.sections.length);
        } else {
          setSections([]);
        }

        const localSections: PreferenceSectionData[] = [];

        // Respect user's listing type preferences for Auctions section
        const wantsAuctions = Array.isArray(preferences.listingTypePreferences)
          ? preferences.listingTypePreferences.includes("AUCTION")
          : false;

        // Calculate total sections to load for progress tracking
        let expectedSections = 0;
        if (preferences.buyerSegments?.length) expectedSections++;
        if (wantsAuctions) expectedSections++; // Auctions (only if user selected AUCTION)
        expectedSections++; // Private Offers (always attempted)
        if (
          preferences.preferredCategories?.length ||
          preferences.preferredSubcategories?.length
        )
          expectedSections++;
        if (preferences.preferredRegions?.length) expectedSections++;

        setTotalSectionCount(expectedSections);
        setLoadingSectionCount(expectedSections);

        // Create ViewAll context creator function
        const createViewAllContext: ViewAllContextCreator = (
          sectionType,
          sectionValue,
          sectionTitle,
          userPreferences
        ) => {
          dispatch(
            setViewAllContext({
              sectionType,
              sectionValue,
              sectionTitle,
              userPreferences,
              timestamp: Date.now(),
            })
          );
        };

        // Helper to update sections progressively and reduce loading count
        const addSectionAndUpdateProgress = (
          newSection: PreferenceSectionData,
          position?: number
        ) => {
          if (generationRef.current !== myGeneration) {
            return;
          }
          if (typeof position === "number") {
            localSections[position] = newSection;
          } else {
            localSections.push(newSection);
          }
          if (!usingStaleCache) {
            setSections(localSections.filter(Boolean));
          }
          setLoadingSectionCount((prev) => Math.max(0, prev - 1));
        };

        // Helper to handle section completion (even if no results)
        const completeSectionLoading = () => {
          if (generationRef.current !== myGeneration) {
            return;
          }
          setLoadingSectionCount((prev) => Math.max(0, prev - 1));
        };

        // Build all sections concurrently and update progressively
        // Build tasks in the desired display order with fixed positions
        const taskEntries: Array<{
          pos: number;
          promise: Promise<PreferenceSectionData | null>;
        }> = [];
        let pos = 0;
        if (preferences.buyerSegments && preferences.buyerSegments.length > 0) {
          taskEntries.push({
            pos: pos++,
            promise: buildSegmentSection(preferences, createViewAllContext),
          });
        }
        if (wantsAuctions) {
          taskEntries.push({
            pos: pos++,
            promise: buildAuctionsSection(preferences),
          });
        }
        taskEntries.push({ pos: pos++, promise: buildPrivateOffersSection() });
        if (
          (preferences.preferredCategories &&
            preferences.preferredCategories.length > 0) ||
          (preferences.preferredSubcategories &&
            preferences.preferredSubcategories.length > 0)
        ) {
          taskEntries.push({
            pos: pos++,
            promise: buildCategoriesSection(preferences, createViewAllContext),
          });
        }
        if (
          preferences.preferredRegions &&
          preferences.preferredRegions.length > 0
        ) {
          taskEntries.push({
            pos: pos++,
            promise: buildNearYouSection(preferences, createViewAllContext),
          });
        }

        // Maintain display order by inserting into fixed positions as tasks resolve
        for (const { pos: sectionPos, promise } of taskEntries) {
          promise
            .then((section) => {
              if (generationRef.current !== myGeneration) return;
              if (section) {
                addSectionAndUpdateProgress(section, sectionPos);
              } else {
                completeSectionLoading();
              }
            })
            .catch(() => {
              if (generationRef.current !== myGeneration) return;
              completeSectionLoading();
            });
        }

        await Promise.allSettled(taskEntries.map((t) => t.promise));

        // Final update - ensure loading is complete
        if (generationRef.current !== myGeneration) {
          return;
        }
        // Save to cache
        const entry = { sections: [...localSections], fetchedAt: Date.now() };
        cacheRef.current[cacheId] = entry;
        dispatch(
          setSectionsCacheEntry({
            key: cacheId,
            sections: entry.sections,
            fetchedAt: entry.fetchedAt,
          })
        );
        // If using stale cache, replace sections only if changed (lightweight compare)
        if (usingStaleCache) {
          const simplify = (arr: PreferenceSectionData[]) =>
            arr.map((s) => ({
              t: s.type,
              h: s.title,
              ids: s.listings.map((l) => l.public_id).slice(0, 50),
            }));
          const prevSimple = simplify(sections);
          const nextSimple = simplify(entry.sections);
          if (JSON.stringify(prevSimple) !== JSON.stringify(nextSimple)) {
            setSections([...entry.sections]);
          }
        }
        setLoadingSectionCount(0);
        setSectionsLoading(false);
      } catch (err) {
        setSectionsError(
          err instanceof Error ? err.message : "Failed to generate sections"
        );
        setSections([]);
        setLoadingSectionCount(0);
        setSectionsLoading(false);
      }
    };

    generateSectionsWithTargetedCalls();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    preferences,
    hasPreferences,
    preferencesStatus,
    dispatch,
    userId,
    prefsKey,
    // globalCache?.entries and sections intentionally omitted to prevent infinite loops
    // globalCache is read for cache lookup but changes as result of this effect
    // sections is set by this effect so including it would cause infinite re-runs
  ]);

  const isLoading =
    preferencesStatus === "loading" ||
    listingsStatus === "loading" ||
    sectionsLoading;
  const isError =
    preferencesStatus === "failed" ||
    listingsStatus === "failed" ||
    sectionsError !== null;
  let error: string | null = null;
  if (preferencesStatus === "failed") {
    error = "Failed to fetch preferences";
  } else if (listingsStatus === "failed") {
    error = "Failed to fetch listings";
  } else {
    error = sectionsError;
  }
  const shouldShowPopup = preferencesStatus === "succeeded" && !hasPreferences;

  return {
    sections,
    isLoading,
    isError,
    error,
    hasPreferences,
    shouldShowPopup,
    sectionsLoading,
    loadingSectionCount,
    totalSectionCount,
  };
}
