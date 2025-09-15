import { Product } from "@/src/types";

/**
 * Generates a URL-friendly slug for a product
 * @param product The product to generate a slug for
 * @returns A URL path to the product detail page
 */
export function generateSlug(product: Pick<Product, "id" | "title">): string {
  const titleSlug = product.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim();

  return `/marketplace/product/${product.id}`;
}

/**
 * Extracts a product ID from a slug
 * @param slug The URL slug or ID
 * @returns The product ID
 */
export function extractIdFromSlug(slug: string): string {
  // If the slug contains hyphens, extract the ID portion
  if (slug.includes("-")) {
    return slug.split("-")[0];
  }

  // Otherwise, assume the entire string is the ID
  return slug;
}
