import api from "@/lib/api";

export interface Notification{
    _id:string;
    company:string;
    user:string;
    type:
    |"invoice"
    |"payment"
    |"purchase_order"
    |"stock"
    |"task"
    |"daily_report"
    |"project"
    |"expense"
    |"system";

    title:string;
    message:string;
    resource?: string;
  resourceId?: string;
  notificationKey?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  totalNotifications: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetNotificationsResponse {
  success: boolean;
  pagination: NotificationPagination;
  notifications: Notification[];
}

export interface UnreadNotificationCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkNotificationResponse {
  success: boolean;
  message: string;
  notification?: Notification;
}

export interface MarkAllNotificationsResponse {
  success: boolean;
  message: string;
  updatedCount: number;
}

export const getNotifications = async (
  page = 1,
  limit = 20,
  isRead?: boolean
): Promise<GetNotificationsResponse> => {
  const response = await api.get<GetNotificationsResponse>(
    "/notifications",
    {
      params: {
        page,
        limit,
        ...(isRead !== undefined ? { isRead } : {}),
      },
    }
  );

  return response.data;
};

export const getUnreadNotificationCount =
  async (): Promise<UnreadNotificationCountResponse> => {
    const response = await api.get<UnreadNotificationCountResponse>(
      "/notifications/unread-count"
    );

    return response.data;
  };

export const markNotificationAsRead = async (
  notificationId: string
): Promise<MarkNotificationResponse> => {
  const response = await api.patch<MarkNotificationResponse>(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

export const markAllNotificationsAsRead =
  async (): Promise<MarkAllNotificationsResponse> => {
    const response = await api.patch<MarkAllNotificationsResponse>(
      "/notifications/read-all"
    );

    return response.data;
  };
