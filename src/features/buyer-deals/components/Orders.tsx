"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
// Minimal neutral emojis used for contact actions (no colorful brand icons)
import { createDraftWithInlineImage } from "@/src/utils/gmailDraft";

import { fetchBuyerOrders } from "../services/buyerQueryService";
import type { BuyerOrder } from "../types";
import { ViewOrderSheet } from "./ViewOrderSheet";

const formatOrderDateWithPrefix = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return `Placed on ${date.toLocaleDateString("en-US", options)}`;
};

const formatOrderNumberWithPrefix = (orderNumber: string): string => {
  return `Order #${orderNumber}`;
};

// Helper function to format status for display
const formatOrderStatus = (status: string): string => {
  const formatted = status.replace(/_/g, " ").toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default function Orders() {
  const {
    data: orders = [],
    isLoading,
    isFetching,
  } = useQuery<BuyerOrder[]>({
    queryKey: ["buyerOrders"],
    queryFn: fetchBuyerOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  const [sortBy, setSortBy] = useState("Most Recent");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);
  const [isViewOrderSheetOpen, setIsViewOrderSheetOpen] = useState(false);

  // Generate dynamic status filters from actual order data
  const orderStatusFilters = useMemo(() => {
    if (!orders.length) return [{ key: null, label: "All" }];
    const uniqueStatuses = [
      ...new Set(orders.map((order) => order.orderStatus)),
    ].filter(Boolean);

    // Create filter options
    const filters = [
      { key: null, label: "All" },
      ...uniqueStatuses.map((status) => ({
        key: status,
        label: formatOrderStatus(status),
      })),
    ];

    return filters;
  }, [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter) {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    switch (sortBy) {
      case "Price: High to Low":
        result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "Price: Low to High":
        result.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
      default:
        // Sort by most recent (created_at)
        result.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        break;
    }
    return result;
  }, [orders, sortBy, statusFilter]);

  const handleStatusFilterChange = useCallback((status: string | null) => {
    setStatusFilter(status);
  }, []);

  const handleSortChangeValue = useCallback((value: string) => {
    setSortBy(value);
  }, []);

  // Deterministic single-color-per-status mapping
  const getOrderStatusChipClass = useCallback((status: string) => {
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
      hash = (hash * 31 + status.charCodeAt(i)) >>> 0;
    }
    return palette[hash % palette.length];
  }, []);

  const handleViewOrder = useCallback((order: BuyerOrder) => {
    setSelectedOrder(order);
    setIsViewOrderSheetOpen(true);
  }, []);

  const handleCloseViewOrderSheet = useCallback(() => {
    setIsViewOrderSheetOpen(false);
    setSelectedOrder(null);
  }, []);

  const formatPrice = useCallback((price: number) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  // Build Gmail and WhatsApp links for contacting Account Manager
  const buildOrderGmailLink = useCallback(
    (order: BuyerOrder) => {
      const subject = `Order Inquiry: ${order.title} (${order.orderNumber})`;
      const lines = [
        "Hello CommerceCentral Team,",
        "",
        "I would like to talk to an account manager about this order:",
        "",
        `• Product: ${order.title}`,
        order.orderNumber ? `• Order ID: ${order.orderNumber}` : undefined,
        `• Total Amount: $${formatPrice(order.totalAmount)} ${order.currency ?? ""}`,
        `• Placed On: ${new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
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

  const handleEmailOrder = useCallback(
    async (order: BuyerOrder) => {
      const html = `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif; color:#111827;">
        <h2 style="margin:0 0 8px 0; font-size:18px;">Order Inquiry</h2>
        <table style="border-collapse:separate; border-spacing:0; width:100%; max-width:560px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
          <tbody>
            <tr>
              <td style="padding:16px; width:136px; vertical-align:top;">
                ${order.imageUrl ? `<img src="cid:INLINE_IMAGE_1" alt="${order.title}" style="display:block; width:120px; height:120px; object-fit:cover; border-radius:8px; border:1px solid #e5e7eb;"/>` : ""}
              </td>
              <td style="padding:16px; vertical-align:top;">
                <div style="font-size:16px; font-weight:600; margin-bottom:6px;">${order.title}</div>
                <div style="font-size:12px; color:#6b7280; margin-bottom:4px;"><strong>Order ID:</strong> ${order.orderNumber}</div>
                <div style="font-size:14px; color:#111827; margin-bottom:4px;"><strong>Total:</strong> $${formatPrice(order.totalAmount)} ${order.currency ?? ""}</div>
                <div style="font-size:12px; color:#6b7280;"><strong>Placed On:</strong> ${new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
              </td>
            </tr>
          </tbody>
        </table>
        <p style="font-size:14px; color:#111827; margin:12px 0 0 0;">Please let me know the next steps.</p>
        <p style="font-size:14px; color:#111827; margin:4px 0 0 0;">Thanks!</p>
      </div>`;
      const inlineUrl = (() => {
        if (!order.imageUrl) return undefined;
        try {
          const origin =
            typeof window !== "undefined" ? window.location.origin : "";
          if (!origin) return order.imageUrl;
          const u = new URL("/_next/image", origin);
          u.searchParams.set("url", order.imageUrl);
          u.searchParams.set("w", "600");
          u.searchParams.set("q", "80");
          return u.toString();
        } catch {
          return order.imageUrl;
        }
      })();
      const result = await createDraftWithInlineImage({
        to: "team@commercecentral.ai",
        subject: `Order Inquiry: ${order.title} (${order.orderNumber})`,
        html,
        imageUrl: inlineUrl,
      }).catch(() => ({ ok: false }));
      if (!result?.ok) {
        const url = buildOrderGmailLink(order);
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.open(
          "https://mail.google.com/mail/u/0/#drafts",
          "_blank",
          "noopener,noreferrer"
        );
      }
    },
    [buildOrderGmailLink, formatPrice]
  );

  const buildOrderWhatsAppLink = useCallback(
    (order: BuyerOrder) => {
      const lines = [
        "Hi CommerceCentral Team, I would like to talk to an account manager about this order:",
        `• Product: ${order.title}`,
        order.orderNumber ? `• Order ID: ${order.orderNumber}` : undefined,
        order.imageUrl ? `• Image: ${order.imageUrl}` : undefined,
        `• Total Amount: $${formatPrice(order.totalAmount)} ${order.currency ?? ""}`,
      ].filter(Boolean);
      return `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
    },
    [formatPrice]
  );

  const getButtonClass = (status: string | null) => {
    const baseClasses =
      "rounded-full px-4 py-1.5 font-medium text-sm transition-colors";
    if (statusFilter === status) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };

  const renderTabWithIndicator = (filter: {
    key: string | null;
    label: string;
  }) => {
    return (
      <button
        className={getButtonClass(filter.key)}
        key={filter.key || "all"}
        onClick={() => handleStatusFilterChange(filter.key)}
        type="button"
      >
        <span className="flex items-center gap-2">{filter.label}</span>
      </button>
    );
  };

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="space-y-px">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-gray-200 py-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="mx-auto h-20 w-20 flex-shrink-0 sm:mx-0 sm:h-24 sm:w-24">
                  <Skeleton className="h-full w-full rounded-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="mb-2 h-5 w-3/4 sm:h-6" />
                      <div className="mt-1 mb-2 flex flex-wrap items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-1 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="mb-1 h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                      <Skeleton className="mb-1 h-6 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="flex justify-center sm:justify-end">
                      <Skeleton className="h-8 w-full rounded-full sm:w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (filteredAndSortedOrders.length === 0) {
      // Empty state for filters — dashed message box to match bids
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 sm:py-16">
          <div className="px-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
              No orders found
            </h3>
            <p className="mt-3 max-w-md text-sm text-gray-600 sm:text-base">
              You don’t have any orders yet. Start shopping to place your first
              order.
            </p>
          </div>
        </div>
      );
    }
    return filteredAndSortedOrders.map((order, index) => (
      <div
        className="border-b border-gray-200 py-4 hover:bg-gray-50"
        key={order.id}
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="mb-3 h-20 w-20 flex-shrink-0 overflow-hidden sm:mr-4 sm:mb-0 sm:h-24 sm:w-24">
            <Image
              alt={order.title}
              className="h-full w-full rounded-sm object-cover"
              height={96}
              loading={index === 0 ? "eager" : "lazy"}
              priority={index === 0}
              quality={75}
              sizes="(max-width: 640px) 80px, 96px"
              src={order.imageUrl}
              unoptimized={true}
              width={96}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold sm:text-lg">
                  {order.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">
                    {formatOrderNumberWithPrefix(order.orderNumber)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm font-medium text-purple-600">
                    {formatOrderDateWithPrefix(order.orderDate)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {order.description}
                </p>
              </div>

              <div className="flex-shrink-0 text-left sm:text-right">
                <div className="text-lg font-bold">
                  ${formatPrice(order.totalAmount)}
                </div>
                <div className="text-xs text-gray-500">{order.currency}</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${getOrderStatusChipClass(
                    order.orderStatus
                  )}`}
                >
                  {formatOrderStatus(order.orderStatus)}
                </span>
              </div>
              <div className="flex justify-center sm:justify-end">
                <Button
                  className="cursor-pointer rounded-full"
                  onClick={() => handleViewOrder(order)}
                  size="sm"
                  variant="outline"
                >
                  View Order
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
                    aria-label={`Email account manager about ${order.title}`}
                    className="inline-flex cursor-pointer items-center p-0 text-gray-700 transition-transform hover:scale-145 hover:opacity-85"
                    onClick={() => handleEmailOrder(order)}
                    title="Email (Gmail)"
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
                    aria-label={`WhatsApp account manager about ${order.title}`}
                    className="inline-flex items-center p-0 text-gray-700 transition-transform hover:scale-145 hover:opacity-85"
                    href={buildOrderWhatsAppLink(order)}
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
    isLoading,
    filteredAndSortedOrders,
    formatPrice,
    getOrderStatusChipClass,
    handleViewOrder,
    handleEmailOrder,
    buildOrderWhatsAppLink,
  ]);

  return (
    <div className="max-w-8xl mx-auto w-full px-0 py-0 lg:px-6 lg:py-8">
      {/* Hide filters/sort when there are no orders at all */}
      {((Array.isArray(orders) && orders.length > 0) || isLoading) && (
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {orderStatusFilters.map((filter) => renderTabWithIndicator(filter))}
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

      <div className="space-y-px">{content}</div>

      {isFetching && !isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            Updating orders...
          </div>
        </div>
      )}

      {selectedOrder && (
        <ViewOrderSheet
          isOpen={isViewOrderSheetOpen}
          onCloseAction={handleCloseViewOrderSheet}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
