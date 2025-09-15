"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { fileToDbCategoryBiMap } from "@/amplify/functions/commons/converters/ListingTypeConverter";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
// Using inline SVG icons; no external icon imports for Gmail/WhatsApp in the contact row
import { createDraftWithInlineImage } from "@/src/utils/gmailDraft";

import { fetchBuyerOffers } from "../services/buyerQueryService";
import type { BuyerOffer } from "../types";

const ViewOfferSheet = dynamic(
  () =>
    import("./ViewOfferSheet").then((mod) => ({ default: mod.ViewOfferSheet })),
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
type OfferStatusFilter = string | null;

// Helper function to format status for display (only first letter capitalized)
const formatOfferStatus = (status: string): string => {
  return status
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    ); // Only capitalize first letter
};

export default function Offers() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const {
    data: offers = [],
    isLoading,
    isFetching,
  } = useQuery<BuyerOffer[]>({
    queryKey: ["buyerOffers"],
    queryFn: fetchBuyerOffers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  const [sortBy, setSortBy] = useState("Most Recent");
  const [statusFilter, setStatusFilter] = useState<OfferStatusFilter>(null);
  const [selectedOffer, setSelectedOffer] = useState<BuyerOffer | null>(null);
  const [isViewOfferSheetOpen, setIsViewOfferSheetOpen] = useState(false);

  // Generate dynamic status filters from actual offer data
  const offerStatusFilters = useMemo(() => {
    if (!offers.length) return [{ key: null, label: "All" }];

    // Get unique statuses from offers
    const uniqueStatuses = [
      ...new Set(offers.map((offer) => offer.offerStatus)),
    ].filter(Boolean);

    // Create filter options
    const filters = [
      { key: null, label: "All" },
      ...uniqueStatuses.map((status) => ({
        key: status,
        label: formatOfferStatus(status),
      })),
    ];

    return filters;
  }, [offers]);

  // Set active tab from URL parameter or default to 'ACTIVE' when offers load
  useEffect(() => {
    if (offers.length > 0) {
      if (activeTab) {
        // Use URL parameter if provided
        const validStatus = offers.find(
          (offer) => offer.offerStatus === activeTab
        );
        if (validStatus) {
          setStatusFilter(activeTab);
        }
      } else {
        // Default to 'ACTIVE' tab if it exists, otherwise keep 'All'
        const hasActiveOffers = offers.some(
          (offer) =>
            offer.offerStatus.toUpperCase() === "ACTIVE" ||
            offer.offerStatus.toUpperCase() === "PENDING" ||
            offer.offerStatus.toUpperCase() === "SUBMITTED"
        );
        if (hasActiveOffers) {
          // Find the most appropriate "active" status
          const activeStatus =
            offers.find((offer) => offer.offerStatus.toUpperCase() === "ACTIVE")
              ?.offerStatus ||
            offers.find(
              (offer) => offer.offerStatus.toUpperCase() === "PENDING"
            )?.offerStatus ||
            offers.find(
              (offer) => offer.offerStatus.toUpperCase() === "SUBMITTED"
            )?.offerStatus;

          if (activeStatus) {
            setStatusFilter(activeStatus);
          }
        }
      }
    }
  }, [activeTab, offers]);

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    let result = [...offers];

    if (statusFilter) {
      result = result.filter((offer) => offer.offerStatus === statusFilter);
    }

    switch (sortBy) {
      case "Price: High to Low":
        result.sort((a, b) => b.totalOfferValue - a.totalOfferValue);
        break;
      case "Price: Low to High":
        result.sort((a, b) => a.totalOfferValue - b.totalOfferValue);
        break;
      default:
        // Sort by most recent - using id as a proxy since we don't have created_at
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }
    return result;
  }, [offers, sortBy, statusFilter]);

  const handleStatusFilterChange = useCallback((status: OfferStatusFilter) => {
    setStatusFilter(status);
  }, []);

  const handleSortChangeValue = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  // Deterministic color assignment so every status gets a single consistent color without hardcoding lists
  const getOfferStatusChipClass = useCallback((status: string) => {
    const palette = [
      "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "bg-green-100 text-green-800 hover:bg-green-200",
      "bg-amber-100 text-amber-800 hover:bg-amber-200",
      "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "bg-pink-100 text-pink-800 hover:bg-pink-200",
      "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
      "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
      "bg-rose-100 text-rose-800 hover:bg-rose-200",
    ];
    let hash = 0;
    for (let i = 0; i < status.length; i += 1) {
      // Simple string hash to index into palette
      hash = (hash * 31 + status.charCodeAt(i)) >>> 0;
    }
    return palette[hash % palette.length];
  }, []);

  const handleViewOffer = useCallback((offer: BuyerOffer) => {
    setSelectedOffer(offer);
    setIsViewOfferSheetOpen(true);
  }, []);

  const handleCloseViewOfferSheet = useCallback(() => {
    setIsViewOfferSheetOpen(false);
    setSelectedOffer(null);
  }, []);

  // Format price with proper currency formatting
  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const getButtonClass = (status: OfferStatusFilter) => {
    const baseClasses =
      "rounded-full px-4 py-1.5 font-medium text-sm transition-colors";
    if (statusFilter === status) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  // Build Gmail and WhatsApp links for contacting Account Manager with prefilled details
  const buildOfferGmailLink = useCallback(
    (offer: BuyerOffer) => {
      // Plain-text body that looks neat in Gmail compose (no long image URLs)
      const subject = `Offer Inquiry: ${offer.title}`;
      const prettyCategory = offer.category
        ? fileToDbCategoryBiMap.getKey(offer.category as never)
        : "";
      const priceLine =
        offer.totalOfferValue > 0
          ? `• Total: $${formatPrice(offer.totalOfferValue)} ${offer.currency ?? ""}`
          : undefined;
      const lines = [
        "Hello CommerceCentral Team,",
        "",
        "I would like to talk to an account manager about the offer below:",
        "",
        `• Product: ${offer.title}`,
        prettyCategory ? `• Category: ${prettyCategory}` : undefined,
        offer.id ? `• Offer ID: ${offer.id}` : undefined,
        priceLine,
        "",
        "Please get back to me at your earliest convenience.",
        "",
        "Thanks!",
      ].filter(Boolean);
      const body = encodeURIComponent(lines.join("\n"));
      const su = encodeURIComponent(subject);
      return `https://mail.google.com/mail/?view=cm&fs=1&to=team@commercecentral.ai&su=${su}&body=${body}`;
    },
    [formatPrice]
  );

  const buildOfferWhatsAppLink = useCallback(
    (offer: BuyerOffer) => {
      const prettyCategory = offer.category
        ? fileToDbCategoryBiMap.getKey(offer.category as never)
        : "";
      const priceLine =
        offer.totalOfferValue > 0
          ? `• Total Offer Value: $${formatPrice(offer.totalOfferValue)} ${offer.currency ?? ""}`
          : undefined;
      const textLines = [
        "Hi CommerceCentral Team, I would like to talk to an account manager about this offer:",
        `• Product: ${offer.title}`,
        prettyCategory ? `• Category: ${prettyCategory}` : undefined,
        priceLine,
        offer.id ? `• Offer ID: ${offer.id}` : undefined,
        offer.imageUrl ? `• Image: ${offer.imageUrl}` : undefined,
      ].filter(Boolean);
      return `https://wa.me/?text=${encodeURIComponent(textLines.join("\n"))}`;
    },
    [formatPrice]
  );

  const handleEmailOffer = useCallback(
    async (offer: BuyerOffer) => {
      // Try rich Gmail draft first (with inline image) and fall back to simple Gmail link
      const prettyCategory = offer.category
        ? fileToDbCategoryBiMap.getKey(offer.category as never)
        : "";
      const price =
        offer.totalOfferValue > 0
          ? `$${formatPrice(offer.totalOfferValue)} ${offer.currency ?? ""}`
          : "";
      const html = `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif; color:#111827;">
        <h2 style="margin:0 0 8px 0; font-size:18px;">Offer Inquiry</h2>
        <table style="border-collapse:separate; border-spacing:0; width:100%; max-width:560px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
          <tbody>
            <tr>
              <td style="padding:16px; width:136px; vertical-align:top;">
                ${offer.imageUrl ? `<img src="cid:INLINE_IMAGE_1" alt="${offer.title}" style="display:block; width:120px; height:120px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb;"/>` : ""}
              </td>
              <td style="padding:16px; vertical-align:top;">
                <div style="font-size:16px; font-weight:600; margin-bottom:6px;">${offer.title}</div>
                ${price ? `<div style=\"font-size:14px; color:#111827; margin-bottom:4px;\"><strong>Total:</strong> ${price}</div>` : ""}
                ${prettyCategory ? `<div style=\"font-size:12px; color:#6b7280; margin-bottom:4px;\"><strong>Category:</strong> ${prettyCategory}</div>` : ""}
                ${offer.id ? `<div style=\"font-size:12px; color:#6b7280;\"><strong>Offer ID:</strong> ${offer.id}</div>` : ""}
              </td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:14px; color:#111827; margin:12px 0 0 0;">Please let me know the next steps.</p>
        <p style="font-size:14px; color:#111827; margin:4px 0 0 0;">Thanks!</p>
      </div>`;
      const inlineUrl = (() => {
        if (!offer.imageUrl) return undefined;
        try {
          const origin =
            typeof window !== "undefined" ? window.location.origin : "";
          if (!origin) return offer.imageUrl;
          const u = new URL("/_next/image", origin);
          u.searchParams.set("url", offer.imageUrl);
          u.searchParams.set("w", "600");
          u.searchParams.set("q", "80");
          return u.toString();
        } catch {
          return offer.imageUrl;
        }
      })();
      const result = await createDraftWithInlineImage({
        to: "team@commercecentral.ai",
        subject: `Offer Inquiry: ${offer.title}`,
        html,
        imageUrl: inlineUrl,
      }).catch(() => ({ ok: false }));
      if (!result?.ok) {
        const url = buildOfferGmailLink(offer);
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        // Open Gmail drafts folder to the newly created draft if possible, otherwise just open compose
        window.open(
          "https://mail.google.com/mail/u/0/#drafts",
          "_blank",
          "noopener,noreferrer"
        );
      }
    },
    [buildOfferGmailLink, formatPrice]
  );

  // Icons now come from public folder via next/image

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-px">
          {[1, 2, 3, 4, 5].map((i) => (
            <div className="border-b border-gray-200 py-4" key={i}>
              <div className="flex flex-col sm:flex-row">
                <div className="mb-3 h-26 w-25 flex-shrink-0 sm:mr-4 sm:mb-0">
                  <Skeleton className="h-full w-full rounded-sm" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-6 w-3/4" />
                      <Skeleton className="mb-1 h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="sm:ml-4 sm:text-right">
                      <Skeleton className="mb-1 h-6 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex justify-center sm:justify-end">
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredAndSortedOffers.length === 0 && !isLoading) {
      // Empty state (filters applied) — match dashed message box design from bids
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
          <div className="px-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
              No offers found
            </h3>
            <p className="mt-3 max-w-md text-sm text-gray-600 sm:text-base">
              {statusFilter
                ? `No offers found with status "${formatOfferStatus(statusFilter)}".`
                : "No offers match your current filters."}
            </p>
          </div>
        </div>
      );
    }

    // Deals list
    return filteredAndSortedOffers.map((offer, index) => (
      <div
        className="border-b border-gray-200 py-4 hover:bg-gray-50"
        key={offer.id}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="mb-3 h-26 w-25 flex-shrink-0 overflow-hidden sm:mr-4 sm:mb-0">
            <Image
              alt={offer.title}
              className="h-full w-full rounded-sm object-cover"
              height={96}
              loading={index === 0 ? "eager" : "lazy"}
              priority={index === 0}
              quality={75}
              sizes="96px"
              src={offer.imageUrl}
              unoptimized={true}
              width={96}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold break-words">
                  {offer.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {offer.description}
                </p>
              </div>

              <div className="text-left">
                {offer.totalOfferValue > 0 && (
                  <>
                    <div className="text-lg font-bold">
                      ${formatPrice(offer.totalOfferValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {offer.currency}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="text-xs" variant="outline">
                  {offer.category
                    ? fileToDbCategoryBiMap.getKey(offer.category as never)
                    : ""}
                </Badge>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${getOfferStatusChipClass(
                    offer.offerStatus
                  )}`}
                >
                  {formatOfferStatus(offer.offerStatus)}
                </span>
              </div>
              <div className="flex justify-center sm:justify-end">
                <Button
                  className="cursor-pointer rounded-full shadow-none hover:bg-black hover:text-white"
                  onClick={() => handleViewOffer(offer)}
                  size="sm"
                  variant="outline"
                >
                  View Offer
                </Button>
              </div>
            </div>

            {/* Contact row — compact pills aligned to the right, no separator */}
            <div className="mt-3">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
                <span className="text-xs font-medium text-gray-800 sm:text-sm">
                  Talk to Account Manager
                </span>
                <div className="flex items-center gap-3">
                  <button
                    aria-label={`Email account manager about ${offer.title}`}
                    className="inline-flex cursor-pointer items-center p-0 text-gray-700 transition-transform hover:scale-145 hover:opacity-85"
                    onClick={() => handleEmailOffer(offer)}
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
                  <Link
                    aria-label={`WhatsApp account manager about ${offer.title}`}
                    className="inline-flex items-center p-0 text-gray-700 transition-transform hover:scale-145 hover:opacity-85"
                    href={buildOfferWhatsAppLink(offer)}
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
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  }, [
    filteredAndSortedOffers,
    isLoading,
    formatPrice,
    statusFilter,
    getOfferStatusChipClass,
    handleViewOffer,
    buildOfferWhatsAppLink,
    handleEmailOffer,
  ]);

  return (
    <div className="max-w-8xl mx-auto w-full px-0 py-0 lg:px-6 lg:py-8">
      {/* Hide filters/sort when there are no offers at all */}
      {((Array.isArray(offers) && offers.length > 0) || isLoading) && (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {offerStatusFilters.map((filter) => (
              <button
                className={getButtonClass(filter.key)}
                key={filter.key || "all"}
                onClick={() => handleStatusFilterChange(filter.key)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center sm:w-auto">
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
      )}
      {/* Content list or empty state */}
      {offers.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
          <div className="px-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
              No offers found
            </h3>
            <p className="mt-3 max-w-md text-sm text-gray-600 sm:text-base">
              You haven&apos;t made any offers yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-px">{content}</div>
      )}

      {isFetching && !isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Updating offers...
          </div>
        </div>
      )}

      {selectedOffer && (
        <ViewOfferSheet
          isOpen={isViewOfferSheetOpen}
          offer={selectedOffer}
          onCloseAction={handleCloseViewOfferSheet}
        />
      )}
    </div>
  );
}
