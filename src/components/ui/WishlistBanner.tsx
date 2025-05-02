import React from 'react';

export default function WishlistBanner() {
  return (
    <div className="bg-black py-2 w-full z-40">
      <div className="max-w-full text-center">
        <span className="text-xs sm:text-sm text-white">
          <a href="/wishlist" className="text-purple-400 hover:underline font-medium">Introducing Wishlist</a> <span role="img" aria-label="sparkles">✨</span>: Add brands, categories, and budget to your wishlist, and get notified as we source them for you.
        </span>
      </div>
    </div>
  );
}
