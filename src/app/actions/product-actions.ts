"use server";

import { revalidatePath } from "next/cache";

/**
 * Server action to place a bid on a product
 */
export async function placeBid(productId: string, amount: string) {
  try {
    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return { success: false, error: "Please enter a valid bid amount" };
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Revalidate the product page to reflect the new bid
    revalidatePath(`/marketplace`);
    revalidatePath(`/marketplace/${productId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while placing your bid",
    };
  }
}

/**
 * Server action to purchase a product
 */
export async function purchaseProduct(productId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    revalidatePath(`/marketplace`);
    revalidatePath(`/marketplace/${productId}`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while processing your purchase",
    };
  }
}

export async function saveToWishlist(productId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while saving to your wishlist",
    };
  }
}
