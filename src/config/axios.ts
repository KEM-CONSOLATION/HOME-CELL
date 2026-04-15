import { toast } from "sonner";
import axios, {
  AxiosError,
  AxiosRequestConfig,
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
  if (typeof window === "undefined") return "/";
  const returnUrl = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  return `/?returnUrl=${returnUrl}`;
}

const TOKEN_EXPIRED_STATUSES = [401, 403, 419, 498];
const inflightGetRequests = new Map<string, Promise<AxiosResponse<unknown>>>();

function stableStringify(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b),
    );
    return `{${entries
      .map(([k, v]) => `${k}:${stableStringify(v)}`)
      .join(",")}}`;
  }
  return String(value);
}

export function dedupedGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  const key = `GET:${url}:${stableStringify(config?.params)}`;
  const existing = inflightGetRequests.get(key);
  if (existing) return existing as Promise<AxiosResponse<T>>;

  const request = axios
    .get<T>(url, config)
    .finally(() => inflightGetRequests.delete(key));
  inflightGetRequests.set(key, request as Promise<AxiosResponse<unknown>>);
  return request;
}

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
    const endpointParam =
      (originalRequest?.params as { endpoint?: string } | undefined)
        ?.endpoint ?? "";
    const isLoginEndpoint =
      endpointParam.includes("/auth/login/") ||
      endpointParam.endsWith("/auth/login");
    const isRefreshEndpoint =
      originalRequest?.url?.includes("auth/refresh") ||
      originalRequest?.url?.includes("auth/logout");

    const isTokenExpired =
      status != null && TOKEN_EXPIRED_STATUSES.includes(status);

    if (
      !originalRequest ||
      isLoginEndpoint ||
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
