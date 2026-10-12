import api from "@/lib/api";

export interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?:string;
  notes?:string;
  company?:string;
  createdBy?:string;
  isActive: boolean;
  createdAt?:string;
  updatedAt?:string;
}
export interface SupplierFormData{
  name:string;
  phone:string;
  email?:string;
  address?:string;
  contactPerson?:string;
  notes?:string;
}
interface SupplierResponse{
  success:boolean;
  message?:string;
  supplier:Supplier;
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
export const createSupplier = async (
  supplierData: SupplierFormData
): Promise<Supplier> => {
  const response = await api.post<SupplierResponse>(
    "/suppliers",
    supplierData
  );

  return response.data.supplier;
};

export const updateSupplier = async (
  supplierId: string,
  supplierData: Partial<SupplierFormData>
): Promise<Supplier> => {
  const response = await api.patch<SupplierResponse>(
    `/suppliers/${supplierId}`,
    supplierData
  );

  return response.data.supplier;
};

export const setSupplierActive = async (
  supplierId: string,
  isActive: boolean
): Promise<Supplier> => {
  const response = await api.patch<SupplierResponse>(
    `/suppliers/${supplierId}/status`,
    { isActive }
  );

  return response.data.supplier;
};