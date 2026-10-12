
import api from "@/lib/api";

export interface AuditLogUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditLog {
  _id: string;
  user: AuditLogUser | string;
  action:
    | "create"
    | "update"
    | "delete"
    | "approve"
    | "reject"
    | "cancel"
    | "receive"
    | "login"
    | "logout"
    | "activate"
    | "deactivate";
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  count: number;
  auditLogs: AuditLog[];
}

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await api.get<AuditLogsResponse>("/audit-logs");
  return response.data.auditLogs;
};
