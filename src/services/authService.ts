
import api, { setAccessToken } from "@/lib/api";
import type { LoginResponse } from "@/types/auth";

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    {
      email: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe ?? false,
    }
  );

  setAccessToken(response.data.accessToken);

  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  try{

  await api.post("/auth/logout");
  }finally{
    setAccessToken(null);
  }
};

export const deactivateMyAccount = async (): Promise<ApiMessageResponse> => {
  const response = await api.patch<ApiMessageResponse>(
    "/users/me/deactivate"
  );

  setAccessToken(null);

  return response.data;
};


export const changePassword = async (
  data: ChangePasswordData
): Promise<ApiMessageResponse> => {
  const response = await api.patch<ApiMessageResponse>(
    "/auth/change-password",
    {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }
  );

  return response.data;
};
