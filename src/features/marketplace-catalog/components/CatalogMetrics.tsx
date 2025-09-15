import { BadgeCheck, Box, MapPin, Scroll, Tag, Truck } from "lucide-react";

import { fileToDbPackagingBiMap } from "@/amplify/functions/commons/converters/ListingTypeConverter";

/**
 * CatalogMetrics Component
 *
 * Displays catalog-specific metrics in a 2x3 grid layout.
 * First Row: Total Units, MOV (Minimum Order Value), Location
 * Second Row: Average Price/Unit, Packaging, Ship Window
 */

interface CatalogMetricsProps {
  totalUnits: string;
  minOrderValue: string;
  location: string;
  avgPricePerUnit: string;
  packaging: string;
  shipWindow: string;
}

export const CatalogMetrics = ({
  totalUnits,
  minOrderValue,
  location,
  avgPricePerUnit,
  packaging,
  shipWindow,
}: CatalogMetricsProps) => {
  const metrics = [
    // First Row
    {
      title: "Units in Listing",
      value: totalUnits,
      icon: <Scroll className="h-4 w-4 text-gray-500" />,
    },
    {
      title: "Min. Order Value",
      value: minOrderValue,
      icon: <BadgeCheck className="h-4 w-4 text-gray-500" />,
    },
    {
      title: "Location",
      value: location,
      icon: <MapPin className="h-4 w-4 text-gray-500" />,
    },
    // Second Row
    {
      title: "Average Price/Unit",
      value: avgPricePerUnit,
      icon: <Tag className="h-4 w-4 text-gray-500" />,
    },
    {
      title: "Packaging",
      value: fileToDbPackagingBiMap.getKey(packaging as never) || "N/A",
      icon: <Box className="h-4 w-4 text-gray-500" />,
    },
    {
      title: "Ship Window",
      value: shipWindow,
      icon: <Truck className="h-4 w-4 text-gray-500" />,
    },
  ];

  return (
    <div className="border-t border-b border-gray-200 py-6">
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div className="flex items-start gap-2" key={metric.title}>
            <div className="mt-0.5">{metric.icon}</div>
            <div>
              <div className="mb-0.5 text-sm font-[500] text-gray-600">
                {metric.title}
              </div>
              <div className="text-md font-semibold text-gray-900">
                {metric.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
