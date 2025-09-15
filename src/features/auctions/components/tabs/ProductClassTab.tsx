"use client";

import { useMemo } from "react";

import type { ManifestItem } from "../../types";
import { aggregateByProductClass } from "../../utils/manifestAggregation";
import { AggregatedDataTable } from "../shared/AggregatedDataTable";

interface ProductClassTabProps {
  /** Auction manifest data from API */
  manifestData: ManifestItem[];
}

/**
 * Product Class tab component - Groups manifest data by product class
 * Shows aggregated quantities and extended retail values by product class
 */
export const ProductClassTab = ({ manifestData }: ProductClassTabProps) => {
  // Aggregate data by product class
  const aggregatedData = useMemo(() => {
    return aggregateByProductClass(manifestData);
  }, [manifestData]);

  return (
    <div className="flex flex-col px-4 lg:px-6">
      <AggregatedDataTable
        data={aggregatedData}
        groupColumnHeader="Product Class"
        searchPlaceholder="Search product classes..."
      />
    </div>
  );
};
