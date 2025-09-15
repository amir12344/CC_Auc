"use client";

import { useRef } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { AuctionSection } from "@/src/features/auctions/components/AuctionSection";

import { usePreferenceSections } from "../hooks/usePreferenceSections";
import { LotListingSection } from "./lot-listing";
import { AllCatalogListingsInfiniteSection } from "./sections/AllCatalogListingsInfiniteSection";
import PreferenceSection from "./sections/PreferenceSection";

export function ShopClientContent() {
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { sections, hasPreferences, sectionsLoading, loadingSectionCount } =
    usePreferenceSections();

  return (
    <div ref={contentAreaRef}>
      <ErrorBoundary>
        {/* Show default AuctionSection only if user has no preferences */}
        {!hasPreferences && <AuctionSection />}

        {/* LotListingSection - always visible for now */}
        <LotListingSection />

        {/* Dynamic preference-based sections - only for buyers who set preferences */}
        {hasPreferences &&
          sections.map((section, index) => (
            <div
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              key={`${section.type}-${section.title}`}
            >
              <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 lg:px-4">
                <PreferenceSection
                  listings={section.listings}
                  title={section.title}
                  type={section.type}
                  viewAllLink={section.viewAllLink}
                />
              </div>
            </div>
          ))}

        {/* Loading skeleton for remaining preference sections - only when preferences exist */}
        {hasPreferences && sectionsLoading && loadingSectionCount > 0 && (
          <div className="space-y-8">
            {(() => {
              const skeletonSectionKeys = [
                "pref-skel-a",
                "pref-skel-b",
                "pref-skel-c",
              ];
              const visibleSectionKeys = skeletonSectionKeys.slice(
                0,
                Math.min(loadingSectionCount, 3)
              );
              return visibleSectionKeys.map((sectionKey, keyIdx) => {
                const totalIndex = sections.length + keyIdx;
                return (
                  <div
                    className={
                      totalIndex % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }
                    key={sectionKey}
                  >
                    <div className="max-w-8xl mx-auto px-4 py-8 sm:px-6 lg:px-4">
                      <div className="animate-pulse">
                        <div className="mb-6 h-8 w-64 rounded bg-gray-300" />
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                          {[
                            "item-skel-a",
                            "item-skel-b",
                            "item-skel-c",
                            "item-skel-d",
                            "item-skel-e",
                          ].map((itemKey) => (
                            <div className="space-y-3" key={itemKey}>
                              <div className="aspect-square rounded-lg bg-gray-200" />
                              <div className="h-4 rounded bg-gray-200" />
                              <div className="h-4 w-3/4 rounded bg-gray-200" />
                              <div className="h-6 rounded bg-gray-200" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* All Catalog Listings - always visible at bottom with infinite scroll */}
        <AllCatalogListingsInfiniteSection />
      </ErrorBoundary>
    </div>
  );
}
