
import api from "@/lib/api";

export interface CreateProjectData {
  name: string;
  location: string;
  clientName: string;
  budget: number;
  startDate: string;
  expectedEndDate: string;
  description: string;
}

export interface Project {
  _id: string;
  name: string;
  location?: string;
  clientName?: string;
  budget?: number;
  startDate?: string;
  expectedEndDate?: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}

interface GetProjectsResponse {
  success: boolean;
  count: number;
  projects: Project[];
}

interface GetProjectResponse {
  success: boolean;
  project: Project;
}

export const createProject = async (
  projectData: CreateProjectData
): Promise<Project> => {
  const response = await api.post<CreateProjectResponse>(
    "/projects",
    projectData
  );

  return response.data.project;
};

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get<GetProjectsResponse>("/projects");

  return response.data.projects;
};

export const getProjectById = async (
  projectId: string
): Promise<Project> => {
  const response = await api.get<GetProjectResponse>(
    `/projects/${projectId}`
  );

  return response.data.project;
};
