import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// Temporarily commented out until buyer pages are complete
/*
export const metadata: Metadata = {
  title: 'My Deals - Commerce Central',
  description: 'Browse inventory, manage purchases, and track orders as a buyer on Commerce Central.',
  openGraph: {
    title: 'My Deals - Commerce Central',
    description: 'Browse inventory, manage purchases, and track orders as a buyer on Commerce Central.',
  },
};
*/

export default async function BuyerPage() {
  redirect('/buyer/deals');
} 