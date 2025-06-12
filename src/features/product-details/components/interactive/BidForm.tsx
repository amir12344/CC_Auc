'use client';

import { useState } from 'react';
import { useToastNotification } from '@/src/hooks/useToastNotification';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store';
import { placeBid } from '@/src/app/actions/product-actions';
import { Product } from '@/src/types';

interface BidFormProps {
  product: Product;
}

/**
 * Client Component for the bidding form
 */
export function BidForm({ product }: BidFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [bidAmount, setBidAmount] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const toast = useToastNotification();

  // Handle bid submission using server action
  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/marketplace/${product.id}`);
      return;
    }

    // Call server action to place bid
    const result = await placeBid(product.id, bidAmount);

    if (result.success) {
      setBidSuccess(true);
      toast.success('Your bid has been placed successfully!');
      // Reset after 3 seconds
      setTimeout(() => setBidSuccess(false), 3000);
    } else {
      // Handle error
      toast.error(result.error || 'Failed to place bid');
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-gray-700">Current Bids:</span>
        <span className="font-bold">{product.bids}</span>
      </div>
      <div className="flex justify-between mb-4">
        <span className="text-gray-700">Time Left:</span>
        <span className="font-medium">
          {product.timeLeft}
        </span>
      </div>

      {bidSuccess ? (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
          Your bid has been placed successfully!
        </div>
      ) : (
        <form onSubmit={handleBid} className="flex space-x-2">
          <input
            type="text"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="btn btn-primary whitespace-nowrap"
          >
            Place Bid
          </button>
        </form>
      )}
    </div>
  );
} 