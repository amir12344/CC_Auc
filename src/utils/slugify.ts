/**
 * Convert string to URL-safe slug
 * @param input - String to convert to slug
 * @returns URL-safe slug string
 */
export const slugify = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

/**
 * Convert slug back to display name
 * @param slug - URL slug to convert
 * @returns Display-friendly string
 */
export const unslugify = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => {
      // Handle special cases
      if (word === "and") {
        return "&";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};
