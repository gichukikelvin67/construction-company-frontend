export type UserRole =
  | "admin"
  | "project_manager"
  | "site_supervisor"
  | "accountant"
  | "storekeeper";

export interface Company {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  company: Company;
  isActive: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken:string;
  user: User;
}