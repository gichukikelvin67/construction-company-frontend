import api from "@/lib/api";

export interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

interface GetSuppliersResponse {
  success: boolean;
  count: number;
  suppliers: Supplier[];
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get<GetSuppliersResponse>("/suppliers");

  return response.data.suppliers;
};