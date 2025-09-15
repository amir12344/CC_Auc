"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

// Server-first via API route
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import SegmentClient from "./SegmentClient";

// Lazy-load the heavy filter sidebar to keep initial JS light
const PageSpecificFilterSidebar = dynamic(
  () =>
    import("@/src/features/filters/components/PageSpecificFilterSidebar").then(
      (m) => m.PageSpecificFilterSidebar
    ),
  { ssr: false }
);

interface SegmentClientWrapperProps {
  segmentEnumValues: string[];
  title: string;
}

const SegmentClientWrapper = ({
  segmentEnumValues,
  title,
}: SegmentClientWrapperProps) => {
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch segment-only listings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!segmentEnumValues?.length) {
          setAllListings([]);
          setFilteredListings([]);
          setIsLoading(false);
          return;
        }

        // Use server API with ISR
        const res = await fetch("/api/collections/segment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segments: segmentEnumValues }),
        });
        const response = await res.json();
        setAllListings(response.listings);
        setFilteredListings(response.listings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load segment listings"
        );
        setAllListings([]);
        setFilteredListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [segmentEnumValues]);

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
            pageContext={{ type: "segment", title: "Buyer Segments" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <SegmentClient
          allListingsCount={allListings.length}
          error={error}
          listings={filteredListings}
          loading={isLoading}
          segmentEnumValues={segmentEnumValues}
          title={title}
        />
      </div>
    </div>
  );
};

export default SegmentClientWrapper;
