import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { getSegmentEnumFromDisplayName } from "@/src/features/marketplace-catalog/services/preferenceSectionService";

import SegmentClientWrapper from "./SegmentClientWrapper";

interface MultipleSegmentPageProps {
  searchParams: Promise<{ segments?: string }>;
}

export async function generateMetadata({
  searchParams,
}: MultipleSegmentPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const segments = resolvedSearchParams.segments?.split(",") || [];

  const title =
    segments.length > 0
      ? `${segments.map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())).join(", ")} Segments | Commerce Central`
      : "Multiple Segments | Commerce Central";

  return {
    title,
    description:
      "Browse listings from multiple buyer segments. Quality products from trusted brands at unbeatable prices.",
    openGraph: {
      title,
      description:
        "Browse listings from multiple buyer segments. Quality products from trusted brands at unbeatable prices.",
    },
  };
}

const MultipleSegmentPage = async ({
  searchParams,
}: MultipleSegmentPageProps) => {
  const resolvedSearchParams = await searchParams;
  const segmentsParam = resolvedSearchParams.segments;

  if (!segmentsParam) {
    notFound();
  }

  const segments = segmentsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    notFound();
  }

  // Convert URL-friendly segments back to display names
  const displaySegments = segments.map((segment) =>
    segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );

  const title = `Because you sell on ${displaySegments.join(", ")}`;

  // Convert segments to proper enum values for API using reverse mapping function
  // This ensures exact same enum values as home page
  const segmentEnumValues = displaySegments.map((segment) => {
    return getSegmentEnumFromDisplayName(segment);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* Collections Grid with Sidebar Filters */}
      <div className="py-8">
        <div className="max-w-8xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            }
          >
            <SegmentClientWrapper
              segmentEnumValues={segmentEnumValues}
              title={title}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default MultipleSegmentPage;
