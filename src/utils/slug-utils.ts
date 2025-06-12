import { Product } from '@/src/types';

/**
 * Helper function to get a product identifier for URLs
 * Now returns the product ID directly
 */
export function generateSlug(product: Product): string {
  // Simply return the product ID
  return product.id;
}

/**
 * Helper function to find a product by ID
 */
export function findProductBySlugOrId(products: Product[], productId: string): Product | undefined {
  // Find an exact match by ID
  const byId = products.find(p => p.id.toLowerCase() === productId.toLowerCase());
  return byId;
}
