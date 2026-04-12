import { toast } from "sonner";
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useStore } from "@/store";

let isRefreshing = false;
const failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue.length = 0;
};

function getLoginRedirectUrl(): string {
  if (typeof window === "undefined") return "/login";
  const returnUrl = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  return `/login?returnUrl=${returnUrl}`;
}

const TOKEN_EXPIRED_STATUSES = [401, 403, 419, 498];

async function callRefresh(refreshTokenValue: string): Promise<string | null> {
  const url = `/api/proxy?${new URLSearchParams({
    service: "base",
    endpoint: "/token/refresh/",
  }).toString()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshTokenValue }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access?: string };
  return data.access ?? null;
}

axios.defaults.baseURL = "/api/proxy";

axios.interceptors.request.use(
  async (config) => {
    const accessToken = useStore.getState().access ?? null;

    // If it's a relative URL and not already hitting the proxy,
    // we need to make sure it's formatted as a proxy request.
    // However, if we set baseURL to /api/proxy, axios will prepend it.
    // We just need to ensure the query params are set correctly.

    if (
      config.url &&
      !config.url.startsWith("http") &&
      !config.url.includes("service=")
    ) {
      const endpoint = config.url.startsWith("/")
        ? config.url
        : `/${config.url}`;
      config.url = ""; // We'll put everything in params
      config.params = {
        ...config.params,
        service: "base",
        endpoint: endpoint,
      };
    }

    const endpointParam =
      (config.params as { endpoint?: string } | undefined)?.endpoint ?? "";
    const skipBearer =
      endpointParam.includes("/auth/login/") ||
      endpointParam.endsWith("/auth/login");

    // Never send a stale access token on login — some APIs reject it.
    if (skipBearer && config.headers) {
      delete config.headers.Authorization;
    } else if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

axios.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: unknown) => {
    const axiosError = error as AxiosError;
    const originalRequest = axiosError?.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    const isRefreshEndpoint =
      originalRequest?.url?.includes("auth/refresh") ||
      originalRequest?.url?.includes("auth/logout");

    const isTokenExpired =
      status != null && TOKEN_EXPIRED_STATUSES.includes(status);

    if (
      !originalRequest ||
      !isTokenExpired ||
      originalRequest._retry ||
      isRefreshEndpoint
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest?.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axios(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshTokenValue = useStore.getState().refresh ?? null;

    if (!refreshTokenValue) {
      useStore.getState().resetAuth();
      processQueue(error, null);
      isRefreshing = false;

      if (typeof window !== "undefined") {
        toast.error("Session expired", {
          description: "Please sign in again.",
        });
        window.location.href = getLoginRedirectUrl();
      }
      return Promise.reject(error);
    }

    try {
      const access = await callRefresh(refreshTokenValue);

      if (access) {
        useStore.getState().setToken(access, refreshTokenValue);
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        processQueue(null, access);
        isRefreshing = false;
        return axios(originalRequest);
      }

      throw new Error("No access token in refresh response");
    } catch (refreshError) {
      useStore.getState().resetAuth();
      processQueue(refreshError, null);
      isRefreshing = false;

      if (typeof window !== "undefined") {
        toast.error("Session expired", {
          description: "Please sign in again.",
        });
        window.location.href = getLoginRedirectUrl();
      }
      return Promise.reject(refreshError);
    }
  },
);

export default axios;
