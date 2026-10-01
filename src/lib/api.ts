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
 * This client is used ONLY to refresh the access token.
 *
 * It deliberately does not use the normal api response
 * interceptor, otherwise a failed refresh could trigger
 * another refresh request.
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
  /*
   * If another request is already refreshing the token,
   * wait for that same request instead of creating another
   * refresh request.
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshClient
    .post("/auth/refresh")
    .then((response) => {
      const newAccessToken = response.data.accessToken;

      if (!newAccessToken) {
        throw new Error("Refresh response did not contain an access token");
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
 * Add the access token to every normal API request.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  }
);

/*
 * If the access token expires, refresh it and retry
 * the original request once.
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return api(originalRequest);
  }
);

export default api;