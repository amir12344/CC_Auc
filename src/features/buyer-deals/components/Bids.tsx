"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Hammer } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
// Minimal neutral emojis used for contact actions
import { createDraftWithInlineImage } from "@/src/utils/gmailDraft";

import { fetchBuyerBids } from "../services/buyerQueryService";
import type { BuyerBid } from "../types";

const ViewBidSheet = dynamic(
  () => import("./ViewBidSheet").then((mod) => mod.default),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    ),
    ssr: false,
  }
);

// Dynamic status filter type
type BidStatusFilter = string | null;

// Helper function to format status for display (only first letter capitalized)
const formatBidStatus = (status: string): string => {
  return status
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    ); // Only capitalize first letter
};

export default function Bids() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const {
    data: bids = [],
    isLoading,
    isFetching,
  } = useQuery<BuyerBid[]>({
    queryKey: ["buyerBids"],
    queryFn: fetchBuyerBids,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  const [sortBy, setSortBy] = useState("Most Recent");
  const [statusFilter, setStatusFilter] = useState<BidStatusFilter>(null);
  const [selectedBid, setSelectedBid] = useState<BuyerBid | null>(null);
  const [isViewBidSheetOpen, setIsViewBidSheetOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Generate dynamic status filters from actual bid data
  const bidStatusFilters = useMemo(() => {
    const filters: Array<{ key: string | null; label: string }> = [
      { key: null, label: "All" },
    ];

    // Get unique statuses from bids
    const uniqueStatuses = [
      ...new Set(bids.map((bid) => bid.auctionStatus)),
    ].filter(Boolean);

    // Add unique statuses to filters
    filters.push(
      ...uniqueStatuses.map((status) => ({
        key: status,
        label: formatBidStatus(status),
      }))
    );

    return filters;
  }, [bids]);

  // Handle URL parameter initialization
  useEffect(() => {
    if (!hasInitialized && bids.length > 0) {
      if (activeTab) {
        const validStatus = bids.find((bid) => bid.auctionStatus === activeTab);
        if (validStatus) {
          setStatusFilter(activeTab);
        }
      } else {
        // Default to first available status if no tab specified
        const firstStatus = bidStatusFilters.find((f) => f.key !== null)?.key;
        if (firstStatus) {
          setStatusFilter(firstStatus);
        }
      }
      setHasInitialized(true);
    }
  }, [bids, activeTab, bidStatusFilters, hasInitialized]);

  // Sort change via shadcn Select
  const handleSortChangeValue = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: BidStatusFilter) => {
    setStatusFilter(status);
  }, []);

  // Handle view bid
  const handleViewBid = useCallback((bid: BuyerBid) => {
    setSelectedBid(bid);
    setIsViewBidSheetOpen(true);
  }, []);

  // Handle close view bid sheet
  const handleCloseViewBidSheet = useCallback(() => {
    setIsViewBidSheetOpen(false);
    setSelectedBid(null);
  }, []);

  // Format price
  const formatPrice = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Filter and sort bids
  const filteredAndSortedBids = useMemo(() => {
    // Group by listingId or title as fallback, pick the latest bid per group
    const byKey = new Map<string, BuyerBid>();

    for (const bid of bids) {
      const key = bid.listingId || bid.title || bid.id;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, bid);
      } else {
        // Keep the most recent by timestamp
        if (
          new Date(bid.bidTimestamp).getTime() >
          new Date(existing.bidTimestamp).getTime()
        ) {
          byKey.set(key, bid);
        }
      }
    }

    let filtered = Array.from(byKey.values());

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((bid) => bid.auctionStatus === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "Price: High to Low":
        sorted.sort((a, b) => b.bidAmount - a.bidAmount);
        break;
      case "Price: Low to High":
        sorted.sort((a, b) => a.bidAmount - b.bidAmount);
        break;
      case "Most Recent":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.bidTimestamp).getTime() -
            new Date(a.bidTimestamp).getTime()
        );
        break;
    }

    return sorted;
  }, [bids, statusFilter, sortBy]);

  // Get button class based on status
  const getButtonClass = useCallback(
    (status: BidStatusFilter) => {
      const baseClass =
        "rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition-all duration-200";
      return statusFilter === status
        ? `${baseClass} bg-black text-white shadow-sm hover:bg-gray-800`
        : `${baseClass} bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300`;
    },
    [statusFilter]
  );

  // Content
  const content = useMemo(() => {
    // Use the same dashed message box pattern as orders when filters yield no results
    if (filteredAndSortedBids.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-16">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              No bids found
            </h3>
            <p className="mt-3 max-w-md text-base text-gray-600">
              No bids match your current filters.
            </p>
          </div>
        </div>
      );
    }

    // Match list-row design of orders (no boxed cards) while keeping status chip
    return filteredAndSortedBids.map((bid, index) => (
      <div
        className="border-b border-gray-200 py-4 hover:bg-gray-50"
        key={bid.id}
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="mx-auto h-20 w-20 flex-shrink-0 overflow-hidden sm:mx-0 sm:h-24 sm:w-24">
            {bid.imageUrl ? (
              <Image
                alt={bid.title}
                className="h-full w-full rounded-sm object-cover"
                height={96}
                loading={index === 0 ? "eager" : "lazy"}
                priority={index === 0}
                quality={75}
                sizes="(max-width: 640px) 80px, 96px"
                src={bid.imageUrl}
                unoptimized={true}
                width={96}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-sm bg-gradient-to-br from-gray-300 to-gray-500">
                <span className="text-xs font-medium text-white">
                  {bid.title
                    ? bid.title.substring(0, 12).toUpperCase()
                    : "NO IMAGE"}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                  {bid.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  {/* Status chip moved just under the title to reduce vertical gap */}
                  <span
                    className={`inline-flex cursor-pointer items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      bid.actionType === "AUCTION_WON"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : bid.isWinningBid
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                  >
                    <Hammer className="mr-1 h-3 w-3" />
                    {bid.actionType === "AUCTION_WON"
                      ? "Auction Won"
                      : bid.isWinningBid
                        ? "Winning Bid"
                        : formatBidStatus(bid.auctionStatus)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {bid.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-left sm:text-right">
                {bid.bidAmount > 0 && (
                  <>
                    <div className="text-lg font-bold">
                      {formatPrice(bid.bidAmount)}
                    </div>
                    <div className="text-xs text-gray-500">{bid.currency}</div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-center sm:justify-end">
              <Button
                className="w-full cursor-pointer rounded-full sm:w-auto"
                onClick={() => handleViewBid(bid)}
                size="sm"
                variant="outline"
              >
                View Bid
              </Button>
            </div>

            {/* Contact row — icon-only, no borders */}
            <div className="mt-3">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
                <span className="text-xs font-medium text-gray-800 sm:text-sm">
                  Talk to Account Manager
                </span>
                <div className="flex items-center gap-3">
                  <button
                    aria-label={`Email account manager about ${bid.title}`}
                    className="inline-flex items-center p-0 text-gray-700 transition-transform hover:scale-105 hover:opacity-85"
                    onClick={async () => {
                      const html = `
                        <div style=\"font-family:Inter,Segoe UI,Arial,sans-serif; color:#111827;\">
                          <h2 style=\"margin:0 0 8px 0; font-size:18px;\">Bid Inquiry</h2>
                          <table style=\"border-collapse:separate; border-spacing:0; width:100%; max-width:560px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;\">
                            <tbody>
                              <tr>
                                <td style=\"padding:16px; width:136px; vertical-align:top;\">
                                  ${bid.imageUrl ? `<img src=\\\"cid:INLINE_IMAGE_1\\\" alt=\\\"${bid.title}\\\" style=\\\"display:block; width:120px; height:120px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb;\\\"/>` : ""}
                                </td>
                                <td style=\"padding:16px; vertical-align:top;\">
                                  <div style=\"font-size:16px; font-weight:600; margin-bottom:6px;\">${bid.title}</div>
                                  ${bid.bidAmount > 0 ? `<div style=\\\"font-size:14px; color:#111827; margin-bottom:4px;\\\"><strong>Bid:</strong> ${bid.bidAmount} ${bid.currency ?? ""}</div>` : ""}
                                  ${bid.listingId ? `<div style=\\\"font-size:12px; color:#6b7280;\\\"><strong>Listing ID:</strong> ${bid.listingId}</div>` : ""}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <p style=\"font-size:14px; color:#111827; margin:12px 0 0 0;\">Please let me know the next steps.</p>
                          <p style=\"font-size:14px; color:#111827; margin:4px 0 0 0;\">Thanks!</p>
                        </div>`;
                      const result = await createDraftWithInlineImage({
                        to: "team@commercecentral.ai",
                        subject: `Bid Inquiry: ${bid.title}`,
                        html,
                        imageUrl: bid.imageUrl,
                      }).catch(() => ({ ok: false }));
                      if (!result?.ok) {
                        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=team@commercecentral.ai&su=${encodeURIComponent(`Bid Inquiry: ${bid.title}`)}&body=${encodeURIComponent(
                          [
                            "Hello CommerceCentral Team,",
                            "",
                            "I would like to talk to an account manager about this bid:",
                            "",
                            `• Product: ${bid.title}`,
                            bid.listingId
                              ? `• Listing ID: ${bid.listingId}`
                              : undefined,
                            bid.bidAmount > 0
                              ? `• Bid Amount: ${bid.bidAmount} ${bid.currency ?? ""}`
                              : undefined,
                          ]
                            .filter(Boolean)
                            .join("\n")
                        )}`;
                        window.open(url, "_blank", "noopener,noreferrer");
                      } else {
                        window.open(
                          "https://mail.google.com/mail/u/0/#drafts",
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }
                    }}
                    title="Email (Gmail)"
                    type="button"
                  >
                    <Image
                      alt="Gmail"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      height={24}
                      src="/images/Logo_Gmail.svg"
                      width={24}
                    />
                  </button>
                  <a
                    aria-label={`WhatsApp account manager about ${bid.title}`}
                    className="inline-flex items-center p-0 text-gray-700 transition-transform hover:scale-110 hover:opacity-85"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      [
                        "Hi CommerceCentral Team, I would like to talk to an account manager about this bid:",
                        `• Product: ${bid.title}`,
                        bid.listingId
                          ? `• Listing ID: ${bid.listingId}`
                          : undefined,
                        bid.bidAmount > 0
                          ? `• Bid Amount: ${bid.bidAmount} ${bid.currency ?? ""}`
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join("\n")
                    )}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="WhatsApp"
                  >
                    <Image
                      alt="WhatsApp"
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      height={28}
                      src="/images/WhatsApp.svg"
                      width={28}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }, [filteredAndSortedBids, formatPrice, handleViewBid]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="max-w-8xl mx-auto w-full px-6 py-6 sm:py-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:gap-6 lg:flex-row lg:items-center">
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                className="h-8 w-20 rounded-lg sm:h-10 sm:w-24"
                key={i}
              />
            ))}
          </div>
          <div className="flex w-full items-center sm:w-auto lg:w-auto">
            <Skeleton className="h-8 w-40 rounded-full sm:h-10" />
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6"
              key={i}
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                <Skeleton className="mx-auto h-20 w-20 rounded-lg sm:mx-0 sm:h-24 sm:w-24" />
                <div className="w-full flex-1 space-y-3">
                  <Skeleton className="mx-auto h-5 w-3/4 sm:mx-0" />
                  <Skeleton className="mx-auto h-4 w-1/2 sm:mx-0" />
                  <div className="flex justify-center gap-2 sm:justify-start sm:gap-3">
                    <Skeleton className="h-6 w-16 rounded-full sm:w-20" />
                    <Skeleton className="h-6 w-20 rounded-full sm:w-24" />
                  </div>
                  <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <Skeleton className="order-2 h-6 w-16 sm:order-1 sm:w-20" />
                    <Skeleton className="order-1 h-9 w-full rounded-lg sm:order-2 sm:w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!bids.length) {
    return (
      <div className="max-w-8xl mx-auto w-full px-6 py-6 sm:py-8">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
          <div className="px-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
              No bids found
            </h3>
            <p className="mt-3 max-w-md text-sm text-gray-600 sm:text-base">
              You haven&apos;t placed any bids yet. Start exploring auctions to
              place your first bid!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="max-w-8xl mx-auto w-full px-6 py-6 sm:py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
          {bidStatusFilters.map((filter) => (
            <button
              className={`${getButtonClass(filter.key)} cursor-pointer text-xs sm:text-sm`}
              key={filter.key || "all"}
              onClick={() => handleStatusFilterChange(filter.key)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center sm:w-auto lg:w-auto">
          <span className="mr-2 text-xs font-medium whitespace-nowrap text-gray-600 sm:mr-3 sm:text-sm">
            Sort by
          </span>
          <Select onValueChange={handleSortChangeValue} value={sortBy}>
            <SelectTrigger className="min-w-[140px] rounded-full px-3 py-2 text-xs sm:min-w-[160px] sm:px-4 sm:text-sm">
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Most Recent">Most Recent</SelectItem>
              <SelectItem value="Price: High to Low">
                Price: High to Low
              </SelectItem>
              <SelectItem value="Price: Low to High">
                Price: Low to High
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-px">{content}</div>

      {isFetching && !isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Updating bids...
          </div>
        </div>
      )}

      {selectedBid && (
        <ViewBidSheet
          bid={selectedBid}
          isOpen={isViewBidSheetOpen}
          onCloseAction={handleCloseViewBidSheet}
        />
      )}
    </div>
  );
}
