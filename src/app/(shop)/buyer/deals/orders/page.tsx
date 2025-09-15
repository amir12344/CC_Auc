import type { Metadata } from "next";

import { Orders } from "@/src/features/buyer-deals";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">Orders</h2>
        <p className="text-muted-foreground text-sm lg:text-base">
          Track your orders and purchase history.
        </p>
      </div>

      <Orders />
    </div>
  );
}
