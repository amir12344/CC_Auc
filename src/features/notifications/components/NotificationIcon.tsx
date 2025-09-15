"use client";

import React from "react";

import { Bell } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../lib/store";
import {
  openNotificationSheet,
  selectIsLoading,
  selectUnreadCount,
} from "../store/notificationSlice";

export const NotificationIcon: React.FC = () => {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectIsLoading);

  const handleClick = () => {
    dispatch(openNotificationSheet());
  };

  return (
    <button
      onClick={handleClick}
      className="relative cursor-pointer rounded-full p-2 text-[#D8F4CC] transition-colors duration-300 hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
    >
      <Bell className={`h-6 w-6 ${isLoading ? "animate-pulse" : ""}`} />

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#43CD66] text-xs font-medium text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <span className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-[#43CD66]" />
      )}
    </button>
  );
};
