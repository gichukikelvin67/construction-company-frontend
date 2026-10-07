import api from "@/lib/api";

export interface AssignedWorker {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  jobTitle: string;
  dailyRate: number;
  status: "active" | "inactive" | "suspended";
}

export interface AssignedProject {
  _id: string;
  name: string;
  location: string;
  clientName?: string;
  status: string;
  startDate?: string;
  expectedEndDate?: string;
}

export interface WorkerAssignment {
  _id: string;
  company: string;

  worker: AssignedWorker;

  project: AssignedProject;

  roleOnProject: string;

  startDate: string;

  endDate?: string;

  agreedDailyRate: number;

  status: "active" | "completed" | "cancelled";

  createdAt?: string;
  updatedAt?: string;
}

interface GetProjectWorkersResponse {
  success: boolean;
  count: number;
  assignments: WorkerAssignment[];
}

interface CreateWorkerAssignmentResponse {
  success: boolean;
  message: string;
  assignment: WorkerAssignment;
}

export interface CreateWorkerAssignmentData {
  projectId: string;
  workerId: string;
  roleOnProject: string;
  startDate: string;
  endDate?: string;
  agreedDailyRate: number;
}

export const getProjectWorkers = async (
  projectId: string
): Promise<WorkerAssignment[]> => {
  const response =
    await api.get<GetProjectWorkersResponse>(
      `/worker-assignments/project/${projectId}`
    );

  return response.data.assignments;
};

export const createWorkerAssignment = async (
  assignmentData: CreateWorkerAssignmentData
): Promise<WorkerAssignment> => {
  const response =
    await api.post<CreateWorkerAssignmentResponse>(
      "/worker-assignments",
      assignmentData
    );

  return response.data.assignment;
};