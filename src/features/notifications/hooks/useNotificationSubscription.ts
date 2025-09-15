import { useEffect, useRef } from "react";

import { generateClient } from "aws-amplify/api";

import type { Schema } from "../../../../amplify/data/resource";
import { useAppDispatch, useAppSelector } from "../../../lib/store";
import {
  addNotification,
  fetchNotifications,
  selectSubscriptionActive,
  setSubscriptionActive,
  updateNotificationRead,
} from "../store/notificationSlice";

let client: ReturnType<typeof generateClient<Schema>> | null = null;

// Initialize client with error handling
try {
  client = generateClient<Schema>();
} catch (error) {
  // Silent initialization - client will be null if failed
}

export const useNotificationSubscription = (userId: string | null) => {
  const dispatch = useAppDispatch();
  const subscriptionActive = useAppSelector(selectSubscriptionActive);
  const subscriptionRef = useRef<any>(null);
  const attemptedSetupRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || subscriptionActive || attemptedSetupRef.current === userId) {
      return;
    }

    let isMounted = true;

    const setupSubscription = async () => {
      try {
        attemptedSetupRef.current = userId;

        // Initial fetch of existing notifications
        await dispatch(fetchNotifications(userId));

        // Check if client and models are available for subscriptions
        if (!client || !client.models || !client.models.NotificationStorage) {
          return;
        }

        // Set up subscription for new notifications (onCreate)
        const createSubscription = client.models.NotificationStorage.onCreate({
          filter: {
            userId: { eq: userId },
          },
          authMode: "userPool",
        });

        // Set up subscription for notification updates (onUpdate)
        const updateSubscription = client.models.NotificationStorage.onUpdate({
          filter: {
            userId: { eq: userId },
          },
          authMode: "userPool",
        });

        // Handle new notification creation
        subscriptionRef.current = {
          create: createSubscription.subscribe({
            next: (data) => {
              if (isMounted && data) {
                dispatch(
                  addNotification({
                    id: data.id,
                    userId: data.userId,
                    timestamp: data.timestamp,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: data.data,
                    notificationRead: data.notificationRead,
                    ttl: data.ttl,
                    createdAt: data.createdAt,
                  })
                );

                // Show browser notification if permission granted
                if (
                  typeof Notification !== "undefined" &&
                  Notification.permission === "granted"
                ) {
                  new Notification(data.title, {
                    body: data.message,
                    icon: "/favicon.ico",
                    tag: data.id,
                  });
                }
              }
            },
            error: (error) => {
              // Handle subscription error silently
            },
          }),

          // Handle notification updates (e.g., read status changes)
          update: updateSubscription.subscribe({
            next: (data) => {
              if (isMounted && data) {
                dispatch(
                  updateNotificationRead({
                    id: data.id!,
                    read: data.notificationRead,
                  })
                );
              }
            },
            error: (error) => {
              // Handle subscription error silently
            },
          }),
        };

        if (isMounted) {
          dispatch(setSubscriptionActive(true));
        }
      } catch (error) {
        // Reset attempt flag on error to allow retry on next mount
        attemptedSetupRef.current = null;
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      isMounted = false;
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.create?.unsubscribe?.();
          subscriptionRef.current.update?.unsubscribe?.();
        } catch (error) {
          // Handle unsubscribe error silently
        }
        subscriptionRef.current = null;
      }
      dispatch(setSubscriptionActive(false));
      attemptedSetupRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, dispatch]); // subscriptionActive intentionally omitted to prevent infinite loop

  // Request browser notification permission on first use
  useEffect(() => {
    if (
      userId &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [userId]);

  return {
    subscriptionActive,
  };
};
