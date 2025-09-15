import type { GetBuyerPreferenceApiRequest } from "@/src/features/buyer-preferences/types/preferences";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return [...value].sort();
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    return entries.reduce<Record<string, unknown>>((acc, [k, v]) => {
      acc[k] = canonicalize(v);
      return acc;
    }, {});
  }
  return value;
}

export function createPreferencesCacheKey(
  preferences: GetBuyerPreferenceApiRequest | null | undefined
): string {
  if (!preferences) return "noprefs";
  return JSON.stringify(canonicalize(preferences));
}
