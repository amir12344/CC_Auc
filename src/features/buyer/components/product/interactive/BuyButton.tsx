   'use client';

import { useState } from 'react';
import { useToastNotification } from '@/src/hooks/useToastNotification';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store';
import { purchaseProduct } from '@/src/app/actions/product-actions';
import { Product } from '@/src/types';

interface BuyButtonProps {
  product: Product;
}

/**
 * Client Component for the buy button
 */
export function BuyButton({ product }: BuyButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [buySuccess, setBuySuccess] = useState(false);
  const toast = useToastNotification();

  // Handle buy now using server action
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/marketplace/${product.id}`);
      return;
    }

    // Call server action to purchase product
    const result = await purchaseProduct(product.id);

    if (result.success) {
      setBuySuccess(true);
      toast.success('Your purchase has been completed successfully!');
      // Reset after 3 seconds
      setTimeout(() => setBuySuccess(false), 3000);
    } else {
      // Handle error
      toast.error(result.error || 'Failed to complete purchase');
    }
  };

  return (
    <>
      {buySuccess ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
          Your purchase has been completed successfully! Check your dashboard for details.
        </div>
      ) : (
        <button
          onClick={handleBuyNow}
          className="w-full btn btn-primary mb-4"
        >
          Buy Now
        </button>
      )}
    </>
  );
}

