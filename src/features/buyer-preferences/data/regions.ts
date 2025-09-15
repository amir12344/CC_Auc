import { REGION_OPTIONS } from "./preferenceOptions";

/**
 * Map enum values to Region group keys used by REGION_OPTIONS for state code conversion.
 */
export const REGION_ENUM_TO_KEY: Record<string, string> = {
  NORTHEAST_US: "Northeast",
  MIDWEST_US: "Midwest",
  SOUTH_US: "South",
  WEST_US: "West",
};

export function mapRegionEnumsToKeys(enumValues: string[] = []): string[] {
  return enumValues
    .map((val) => REGION_ENUM_TO_KEY[val])
    .filter(Boolean) as string[];
}

export function getStateCodesForRegionEnums(
  enumValues: string[] = []
): string[] {
  const keys = mapRegionEnumsToKeys(enumValues);
  const stateCodes: string[] = [];
  for (const key of keys) {
    const states = REGION_OPTIONS[key as keyof typeof REGION_OPTIONS];
    if (states) {
      stateCodes.push(...states.map((s) => s.code));
    }
  }
  return stateCodes;
}

// Display options for region selection across UI components
export const REGIONS_OPTIONS: Array<{ displayName: string; value: string }> = [
  { displayName: "Northeast", value: "NORTHEAST_US" },
  { displayName: "Midwest", value: "MIDWEST_US" },
  { displayName: "South", value: "SOUTH_US" },
  { displayName: "West", value: "WEST_US" },
];
