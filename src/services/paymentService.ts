import api from "@/lib/api";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "mpesa"
  | "card"
  | "cheque";

export interface Payment {
  _id: string;
  invoice: string | {
    _id: string;
    invoiceNumber: string;
  };
  paymentReference: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  notes?: string;
  recordedBy?: string | {
    _id: string;
    name: string;
  };
  createdAt?: string;
}

export interface CreatePaymentData {
  invoiceId: string;
  paymentReference: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  notes?: string;
}

export interface PaymentListResponse {
  success: boolean;
  payments: Payment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePaymentResponse {
  success: boolean;
  message?: string;
  payment: Payment;
  invoice?: {
    id: string;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    status: string;
  };
}

export async function getPayments(
  invoiceId?: string
): Promise<Payment[]> {
  const response = await api.get<PaymentListResponse>(
    "/payments",
    {
      params: {
        ...(invoiceId ? { invoiceId } : {}),
        limit: 100,
      },
    }
  );

  return response.data.payments;
}

export async function createPayment(
  data: CreatePaymentData
): Promise<CreatePaymentResponse> {
  const response = await api.post<CreatePaymentResponse>(
    "/payments",
    data
  );

  return response.data;
}