// Export all notification components and hooks
export { NotificationIcon } from "./components/NotificationIcon";
export { NotificationSheet } from "./components/NotificationSheet";
export { NotificationProvider } from "./components/NotificationProvider";
export { useNotificationSubscription } from "./hooks/useNotificationSubscription";

// Export all notification store items
export {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  openNotificationSheet,
  closeNotificationSheet,
  addNotification,
  updateNotificationRead,
  setSubscriptionActive,
  clearError,
  selectNotifications,
  selectUnreadCount,
  selectIsSheetOpen,
  selectIsLoading,
  selectError,
  selectSubscriptionActive,
} from "./store/notificationSlice";

// Export types
export type {
  Notification,
  NotificationState,
} from "./store/notificationSlice";
