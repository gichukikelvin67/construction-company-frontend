
import api from "@/lib/api";

export type UserRole =
  | "admin"
  | "project_manager"
  | "site_supervisor"
  | "accountant"
  | "storekeeper";

export interface CompanyUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<UserRole, "admin">;
}

interface UsersResponse {
  success: boolean;
  count: number;
  users: CompanyUser[];
}

interface UserResponse {
  success: boolean;
  message?: string;
  user: CompanyUser;
}

export const getUsers = async (): Promise<CompanyUser[]> => {
  const response = await api.get<UsersResponse>("/users");
  return response.data.users;
};

export const getUserById = async (
  id: string
): Promise<CompanyUser> => {
  const response = await api.get<UserResponse>(`/users/${id}`);
  return response.data.user;
};

export const createUser = async (
  data: CreateUserData
): Promise<CompanyUser> => {
  const response = await api.post<UserResponse>("/users", data);
  return response.data.user;
};

export const updateUserProfile = async (
  id: string,
  data: Partial<Pick<CompanyUser, "name" | "email" | "phone">>
): Promise<CompanyUser> => {
  const response = await api.patch<UserResponse>(`/users/${id}`, data);
  return response.data.user;
};

export const updateUserRole = async (
  id: string,
  role: Exclude<UserRole, "admin">
): Promise<CompanyUser> => {
  const response = await api.patch<UserResponse>(
    `/users/${id}/role`,
    { role }
  );
  return response.data.user;
};

export const toggleUserStatus = async (
  id: string
): Promise<CompanyUser> => {
  const response = await api.patch<UserResponse>(`/users/${id}/status`);
  return response.data.user;
};
