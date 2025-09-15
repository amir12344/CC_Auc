import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { addToOffer } from "../store/offerCartSlice";
import type { OfferCartItem } from "../types";

// Custom hook to load cart state from localStorage on client-side only
export const useLoadCartState = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      // Only run in browser environment
      if (typeof window === "undefined") {
        return;
      }

      const serializedState = localStorage.getItem("offerCartState");
      if (serializedState) {
        const state = JSON.parse(serializedState);

        // Check if it has the items array
        if (state && Array.isArray(state.items)) {
          // Add each item to the cart
          for (const item of state.items) {
            dispatch(addToOffer(item as OfferCartItem));
          }
        }
      }
    } catch {
      // Silent error handling as per linter rules
    }
  }, [dispatch]);
};
