export type VisibilityRules = {
  buyer_segments?: string[];
  locations?: {
    states?: string[];
    countries?: string[];
    zip_codes?: string[];
    cities?: string[];
  };
};
