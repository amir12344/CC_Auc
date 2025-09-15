import { useQuery } from "@tanstack/react-query";

import { fetchBuyerDealsCounts } from "../services/buyerQueryService";

interface BuyerDealsCounts {
  offers: number;
  orders: number;
  bids: number;
  allDeals: number;
}

// Simplified query key - user identification handled in service layer
export const buyerDealsCountsQueryKey = ["buyerDealsCounts"] as const;

export const useBuyerDealsCounts = () => {
  // Fetch offers, orders, and bids counts with optimized caching
  // No useEffect needed - query executes immediately and service handles user auth
  const {
    data: dealsCounts = { offers: 0, orders: 0, bids: 0 },
    isLoading,
    error: queryError,
    isPlaceholderData,
  } = useQuery<{
    offers: number;
    orders: number;
    bids: number;
  }>({
    queryKey: buyerDealsCountsQueryKey,
    queryFn: fetchBuyerDealsCounts,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time for better performance
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection time
    refetchInterval: false, // Disable auto-refetch to improve performance
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // Reduce retries for faster failure handling
    retryDelay: 500, // Shorter retry delay
    networkMode: "online", // Only fetch when online
    placeholderData: { offers: 0, orders: 0, bids: 0 }, // Show placeholder data immediately
  });

  // Calculate total deals count (offers + orders + bids)
  const allDealsCount =
    dealsCounts.offers + dealsCounts.orders + dealsCounts.bids;

  const counts: BuyerDealsCounts = {
    offers: dealsCounts.offers,
    orders: dealsCounts.orders,
    bids: dealsCounts.bids,
    allDeals: allDealsCount,
  };

  // Only query error matters now since auth is handled in service
  const hasError = !!queryError;

  return {
    counts,
    isLoading: isLoading && !isPlaceholderData, // Don't show loading if we have placeholder data
    hasError,
    isPlaceholderData, // Expose placeholder state for UI decisions
  };
};
