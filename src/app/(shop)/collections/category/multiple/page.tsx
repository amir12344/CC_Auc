import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { getCategoryDisplayName } from "@/src/features/marketplace-catalog/services/preferenceSectionService";

import CategoryClientWrapper from "./CategoryClientWrapper";

interface MultipleCategoryPageProps {
  searchParams: Promise<{
    categories?: string;
    actualCategories?: string;
  }>;
}

const MultipleCategoryPage = async ({
  searchParams,
}: MultipleCategoryPageProps) => {
  const resolvedSearchParams = await searchParams;
  const categoriesParam = resolvedSearchParams.categories;
  const actualCategoriesParam = resolvedSearchParams.actualCategories;

  // Must have either old-style categories or new actualCategories
  if (!categoriesParam && !actualCategoriesParam) {
    notFound();
  }

  // Check if we have actual enum values (new approach) or old slugified values
  let categories: string[];
  let displayCategories: string[];

  if (actualCategoriesParam) {
    // NEW APPROACH: Use real enum values from marketplace
    categories = actualCategoriesParam
      .split(",")
      .map((c: string) => c.trim())
      .filter(Boolean);
    displayCategories = categories.map(getCategoryDisplayName);
  } else if (categoriesParam) {
    // OLD APPROACH: Parse URL slugs (fallback for direct URL access)
    const slugCategories = categoriesParam
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    displayCategories = slugCategories.map((category) =>
      category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
    categories = displayCategories.map((category) =>
      category.toUpperCase().replace(/\s/g, "_")
    );
  } else {
    // This should not happen due to the check above, but handle it
    categories = [];
    displayCategories = [];
  }

  if (categories.length === 0) {
    notFound();
  }

  const title = "Categories For You";

  const breadcrumbItems = [
    { label: "Home", href: "/marketplace" },
    { label: "Categories For You", href: "" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <DynamicBreadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Collections Grid with Integrated Filter Sidebar */}
      <div className="py-8">
        <div className="max-w-8xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            }
          >
            <CategoryClientWrapper categories={categories} title={title} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default MultipleCategoryPage;
