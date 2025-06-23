/**
 * Auction Utilities
 * Shared functions for auction-related components
 * Follows DRY principle and provides consistent formatting across the app
 */

/**
 * Format currency for auction displays
 * Consistent formatting across all auction components
 * 
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatAuctionCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format bid count text for display
 * Handles singular/plural forms correctly
 * 
 * @param count - Number of bids
 * @returns Formatted bid text
 */
export const formatBidCount = (count: number): string => {
  if (count === 0) return 'No bids';
  return count === 1 ? '1 Bid' : `${count} Bids`;
};

/**
 * Format time left for auction display
 * Adds "Closes in" prefix for better UX
 * 
 * @param timeLeft - Time remaining string
 * @returns Formatted time left text
 */
export const formatTimeLeft = (timeLeft: string | undefined): string | null => {
  if (!timeLeft) return null;
  return `Closes in ${timeLeft}`;
};

/**
 * Get auction status badge variant based on time left
 * Determines urgency level for styling
 * 
 * @param timeLeft - Time remaining string
 * @returns Badge variant for styling
 */
export const getAuctionUrgency = (timeLeft: string | undefined): 'default' | 'secondary' | 'destructive' => {
  if (!timeLeft) return 'secondary';
  if (timeLeft.includes('hour') && !timeLeft.includes('day')) return 'destructive';
  if (timeLeft.includes('1 day')) return 'default';
  return 'secondary';
};

/**
 * Generate optimized image sizes for auction cards
 * Responsive image sizing for better performance
 * 
 * @returns Optimized sizes string for Next.js Image component
 */
export const getAuctionImageSizes = (): string => {
  return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
};

/**
 * Generate blur data URL for image placeholder
 * Consistent placeholder across all auction images
 * 
 * @returns Base64 encoded blur placeholder
 */
export const getAuctionImagePlaceholder = (): string => {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
};

/**
 * Calculate minimum bid amount based on current bid
 * Implements standard auction bidding increments
 * 
 * @param currentBid - Current highest bid
 * @returns Minimum next bid amount
 */
export const calculateMinimumBid = (currentBid: number): number => {
  if (currentBid < 100) return currentBid + 5;
  if (currentBid < 500) return currentBid + 10;
  if (currentBid < 1000) return currentBid + 25;
  if (currentBid < 5000) return currentBid + 50;
  return currentBid + 100;
};

/**
 * Format shipping cost display
 * Handles free shipping and calculated shipping
 * 
 * @param cost - Shipping cost
 * @param destination - Shipping destination
 * @returns Formatted shipping text
 */
export const formatShippingCost = (cost: number, destination?: string): string => {
  if (cost === 0) return 'Free shipping';
  const formattedCost = formatAuctionCurrency(cost);
  return destination ? `${formattedCost} to ${destination}` : formattedCost;
};

/**
 * Parse auction end time and return countdown
 * Calculates time remaining until auction ends
 * 
 * @param endTime - ISO date string of auction end
 * @returns Human readable time remaining
 */
export const getTimeRemaining = (endTime: string): string => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) return 'Auction ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}; 