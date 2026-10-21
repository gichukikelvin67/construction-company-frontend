import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Separate client for refreshing access tokens.
 * It does not use the main API interceptors.
 */
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshClient
    .post("/auth/refresh")
    .then((response) => {
      const newAccessToken = response.data.accessToken;

      if (
        typeof newAccessToken !== "string" ||
        !newAccessToken
      ) {
        throw new Error(
          "Refresh response did not contain an access token"
        );
      }

      setAccessToken(newAccessToken);

      return newAccessToken;
    })
    .catch((error) => {
      console.error("Token refresh failed:", error);
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/*
 * Restore the session before sending a protected request
 * if the access token is missing from memory.
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? "";

    const isAuthenticationRequest =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/google") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");

    if (isAuthenticationRequest) {
      return config;
    }

    if (!accessToken) {
      await refreshAccessToken();
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  }
);

/*
 * If a token expires, refresh it and retry the original
 * request once.
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/google") ||
      originalRequest.url?.includes("/auth/forgot-password") ||
      originalRequest.url?.includes("/auth/reset-password")
    ) {
      return Promise.reject(error);
    }

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization =
      `Bearer ${newAccessToken}`;

    return api(originalRequest);
  }
);

export default api;