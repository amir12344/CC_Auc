"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";

// Define the Deal interface to match the data structure
interface Deal {
  id: number;
  title: string;
  seller: string;
  category: string;
  units: number;
  price: number;
  status: "Draft" | "In Progress" | "Done";
  date: string;
  productCount?: number;
}

// Sample data for deals
const sampleDeals: Deal[] = [
  {
    id: 1001,
    title: "Willing Beauty",
    seller: "Skincare & Lip Treatments",
    category: "Beauty",
    units: 5000,
    price: 42_174.9,
    status: "Draft",
    date: "Apr 14, 2025",
  },
  {
    id: 1002,
    title: "Stokke",
    seller: "Cushion, Highchairs & More",
    category: "Baby",
    units: 76,
    price: 50.0,
    status: "In Progress",
    date: "Apr 14, 2025",
  },
  {
    id: 1003,
    title: "House Warming",
    seller: "Sofas & More",
    category: "Home",
    units: 1570,
    price: 768_482.91,
    status: "Draft",
    date: "Apr 14, 2025",
  },
  {
    id: 1004,
    title: "Mepal",
    seller: "Food Storage, Dishes & More",
    category: "Kitchen",
    units: 1000,
    price: 1000.0,
    status: "Draft",
    date: "Apr 14, 2025",
  },
  {
    id: 1005,
    title: "Assortment",
    seller: "COSRX, Klairs & More",
    category: "Beauty",
    units: 5477,
    price: 12_870.95,
    status: "Draft",
    date: "Apr 14, 2025",
  },
];

const fetchDeals = (): Promise<Deal[]> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleDeals);
    }, 500);
  });

export default function AllDeals() {
  const {
    data: deals = [],
    isLoading,
    isFetching,
    isPlaceholderData,
  } = useQuery<Deal[]>({
    queryKey: ["buyerAllDeals"],
    queryFn: fetchDeals,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  const [sortBy, setSortBy] = useState("Most Recent");
  const [activeTab, setActiveTab] = useState<"Draft" | "In Progress" | "Done">(
    "Draft"
  );

  const filteredAndSortedDeals = useMemo(() => {
    let result = [...deals];
    result = result.filter((deal) => deal.status === activeTab);

    switch (sortBy) {
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      default:
        break;
    }
    return result;
  }, [deals, sortBy, activeTab]);

  const handleTabChange = useCallback(
    (tab: "Draft" | "In Progress" | "Done") => {
      setActiveTab(tab);
    },
    []
  );

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

  const getBadgeVariant = (status: Deal["status"]) => {
    switch (status) {
      case "Done":
        return "default";
      case "In Progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getButtonClass = (tab: "Draft" | "In Progress" | "Done") => {
    const baseClasses =
      "rounded-full px-4 py-1.5 font-medium text-sm transition-colors";
    if (activeTab === tab) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-200`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            className={getButtonClass("Draft")}
            onClick={() => handleTabChange("Draft")}
            type="button"
          >
            Draft
          </button>
          <button
            className={getButtonClass("In Progress")}
            onClick={() => handleTabChange("In Progress")}
            type="button"
          >
            In Progress
          </button>
          <button
            className={getButtonClass("Done")}
            onClick={() => handleTabChange("Done")}
            type="button"
          >
            Done
          </button>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Sort by</span>
          <select
            aria-label="Sort deals by"
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
      <div className="space-y-px">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                className="animate-pulse rounded-lg bg-white p-4 opacity-50"
                key={`loading-skeleton-${i}`}
              >
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-24 w-24 rounded-md" />
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
            ))
          : filteredAndSortedDeals.map((deal, index) => (
              <div
                className="border-b border-gray-200 py-4 hover:bg-gray-50"
                key={deal.id}
              >
                <div className="flex">
                  <div className="mr-4 h-24 w-24 flex-shrink-0 overflow-hidden">
                    <Image
                      alt={deal.title}
                      className="h-full w-full rounded-sm object-cover"
                      height={96}
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                      sizes="96px"
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                      unoptimized
                      width={96}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{deal.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Deal #{deal.id} • {deal.seller}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {deal.units.toLocaleString()} units • {deal.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ${formatPrice(deal.price)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <Badge className="text-xs" variant="outline">
                          {deal.category}
                        </Badge>
                      </div>
                      <div>
                        <Badge
                          className="bg-transparent text-xs font-normal"
                          variant={getBadgeVariant(deal.status)}
                        >
                          {deal.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {isFetching && !isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            Updating deals...
          </div>
        </div>
      )}
    </div>
  );
}
