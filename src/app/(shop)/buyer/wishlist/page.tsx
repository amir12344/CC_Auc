import type { Metadata } from "next";

import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | Commerce Central",
  description: "Manage your saved products and listings",
};

/**
 * Wishlist page for buyers to manage saved items
 * Server component that handles metadata and renders client component
 */
export default function WishlistPage() {
  return <WishlistClient />;
}
