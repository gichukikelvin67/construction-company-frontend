
import api from "@/lib/api";

export type InvoiceType = "supplier" | "client" | "project";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  type: InvoiceType;
  description?: string;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  project?: { _id: string; name: string } | string;
  supplier?: { _id: string; name: string } | string;
  createdAt?: string;
}

export interface CreateInvoiceData {
  projectId?: string;
  supplierId?: string;
  invoiceNumber: string;
  type: InvoiceType;
  description?: string;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
}

export interface UpdateInvoiceData {
  description?: string;
  dueDate?: string;
  status?: "draft" | "issued" | "cancelled";
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  projectId?: string;
  supplierId?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  search?: string;
}

export interface InvoicePagination {
  page: number;
  limit: number;
  totalInvoices: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InvoiceListResult {
  invoices: Invoice[];
  pagination: InvoicePagination;
}

interface InvoiceListResponse {
  success: boolean;
  invoices: Invoice[];
  pagination: InvoicePagination;
  message?: string;
}

interface SingleInvoiceResponse {
  success: boolean;
  invoice: Invoice;
  message?: string;
}

interface InvoiceActionResponse {
  success: boolean;
  message?: string;
  invoice?: Invoice;
}

export async function getInvoices(
  filters: InvoiceFilters = {}
): Promise<InvoiceListResult> {
  const response = await api.get<InvoiceListResponse>("/invoices", {
    params: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.supplierId ? { supplierId: filters.supplierId } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search?.trim()
        ? { search: filters.search.trim() }
        : {}),
    },
  });

  return {
    invoices: response.data.invoices,
    pagination: response.data.pagination,
  };
}

export async function createInvoice(
  data: CreateInvoiceData
): Promise<Invoice> {
  const response = await api.post<SingleInvoiceResponse>(
    "/invoices",
    data
  );

  return response.data.invoice;
}

export async function updateInvoice(
  invoiceId: string,
  data: UpdateInvoiceData
): Promise<Invoice> {
  const response = await api.patch<SingleInvoiceResponse>(
    `/invoices/${invoiceId}`,
    data
  );

  return response.data.invoice;
}

export async function archiveInvoice(
  invoiceId: string
): Promise<InvoiceActionResponse> {
  const response = await api.patch<InvoiceActionResponse>(
    `/invoices/${invoiceId}/archive`
  );

  return response.data;
}
