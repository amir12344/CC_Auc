import { useQueryClient } from "@tanstack/react-query";

import { buyerDealsCountsQueryKey } from "./useBuyerDealsCounts";

/**
 * Hook for invalidating buyer deals counts cache
 * Use this after creating/updating offers or orders to get real-time count updates
 */
export const useBuyerDealsCountsInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateBuyerDealsCounts = async (): Promise<boolean> => {
    try {
      // Invalidate the buyer deals counts query
      await queryClient.invalidateQueries({
        queryKey: buyerDealsCountsQueryKey,
      });

      return true;
    } catch {
      return false;
    }
  };

  return {
    invalidateBuyerDealsCounts,
  };
};
