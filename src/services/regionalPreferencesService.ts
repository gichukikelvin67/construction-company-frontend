import api from "@/lib/api";

export type RegionalPreferences = {
  language: "en" | "sw";
  timezone: "Africa/Nairobi" | "UTC";
  currency: "KES" | "USD";
};

type RegionalPreferencesResponse = {
  success: boolean;
  message?: string;
  preferences: RegionalPreferences;
};

export const getRegionalPreferences =
  async (): Promise<RegionalPreferences> => {
    const response = await api.get<RegionalPreferencesResponse>(
      "/users/me/regional-preferences"
    );

    return response.data.preferences;
  };

export const updateRegionalPreferences = async (
  preferences: RegionalPreferences
): Promise<RegionalPreferences> => {
  const response = await api.patch<RegionalPreferencesResponse>(
    "/users/me/regional-preferences",
    preferences
  );

  return response.data.preferences;
};