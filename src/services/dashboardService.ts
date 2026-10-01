import api from "@/lib/api";

export interface DashboardProject{
    _id:string;
    name:string;
    status:string;
    location?:string;
    budget?:number;
    startDate?:string;
}

export interface DashboardSummary {
  projects: number;
  workers: number;
  materials: number;
  expenses: number;
  recentProjects:DashboardProject[];
}

interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
}

export const getDashboardSummary =
  async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummaryResponse>(
      "/dashboard/summary"
    );

    return response.data.data;
  };