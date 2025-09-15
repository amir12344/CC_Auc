"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  Gavel,
  ShoppingBag,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../lib/store";
import { selectUserProfile } from "../../authentication/store/authSelectors";
import {
  closeNotificationSheet,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  selectIsLoading,
  selectIsSheetOpen,
  selectNotifications,
  selectUnreadCount,
} from "../store/notificationSlice";
import {
  extractOfferIdFromNotification,
  formatNotificationType,
  formatRelativeTime,
} from "../utils/notificationTypeFormatter";

// Notification type icons mapping
const getNotificationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "offer_submitted":
    case "offer_accepted":
    case "offer_rejected":
    case "offer_counter":
      return <ShoppingBag className="h-4 w-4" />;
    case "auction_bid":
    case "auction_won":
    case "auction_lost":
      return <Gavel className="h-4 w-4" />;
    case "system_notification":
    case "account_verification":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

// Notification type colors
const getNotificationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "offer_accepted":
    case "auction_won":
    case "order_delivered":
      return "text-green-600 bg-green-50";
    case "offer_rejected":
    case "auction_lost":
    case "system_notification":
      return "text-red-600 bg-red-50";
    case "offer_submitted":
    case "auction_bid":
    case "order_created":
      return "text-blue-600 bg-blue-50";
    case "offer_counter":
    case "order_shipped":
      return "text-orange-600 bg-orange-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onReadMore: (offerId: string, notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onReadMore,
}) => {
  const offerId = extractOfferIdFromNotification(notification.data);

  const handleReadMore = () => {
    if (offerId) {
      // Always mark as read when clicking read more
      onMarkAsRead(notification.id);
      onReadMore(offerId, notification.id);
    }
  };

  const handleNotificationClick = () => {
    if (offerId) {
      // Always mark as read when clicking the entire notification
      onMarkAsRead(notification.id);
      onReadMore(offerId, notification.id);
    }
  };

  return (
    <div
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md sm:rounded-2xl sm:p-6 ${
        !notification.notificationRead
          ? "border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50/70"
          : "border-gray-200 bg-white opacity-75 hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={handleNotificationClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNotificationClick();
        }
      }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 ${getNotificationColor(
            notification.type
          )}`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-semibold sm:text-base ${
                    !notification.notificationRead
                      ? "text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {notification.title}
                </h3>
                {!notification.notificationRead && (
                  <div className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-blue-600" />
                )}
              </div>

              <p
                className={`mt-1 text-sm sm:text-base ${
                  !notification.notificationRead
                    ? "text-gray-800"
                    : "text-gray-600"
                }`}
              >
                {notification.message}
              </p>

              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 sm:text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(notification.createdAt)}</span>
                </div>
                <div className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                  {formatNotificationType(notification.type)}
                </div>
              </div>
            </div>

            {/* Read More Button - Keep for visual indication but entire item is clickable */}
            {offerId && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent double click
                  handleReadMore();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:h-10 sm:w-10"
                title="Read More"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationSheet: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const isOpen = useAppSelector(selectIsSheetOpen);
  const isLoading = useAppSelector(selectIsLoading);
  const unreadCount = useAppSelector(selectUnreadCount);
  const userProfile = useSelector(selectUserProfile);

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

  const handleClose = () => {
    dispatch(closeNotificationSheet());
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleReadMore = (offerId: string, notificationId: string) => {
    dispatch(closeNotificationSheet());
    // Always mark as read when clicking Read More, even if already read
    dispatch(markNotificationAsRead(notificationId));

    // Check if user is seller and redirect accordingly
    const isSeller = userProfile?.userType === "seller";

    if (isSeller) {
      // Redirect seller to seller dashboard offers
      router.push("/seller/dashboard/offers");
    } else {
      // Original buyer logic
      const notification = notifications.find((n) => n.id === notificationId);
      let targetUrl = "/buyer/deals/offers";

      if (notification?.type) {
        // Map notification types to offer statuses for direct tab navigation
        const typeToStatusMap: Record<string, string> = {
          OFFER_SUBMITTED: "PENDING",
          OFFER_ACCEPTED: "ACCEPTED",
          OFFER_REJECTED: "REJECTED",
          OFFER_COUNTER: "COUNTER",
          OFFER_EXPIRED: "EXPIRED",
          OFFER_CANCELLED: "CANCELLED",
        };

        const targetStatus = typeToStatusMap[notification.type.toUpperCase()];
        if (targetStatus) {
          targetUrl = `/buyer/deals/offers?tab=${targetStatus}`;
        }
      }

      router.push(targetUrl);
    }
  };

  if (!isOpen) return null;

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
      <div className="relative ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-xl sm:max-w-2xl lg:max-w-3xl">
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-sm transition-colors hover:bg-gray-800"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Bell className="h-6 w-6 text-gray-700 sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 sm:text-base">
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              {unreadCount > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>Mark all as read</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No notifications
              </h3>
              <p className="max-w-sm text-center text-gray-600">
                You&apos;ll see notifications about offers, auctions, orders,
                and account updates here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:space-y-6 sm:p-6 lg:p-10">
              {notifications.map((notification) => (
                <NotificationItem
                  key={
                    notification.id ||
                    `${notification.userId}-${notification.timestamp}`
                  }
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6 lg:px-10">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {notifications.length} total notification
                {notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
