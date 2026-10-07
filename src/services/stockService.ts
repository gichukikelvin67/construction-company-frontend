import api from "@/lib/api";

export interface MaterialStock {
  material: {
    id: string;
    name: string;
    code?: string;
    unit: string;
    minimumStock: number;
  };
  currentStock: number;
  lowStock: boolean;
}

export interface StockMovement {
  _id: string;
  material: string;
  supplier?: string;
  project?: string;
  company: string;
  type: "receipt" | "issue" | "return" | "adjustment";
  adjustmentDirection?: "increase" | "decrease";
  quantity: number;
  unitCost?: number;
  referenceNumber?: string;
  notes?: string;
  movementDate: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialMovementsResponse {
  success: boolean;
  material: {
    id: string;
    name: string;
    code?: string;
    unit: string;
  };
  count: number;
  movements: StockMovement[];
}

export interface LowStockMaterial {
  material: {
    id: string;
    name: string;
    code?: string;
    unit: string;
  };
  currentStock: number;
  minimumStock: number;
  shortage: number;
}

export interface LowStockResponse {
  success: boolean;
  count: number;
  materials: LowStockMaterial[];
}

export interface CreateStockMovementData {
  materialId: string;
  supplierId?: string;
  projectId?: string;
  type: "receipt" | "issue" | "return" | "adjustment";
  adjustmentDirection?: "increase" | "decrease";
  quantity: number;
  unitCost?: number;
  referenceNumber?: string;
  notes?: string;
  movementDate: string;
}

export const getMaterialStock = async (
  materialId: string
): Promise<MaterialStock> => {
  const response = await api.get<{
    success: boolean;
    material: MaterialStock["material"];
    currentStock: number;
    lowStock: boolean;
  }>(`/stock-movements/material/${materialId}/stock`);

  return {
    material: response.data.material,
    currentStock: response.data.currentStock,
    lowStock: response.data.lowStock,
  };
};

export const getMaterialMovements = async (
  materialId: string
): Promise<MaterialMovementsResponse> => {
  const response = await api.get<MaterialMovementsResponse>(
    `/stock-movements/material/${materialId}/movements`
  );

  return response.data;
};

export const getLowStockMaterials =
  async (): Promise<LowStockResponse> => {
    const response = await api.get<LowStockResponse>(
      "/stock-movements/low-stock"
    );

    return response.data;
  };

export const createStockMovement = async (
  movementData: CreateStockMovementData
): Promise<StockMovement> => {
  try {
    console.log("STOCK MOVEMENT PAYLOAD:",movementData);
    const response = await api.post<{
      success: boolean;
      message: string;
      movement: StockMovement[];
    }>("/stock-movements", movementData);

    return response.data.movement[0];
  } catch (error: any) {
    console.error(
      "STOCK MOVEMENT BACKEND ERROR:",
      error.response?.data
    );

    throw error;
  }
};
export interface Material {
  _id: string;
  name: string;
  code?: string;
  description?: string;
  unit: string;
  minimumStock: number;
  company: string;
  createdBy: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMaterialsResponse {
  success: boolean;
  count: number;
  materials: Material[];
}

export const getMaterials = async (): Promise<Material[]> => {
  const response = await api.get<GetMaterialsResponse>("/materials");

  return response.data.materials;
};