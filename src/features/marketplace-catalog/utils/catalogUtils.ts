/**
 * Client-safe catalog utility functions
 * These functions can be safely imported by client components
 */

/**
 * Format catalog price for display
 */
export const formatCatalogPrice = (price: number): string => {
  if (!price || price <= 0) {
    return "Price not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format category name for display
 */
export const formatCategoryDisplayName = (category: string): string => {
  if (!category) {
    return "General";
  }

  return category
    .split("_")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

/**
 * Format lead time for display
 */
export const formatLeadTime = (days: number): string => {
  if (!days || days <= 0) {
    return "Available now";
  }

  if (days === 1) {
    return "1 business day";
  }
  if (days <= 5) {
    return `${days} business days`;
  }
  if (days <= 10) {
    return `${days} business days`;
  }

  const weeks = Math.ceil(days / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
};

/**
 * Get catalog image placeholder for loading states
 */
export const getCatalogImagePlaceholder = (): string => {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";
};

/**
 * Get optimized image sizes for catalog cards
 */
export const getCatalogImageSizes = (): string => {
  return "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw";
};
