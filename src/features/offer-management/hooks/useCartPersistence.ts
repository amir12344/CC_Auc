import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToOffer, OfferCartItem } from '../store/offerCartSlice';

// Custom hook to load cart state from localStorage on client-side only
export const useLoadCartState = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') return;
      
      const serializedState = localStorage.getItem('offerCartState');
      if (serializedState) {
        const state = JSON.parse(serializedState);
        
        // Check if it has the items array
        if (state && Array.isArray(state.items)) {
          // Add each item to the cart
          state.items.forEach((item: OfferCartItem) => {
            dispatch(addToOffer(item));
          });
        }
      }
    } catch (error) {
      console.error('Failed to load cart state from localStorage:', error);
    }
  }, [dispatch]);
};
