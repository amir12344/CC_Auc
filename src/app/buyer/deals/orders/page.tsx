import { Orders } from "@/src/features/buyer-deals";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Track your orders and purchase history on Commerce Central.'
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Orders</h2>
        <p className="text-sm lg:text-base text-muted-foreground">
          Track your orders and purchase history.
        </p>
      </div>
      
      <Orders />
    </div>
  );
}
