"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

// Server-first via API route
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import CategoryClient from "./CategoryClient";

// Lazy-load the heavy filter sidebar to keep initial JS light
const PageSpecificFilterSidebar = dynamic(
  () =>
    import("@/src/features/filters/components/PageSpecificFilterSidebar").then(
      (m) => m.PageSpecificFilterSidebar
    ),
  { ssr: false }
);

interface CategoryClientWrapperProps {
  categories: string[];
  title: string;
}

const CategoryClientWrapper = ({
  categories,
  title,
}: CategoryClientWrapperProps) => {
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch category-only listings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!categories?.length) {
          setAllListings([]);
          setFilteredListings([]);
          setIsLoading(false);
          return;
        }

        // Use server API with ISR
        const res = await fetch("/api/collections/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories }),
        });
        const response = await res.json();

        setAllListings(response.listings);
        setFilteredListings(response.listings);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load category listings"
        );
        setAllListings([]);
        setFilteredListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categories]);

  // Memoized callback to prevent infinite loops
  const handleFilteredListingsChange = useCallback(
    (filtered: CombinedListing[]) => {
      setFilteredListings(filtered);
    },
    []
  );

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-6">
          <PageSpecificFilterSidebar
            listings={allListings}
            onFilteredListingsChangeAction={handleFilteredListingsChange}
            pageContext={{ type: "category", title: "Categories For You" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <CategoryClient
          allListingsCount={allListings.length}
          categories={categories}
          error={error}
          listings={filteredListings}
          loading={isLoading}
          title={title}
        />
      </div>
    </div>
  );
};

export default CategoryClientWrapper;
