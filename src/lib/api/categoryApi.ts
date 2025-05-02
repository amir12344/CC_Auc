/**
 * Category API service
 * Contains functions for fetching categories from the API
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoriesResponse {
  categories: Category[];
}

/**
 * Fetch categories from the API
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
  // Fetch categories from the API
  const response = await fetch('/api/categories');
  
  // Handle errors
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  // Return the categories
  return response.json();
}

