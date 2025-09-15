"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";

interface Order {
  id: number;
  title: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing";
  amount: number;
  tracking: string;
}

const sampleOrders: Order[] = [
  {
    id: 2001,
    title: "Kitchen Essentials",
    date: "May 15, 2025",
    status: "Delivered",
    amount: 250.0,
    tracking: "TRK10001",
  },
  {
    id: 2002,
    title: "Home Decor Set",
    date: "May 10, 2025",
    status: "Shipped",
    amount: 500.0,
    tracking: "TRK10002",
  },
  {
    id: 2003,
    title: "Beauty Collection",
    date: "May 5, 2025",
    status: "Delivered",
    amount: 750.0,
    tracking: "TRK10003",
  },
  {
    id: 2004,
    title: "Baby Products",
    date: "May 1, 2025",
    status: "Processing",
    amount: 1000.0,
    tracking: "TRK10004",
  },
];

const fetchOrders = () =>
  new Promise<Order[]>((resolve) =>
    setTimeout(() => resolve(sampleOrders), 10)
  );

export default function AllOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["sellerOrders"],
    queryFn: fetchOrders,
  });
  const [sortBy, setSortBy] = useState("Most Recent");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter) {
      result = result.filter((order) => order.status === statusFilter);
    }

    switch (sortBy) {
      case "Price: High to Low":
        return result.sort((a, b) => b.amount - a.amount);
      case "Price: Low to High":
        return result.sort((a, b) => a.amount - b.amount);
      default:
        return result;
    }
  }, [orders, sortBy, statusFilter]);

  const handleStatusFilterChange = useCallback((status: string | null) => {
    setStatusFilter(status);
  }, []);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value);
    },
    []
  );

  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  let content: React.ReactNode;
  if (isLoading) {
    content = Array.from({ length: 3 }).map((_, i) => (
      <div className="animate-pulse rounded-lg bg-white p-4" key={i}>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-md" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    ));
  } else if (filteredAndSortedOrders.length === 0) {
    content = (
      <div className="rounded-lg bg-white p-8 text-center">
        <p className="text-gray-500">No orders found matching your filters.</p>
      </div>
    );
  } else {
    content = filteredAndSortedOrders.map((order, index) => (
      <div
        className="border-b border-gray-200 py-4 hover:bg-gray-50"
        key={order.id}
      >
        <div className="flex">
          <div className="mr-4 h-24 w-24 flex-shrink-0 overflow-hidden">
            <Image
              alt={order.title}
              className="h-full w-full rounded-sm object-cover"
              height={96}
              loading={index === 0 ? "eager" : "lazy"}
              priority={index === 0}
              sizes="96px"
              src={
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
              }
              unoptimized
              width={96}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{order.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Order #{order.id} • Placed on {order.date}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Tracking: {order.tracking}
                </p>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold">
                  ${formatPrice(order.amount)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-500" />
              <div>
                <Badge
                  className="bg-transparent text-xs font-normal"
                  variant="outline"
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === null ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
            onClick={() => handleStatusFilterChange(null)}
            type="button"
          >
            All
          </button>
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === "Delivered" ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
            onClick={() => handleStatusFilterChange("Delivered")}
            type="button"
          >
            Delivered
          </button>
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${statusFilter === "Shipped" ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
            onClick={() => handleStatusFilterChange("Shipped")}
            type="button"
          >
            Shipped
          </button>
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Sort by</span>
          <select
            aria-label="Sort orders by"
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium focus:ring-1 focus:ring-gray-200 focus:outline-none"
            onChange={handleSortChange}
            value={sortBy}
          >
            <option value="Most Recent">Most Recent</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Price: Low to High">Price: Low to High</option>
          </select>
        </div>
      </div>

      <div className="space-y-px">{content}</div>
    </div>
  );
}
