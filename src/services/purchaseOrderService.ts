
import api from "@/lib/api";

export type PurchaseOrderStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "partially_received"
  | "received"
  | "cancelled";

export interface PurchaseOrderItem {
  material: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplier: string | { _id: string; name: string; phone?: string };
  project: string | { _id: string; name: string };
  items: PurchaseOrderItem[];
  subtotal: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  notes?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  projectId: string;
  items: {
    materialId: string;
    quantity: number;
    unitCost: number;
  }[];
  notes?: string;
}

interface PurchaseOrderResponse {
  success: boolean;
  message?: string;
  purchaseOrder: PurchaseOrder;
}

interface PurchaseOrdersResponse {
  success: boolean;
  count: number;
  purchaseOrders: PurchaseOrder[];
}

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const response = await api.get<PurchaseOrdersResponse>("/purchase-orders");
  return response.data.purchaseOrders;
};

export const getPurchaseOrderById = async (
  id: string
): Promise<PurchaseOrder> => {
  const response = await api.get<PurchaseOrderResponse>(
    `/purchase-orders/${id}`
  );
  return response.data.purchaseOrder;
};

export const createPurchaseOrder = async (
  data: CreatePurchaseOrderData
): Promise<PurchaseOrder> => {
  const response = await api.post<PurchaseOrderResponse>(
    "/purchase-orders",
    data
  );
  return response.data.purchaseOrder;
};

export const submitPurchaseOrder = async (
  id: string
): Promise<PurchaseOrder> => {
  const response = await api.patch<PurchaseOrderResponse>(
    `/purchase-orders/${id}/submit`
  );
  return response.data.purchaseOrder;
};

export const approvePurchaseOrder = async (
  id: string
): Promise<PurchaseOrder> => {
  const response = await api.patch<PurchaseOrderResponse>(
    `/purchase-orders/${id}/approve`
  );
  return response.data.purchaseOrder;
};

export const rejectPurchaseOrder = async (
  id: string,
  reason: string
): Promise<PurchaseOrder> => {
  const response = await api.patch<PurchaseOrderResponse>(
    `/purchase-orders/${id}/reject`,
    { reason }
  );
  return response.data.purchaseOrder;
};

export const cancelPurchaseOrder = async (
  id: string,
  reason: string
): Promise<PurchaseOrder> => {
  const response = await api.patch<PurchaseOrderResponse>(
    `/purchase-orders/${id}/cancel`,
    { reason }
  );
  return response.data.purchaseOrder;
};

export const updatePurchaseOrder = async (
  id: string,
  data: Partial<CreatePurchaseOrderData>
): Promise<PurchaseOrder> => {
  const response = await api.patch<PurchaseOrderResponse>(
    `/purchase-orders/${id}`,
    data
  );
  return response.data.purchaseOrder;
};

export const receivePurchaseOrder = async (
  id: string,
  items: { materialId: string; quantity: number }[],
  notes?: string
): Promise<PurchaseOrder> => {
  const response = await api.patch<PurchaseOrderResponse>(
    `/purchase-orders/${id}/receive`,
    { items, notes }
  );
  return response.data.purchaseOrder;
};
