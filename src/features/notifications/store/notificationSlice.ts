import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { generateClient } from "aws-amplify/api";

import type { Schema } from "../../../../amplify/data/resource";

let client: ReturnType<typeof generateClient<Schema>> | null = null;

// Initialize client with error handling
try {
  client = generateClient<Schema>();
} catch (error) {
  console.error("Failed to initialize Amplify client:", error);
}

// Types based on your NotificationStorage model
export interface Notification {
  userId: string;
  timestamp: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  notificationRead: boolean;
  ttl?: number | null;
  createdAt: string;
  id?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isSheetOpen: boolean;
  subscriptionActive: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isSheetOpen: false,
  subscriptionActive: false,
};

// Async thunk to fetch notifications for current user
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId: string, { rejectWithValue }) => {
    try {
      // Check if client and models are available
      if (!client || !client.models || !client.models.NotificationStorage) {
        console.warn(
          "NotificationStorage model not available, returning empty array"
        );
        return [];
      }

      // Query notifications by userId with filter and sorting
      const { data } = await client.models.NotificationStorage.list({
        filter: {
          userId: {
            eq: userId,
          },
        },
        limit: 50, // Limit to recent 50 notifications
        authMode: "userPool",
      });

      // Sort by createdAt descending (most recent first)
      const sortedData = (data || []).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return sortedData;
    } catch (error) {
      return rejectWithValue("Failed to fetch notifications");
    }
  }
);

// Async thunk to mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // Check if client and models are available
      if (!client || !client.models || !client.models.NotificationStorage) {
        return rejectWithValue("NotificationStorage model not available");
      }

      const { data, errors } = await client!.models.NotificationStorage.update(
        {
          id: notificationId,
          notificationRead: true,
        },
        {
          authMode: "userPool",
        }
      );

      if (errors && errors.length > 0) {
        return rejectWithValue(
          `Backend update failed: ${errors.map((e) => e.message).join(", ")}`
        );
      }

      if (!data) {
        return rejectWithValue("No data returned from backend update");
      }

      return data;
    } catch (error) {
      return rejectWithValue(`Failed to mark notification as read: ${error}`);
    }
  }
);

// Async thunk to mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Check if client and models are available
      if (!client || !client.models || !client.models.NotificationStorage) {
        return rejectWithValue("NotificationStorage model not available");
      }

      const state = getState() as { notifications: NotificationState };
      const unreadNotifications = state.notifications.notifications.filter(
        (n) => !n.notificationRead
      );

      if (unreadNotifications.length === 0) {
        return [];
      }

      // Update all unread notifications
      const updatePromises = unreadNotifications.map(async (notification) => {
        try {
          const { data, errors } =
            await client!.models.NotificationStorage.update(
              {
                id: notification.id!,
                notificationRead: true,
              },
              {
                authMode: "userPool",
              }
            );

          if (errors && errors.length > 0) {
            throw new Error(
              `Failed to update notification ${notification.id}: ${errors.map((e) => e.message).join(", ")}`
            );
          }

          return data;
        } catch (error) {
          throw error;
        }
      });

      const results = await Promise.all(updatePromises);
      return unreadNotifications.map((n) => n.id!);
    } catch (error) {
      return rejectWithValue(
        `Failed to mark all notifications as read: ${error}`
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    openNotificationSheet: (state) => {
      state.isSheetOpen = true;
    },
    closeNotificationSheet: (state) => {
      state.isSheetOpen = false;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the array
      state.notifications.unshift(action.payload);
      if (!action.payload.notificationRead) {
        state.unreadCount += 1;
      }
    },
    updateNotificationRead: (
      state,
      action: PayloadAction<{ id: string; read: boolean }>
    ) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload.id
      );
      if (notification) {
        const wasUnread = !notification.notificationRead;
        notification.notificationRead = action.payload.read;

        // Update unread count
        if (wasUnread && action.payload.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    setSubscriptionActive: (state, action: PayloadAction<boolean>) => {
      state.subscriptionActive = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(
          (n) => !n.notificationRead
        ).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state, action) => {
        // Optimistically update the UI immediately
        const notificationId = action.meta.arg;
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification && !notification.notificationRead) {
          notification.notificationRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // Backend update successful - no additional action needed since we updated optimistically
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        // Revert optimistic update on failure
        const notificationId = action.meta.arg;
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification && notification.notificationRead) {
          notification.notificationRead = false;
          state.unreadCount += 1;
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.pending, (state, action) => {
        // Don't do optimistic updates for bulk operations to avoid race condition
        // We'll update the state only after successful backend calls
        state.isLoading = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        // Backend update successful - now update the state
        const updatedNotificationIds = action.payload;
        updatedNotificationIds.forEach((notificationId) => {
          const notification = state.notifications.find(
            (n) => n.id === notificationId
          );
          if (notification) {
            notification.notificationRead = true;
          }
        });
        // Recalculate unread count
        state.unreadCount = state.notifications.filter(
          (n) => !n.notificationRead
        ).length;
        state.isLoading = false;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        // Backend update failed - show error and stop loading
        state.error =
          (action.payload as string) ||
          "Failed to mark all notifications as read";
        state.isLoading = false;
      });
  },
});

export const {
  openNotificationSheet,
  closeNotificationSheet,
  addNotification,
  updateNotificationRead,
  setSubscriptionActive,
  clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectNotifications = (state: {
  notifications: NotificationState;
}) => state.notifications.notifications;
export const selectUnreadCount = (state: {
  notifications: NotificationState;
}) => state.notifications.unreadCount;
export const selectIsSheetOpen = (state: {
  notifications: NotificationState;
}) => state.notifications.isSheetOpen;
export const selectIsLoading = (state: { notifications: NotificationState }) =>
  state.notifications.isLoading;
export const selectError = (state: { notifications: NotificationState }) =>
  state.notifications.error;
export const selectSubscriptionActive = (state: {
  notifications: NotificationState;
}) => state.notifications.subscriptionActive;
