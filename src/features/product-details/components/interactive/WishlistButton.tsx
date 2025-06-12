'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store';
import { saveToWishlist } from '@/src/app/actions/product-actions';
import { useToastNotification } from '@/src/hooks/useToastNotification';

interface WishlistButtonProps {
  productId: string;
}

/**
 * Client Component for the wishlist button
 */
export function WishlistButton({ productId }: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const toast = useToastNotification();

  // Handle save to wishlist using server action
  const handleSaveToWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/marketplace/${productId}`);
      return;
    }

    // Call server action to save to wishlist
    const result = await saveToWishlist(productId);

    if (result.success) {
      toast.success('Product saved to your wishlist!');
    } else {
      // Handle error
      toast.error(result.error || 'Failed to save to wishlist');
    }
  };

  return (
    <button
      onClick={handleSaveToWishlist}
      className="w-full btn btn-outline"
    >
      Add to Saved Items
    </button>
  );
} 