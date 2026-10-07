"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "@/services/notificationService";

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      setError(null);

      const response = await getNotifications(1, 20);

      setNotifications(response.notifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);

      setError("Failed to load notifications");
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationCount();

      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error("Failed to load unread notification count:", error);
    }
  }, []);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markNotificationAsRead(notificationId);

        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) =>
            notification._id === notificationId
              ? {
                  ...notification,
                  isRead: true,
                  readAt: new Date().toISOString(),
                }
              : notification
          )
        );

        setUnreadCount((currentCount) =>
          Math.max(currentCount - 1, 0)
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);

        throw error;
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ?? new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      throw error;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const [notificationsResponse, unreadResponse] =
          await Promise.all([
            getNotifications(1, 20),
            getUnreadNotificationCount(),
          ]);

        if (!mounted) return;

        setNotifications(notificationsResponse.notifications);
        setUnreadCount(unreadResponse.unreadCount);
      } catch (error) {
        if (!mounted) return;

        console.error("Failed to load notifications:", error);

        setError("Failed to load notifications");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};