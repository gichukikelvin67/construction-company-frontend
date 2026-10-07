import api from "@/lib/api";

export interface Worker {
  _id: string;
  company: string;
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  jobTitle: string;
  dailyRate: number;
  status: "active" | "inactive" | "suspended";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GetWorkersResponse {
  success: boolean;
  count: number;
  workers: Worker[];
}

export const getWorkers = async (): Promise<Worker[]> => {
  const response = await api.get<GetWorkersResponse>("/workers");

  return response.data.workers;
};
export interface CreateWorkerData {
  name: string;
  phone: string;
  email?: string;
  nationalId?: string;
  jobTitle: string;
  dailyRate: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface CreateWorkerResponse {
  success: boolean;
  message: string;
  worker: Worker;
}

export const createWorker = async (
  workerData: CreateWorkerData
): Promise<Worker> => {
  const response = await api.post<CreateWorkerResponse>(
    "/workers",
    workerData
  );

  return response.data.worker;
};
export interface UpdateWorkerData {
  name?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  jobTitle?: string;
  dailyRate?: number;
  status?: "active" | "inactive" | "suspended";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface UpdateWorkerResponse {
  success: boolean;
  message: string;
  worker: Worker;
}

export const updateWorker = async (
  workerId: string,
  workerData: UpdateWorkerData
): Promise<Worker> => {
  const response = await api.patch<UpdateWorkerResponse>(
    `/workers/${workerId}`,
    workerData
  );

  return response.data.worker;
};