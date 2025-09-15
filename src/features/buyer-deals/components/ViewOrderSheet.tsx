"use client";

import Image from "next/image";
import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CreditCard,
  ImageIcon,
  Loader2,
  Package,
  Truck,
  X,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { QUERY_KEYS } from "@/src/shared/constants/api";

import { fetchBuyerOrderDetails } from "../services/buyerQueryService";
import type { BuyerOrder, BuyerOrderDetails } from "../types";

// Utility function to format currency
const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Utility function to format display name for variants
const formatVariantDisplayName = (
  productTitle: string,
  variantName?: string
): string => {
  if (
    !variantName ||
    variantName.toLowerCase() === "default" ||
    variantName.trim() === ""
  ) {
    return productTitle;
  }
  return `${productTitle} - ${variantName}`;
};

// Utility function to format date with "Placed on" prefix
const formatOrderDateWithPrefix = (dateString: string): string => {
  return `Placed on ${dateString}`;
};

// Utility function to format order number with emphasis
const formatOrderNumberWithPrefix = (orderNumber: string): string => {
  return `Order #${orderNumber}`;
};

// Order status display mapping
const orderStatusDisplayMap: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

// Order type display mapping
const orderTypeDisplayMap: Record<string, string> = {
  CATALOG: "Catalog Order",
  AUCTION: "Auction Order",
};

interface ViewOrderSheetProps {
  order: BuyerOrder;
  isOpen: boolean;
  onCloseAction: () => void;
}

export function ViewOrderSheet({
  order,
  isOpen,
  onCloseAction,
}: ViewOrderSheetProps) {
  // Lock background scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Handle close action
  const handleClose = () => {
    onCloseAction();
  };

  // Fetch order details
  const { data: orderDetails, isLoading } = useQuery<BuyerOrderDetails | null>({
    queryKey: [QUERY_KEYS.ORDER_DETAILS(order.id)],
    queryFn: () => fetchBuyerOrderDetails(order.id),
    enabled: isOpen && Boolean(order.id),
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClose();
          }
        }}
        role="button"
        tabIndex={0}
      />

      {/* Sheet */}
      <div className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-xl sm:max-w-2xl lg:max-w-4xl">
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-sm transition-colors hover:bg-gray-800"
              onClick={handleClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 sm:h-16 sm:w-16 sm:rounded-2xl">
                    {orderDetails?.imageUrl ? (
                      <div
                        className="h-10 w-10 rounded-xl bg-gray-200 sm:h-14 sm:w-14 sm:rounded-2xl"
                        style={{
                          backgroundImage: `url(${orderDetails.imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                    )}
                  </div>
                  <div>
                    <h1
                      className="text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl"
                      id="view-order-title"
                    >
                      Order Details
                    </h1>
                    <div className="rounded-lg bg-blue-50 px-2 py-1 sm:px-3 sm:py-2">
                      <p className="text-sm font-semibold text-blue-900 sm:text-base">
                        {orderDetails
                          ? formatOrderNumberWithPrefix(
                              orderDetails.orderNumber
                            )
                          : formatOrderNumberWithPrefix(order.orderNumber)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="text-gray-600">Loading order details...</span>
              </div>
            </div>
          )}

          {!isLoading && orderDetails && (
            <>
              {/* Order Summary */}
              <div className="mb-6 rounded-xl border border-gray-200 p-4 sm:mb-8 sm:rounded-2xl sm:p-6">
                <h2 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
                  Order Summary
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Order Type
                      </div>
                      <div className="font-semibold text-gray-900">
                        {orderTypeDisplayMap[orderDetails.orderType] ||
                          orderDetails.orderType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Total Amount
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(
                          orderDetails.totalAmount,
                          orderDetails.currency
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Order Date
                      </div>
                      <div className="rounded-md bg-purple-50 px-2 py-1">
                        <div className="text-sm font-semibold text-purple-900">
                          {formatOrderDateWithPrefix(orderDetails.orderDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Status
                      </div>
                      <Badge variant="secondary">
                        {orderStatusDisplayMap[orderDetails.orderStatus] ||
                          orderDetails.orderStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
                {/* Payment Information */}
                <div className="rounded-xl border border-gray-200 p-4 sm:rounded-2xl sm:p-6">
                  <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    {orderDetails.paymentDueDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Due Date:</span>
                        <span className="font-medium text-gray-900">
                          {orderDetails.paymentDueDate}
                        </span>
                      </div>
                    )}
                    {orderDetails.shippingCost !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Cost:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(
                            orderDetails.shippingCost,
                            orderDetails.currency
                          )}
                        </span>
                      </div>
                    )}
                    {orderDetails.taxAmount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Amount:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(
                            orderDetails.taxAmount,
                            orderDetails.currency
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="rounded-xl border border-gray-200 p-4 sm:rounded-2xl sm:p-6">
                  <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
                    Shipping Information
                  </h3>
                  <div className="space-y-3">
                    {orderDetails.shippingDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Date:</span>
                        <span className="font-medium text-gray-900">
                          {orderDetails.shippingDate}
                        </span>
                      </div>
                    )}
                    {orderDetails.deliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Date:</span>
                        <span className="font-medium text-gray-900">
                          {orderDetails.deliveryDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-xl border border-gray-200 p-4 sm:rounded-2xl sm:p-6">
                <h3 className="mb-4 text-base font-semibold text-gray-900 sm:mb-6 sm:text-lg">
                  Order Items
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {orderDetails.orderItems.map((item) => (
                    <div
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 sm:gap-4 sm:rounded-xl sm:p-4"
                      key={item.id}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 sm:h-16 sm:w-16 sm:rounded-xl">
                        {item.imageUrl ? (
                          <Image
                            alt={item.productTitle}
                            className="h-10 w-10 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
                            height={56}
                            src={item.imageUrl}
                            width={56}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                          {formatVariantDisplayName(
                            item.productTitle,
                            item.variantName
                          )}
                        </h4>
                        {item.variantSku && (
                          <p className="text-xs text-gray-500">
                            SKU: {item.variantSku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 sm:text-base">
                          {formatCurrency(item.totalPrice, item.currency)}
                        </div>
                        <div className="text-xs text-gray-600 sm:text-sm">
                          {item.quantity} ×{" "}
                          {formatCurrency(item.unitPrice, item.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!(isLoading || orderDetails) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-lg text-gray-500">Order not found</div>
                <p className="text-sm text-gray-400">
                  The requested order could not be loaded.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
