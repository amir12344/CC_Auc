"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { injectReducer } from "@/src/lib/store";

import offerCartReducer, {
  initializeFromStorage,
} from "../store/offerCartSlice";

/**
 * Component that initializes the offer cart from localStorage on app startup
 * This ensures that user selections persist across page refreshes
 */
export const OfferCartInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dynamically inject the cart reducer before any cart actions
    injectReducer("offerCart", offerCartReducer);
    // Initialize cart from localStorage when component mounts
    dispatch(initializeFromStorage());
  }, [dispatch]);

  // This component renders nothing, it just handles initialization
  return null;
};
