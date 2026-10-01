import api , {setAccessToken} from "@/lib/api";
import type { LoginResponse } from "@/types/auth";

interface LoginCredentials{
    email:string;
    password:string;
}
export const loginUser = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  setAccessToken(response.data.accessToken);

  return response.data;
};
export const logoutUser=async():Promise<void>=>{
    await api.post("/auth/logout");
}