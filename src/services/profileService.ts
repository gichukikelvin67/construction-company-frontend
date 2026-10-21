import api from "@/lib/api";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company:string |null;
  role: string;
  profilePhoto: string | null;
  isActive: boolean;
  emailVerified: boolean;
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  user: UserProfile;
}

interface PhotoResponse {
  success: boolean;
  message: string;
  profilePhoto: string | null;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get<ProfileResponse>("/users/me");
  return response.data.user;
};

export const updateMyProfile = async (data: {
  name?: string;
  phone?: string;
}): Promise<UserProfile> => {
  const response = await api.patch<ProfileResponse>("/users/me", data);
  return response.data.user;
};

export const uploadMyProfilePhoto = async (
  file: File
): Promise<string | null> => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post<PhotoResponse>(
    "/users/me/photo",
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    }
  );

  return response.data.profilePhoto;
};

export const removeMyProfilePhoto = async (): Promise<void> => {
  await api.delete("/users/me/photo");
};