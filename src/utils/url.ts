import { slugify } from "./slugify";

/**
 * Valid collection scopes for URL generation
 */
export type CollectionScope =
  | "category"
  | "subcategory"
  | "segment"
  | "auctions"
  | "catalog";

/**
 * Create collection path for "View All" links
 * @param scope - The type of collection (category, subcategory, segment, auctions)
 * @param value - The value to be slugified for the path (optional for auctions)
 * @returns Clean collection URL path
 */
export function createCollectionPath(
  scope: CollectionScope,
  value?: string
): string {
  if (scope === "auctions") {
    return "/collections/auctions";
  }

  if (!value) {
    throw new Error(`Value is required for scope: ${scope}`);
  }

  return `/collections/${scope}/${slugify(value)}`;
}

/**
 * Parse collection path parameters into filter object
 * @param scope - The collection scope from URL params
 * @param slug - The slugified value from URL params
 * @returns Filter object for API queries
 */
export function parseCollectionPath(
  scope: string,
  slug: string
): {
  scope: CollectionScope;
  filter: Record<string, string[]>;
} {
  const validScope = scope as CollectionScope;

  switch (validScope) {
    case "category":
      return {
        scope: "category",
        filter: { categories: [slug.toUpperCase().replace(/-/g, "_")] },
      };
    case "subcategory":
      return {
        scope: "subcategory",
        filter: { subcategories: [slug.toUpperCase().replace(/-/g, "_")] },
      };
    case "segment":
      return {
        scope: "segment",
        filter: { segments: [slug.toUpperCase().replace(/-/g, "_")] },
      };
    case "auctions":
      return {
        scope: "auctions",
        filter: {},
      };
    default:
      throw new Error(`Invalid collection scope: ${scope}`);
  }
}

/**
 * Parse search params into filter object
 * @param searchParams - URLSearchParams from the route
 * @returns Filter object for API queries
 */
export function parseSearchParams(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const filters: Record<string, string[]> = {};

  // Handle comma-separated values for each filter
  for (const [key, value] of searchParams.entries()) {
    if (value) {
      filters[key] = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  return filters;
}

/**
 * Create URL with updated search params
 * @param baseUrl - Base URL path
 * @param currentParams - Current URLSearchParams
 * @param newFilters - New filter values to merge
 * @returns Updated URL string
 */
export function updateSearchParams(
  baseUrl: string,
  currentParams: URLSearchParams,
  newFilters: Record<string, string[] | string | null>
): string {
  const params = new URLSearchParams(currentParams);

  // Update or remove parameters
  for (const [key, value] of Object.entries(newFilters)) {
    if (value === null || value === undefined) {
      params.delete(key);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        params.delete(key);
      } else {
        params.set(key, value.join(","));
      }
    } else {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
