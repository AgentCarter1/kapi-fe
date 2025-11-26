import axios from "axios";
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, LoginResponse } from "../types";
import { getWorkspaces, setDefaultWorkspace } from "./endpoints/workspaces";

/**
 * Axios instance with base configuration
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3005/v1.0",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request interceptor - Add auth token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip adding access token if Authorization header is already set (e.g., refresh token endpoint)
    if (config.headers?.Authorization) {
      return config;
    }

    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Global error handling and token refresh
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Backend response structure: { success, customCode, message, data }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response) {
      const { status, data } = error.response;
      const customCode = (data as ApiResponse)?.customCode;

      // Handle 401104 - Account Not Verified (redirect to verify page with new token)
      if (status === 401 && customCode === 401104) {
        const errorData = (data as any)?.errorData;
        const verifyAccountToken = errorData?.verifyAccountToken;

        if (verifyAccountToken) {
          // Store token and redirect to verify page
          localStorage.setItem("verifyToken", verifyAccountToken);
          window.location.href = `/auth/verify?token=${verifyAccountToken}`;
        }

        return Promise.reject(error);
      }

      // Handle 401010 - Access Token Expired (auto-refresh)
      if (status === 401 && customCode === 401010) {
        const refreshTokenValue = localStorage.getItem("refreshToken");

        if (!refreshTokenValue) {
          // No refresh token - redirect to login
          localStorage.removeItem("accessToken");
          if (!window.location.pathname.includes("/auth")) {
            window.location.href = "/auth/login";
          }
          return Promise.reject(error);
        }

        if (!originalRequest._retry) {
          if (isRefreshing) {
            // Another request is already refreshing - queue this request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Call refresh token endpoint
            const response = await api.post<ApiResponse<LoginResponse>>(
              "/web/auth/refresh-token",
              {},
              {
                headers: {
                  Authorization: `Bearer ${refreshTokenValue}`,
                },
              }
            );

            const newTokens = response.data.data!;

            // Save new tokens to localStorage
            localStorage.setItem("accessToken", newTokens.accessToken);
            localStorage.setItem("refreshToken", newTokens.refreshToken);

            // Dispatch custom event to update Redux store
            // Components listening to this event will update Redux store
            window.dispatchEvent(
              new CustomEvent("tokensRefreshed", {
                detail: {
                  accessToken: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken,
                },
              })
            );

            // Update default authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }

            // Process queued requests
            processQueue(null, newTokens.accessToken);
            isRefreshing = false;

            // Retry original request with new token
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh token failed - logout user
            processQueue(refreshError as Error, null);
            isRefreshing = false;

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            if (!window.location.pathname.includes("/auth")) {
              window.location.href = "/auth/login";
            }

            return Promise.reject(refreshError);
          }
        }
      }

      // Handle other 401 Unauthorized - redirect to login
      if (status === 401 && customCode !== 401010) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Only redirect if not already on auth pages
        if (!window.location.pathname.includes("/auth")) {
          window.location.href = "/auth/login";
        }
      }

      // Handle 403 Forbidden - Workspace Account Passive (4304)
      if (status === 403 && customCode === 4304) {
        // User is passive in current workspace - redirect to default workspace
        console.warn(
          "Workspace access denied: Account is passive in this workspace."
        );

        // Check if this is already a workspace list request to avoid infinite loop
        if (originalRequest.url?.includes("/account/workspaces")) {
          // If workspace list also fails, just redirect to dashboard
          if (!window.location.pathname.includes("/auth")) {
            window.location.href = "/dashboard";
          }
          return Promise.reject(error);
        }

        // Get current workspace ID from request header
        const currentWorkspaceId = originalRequest.headers?.["workspace-id"] as
          | string
          | undefined;

        // Fetch workspace list and find the correct workspace to redirect to
        try {
          const workspaces = await getWorkspaces();

          // Step 1: Check if default workspace is ACTIVE
          const defaultWorkspace = workspaces.find((w) => w.isDefault);

          // Step 2: Check if current workspace is the default workspace
          const isCurrentWorkspaceDefault =
            currentWorkspaceId &&
            defaultWorkspace?.workspaceId === currentWorkspaceId;

          if (defaultWorkspace && defaultWorkspace.status === "ACTIVE") {
            // Default workspace is ACTIVE - redirect to it (don't change default)
            window.dispatchEvent(
              new CustomEvent("redirectToDefaultWorkspace", {
                detail: { defaultWorkspaceId: defaultWorkspace.workspaceId },
              })
            );

            localStorage.setItem(
              "currentWorkspaceId",
              defaultWorkspace.workspaceId
            );

            if (!window.location.pathname.includes("/auth")) {
              window.location.href = "/dashboard";
            }
          } else if (
            defaultWorkspace &&
            defaultWorkspace.status === "PASSIVE" &&
            isCurrentWorkspaceDefault
          ) {
            // Step 3: Current workspace IS the default workspace AND it's PASSIVE
            // Find primaryOwner's first ACTIVE workspace and set it as default
            const primaryOwnerActiveWorkspace = workspaces.find(
              (w) => w.status === "ACTIVE" && w.accountType === "primaryOwner"
            );

            if (primaryOwnerActiveWorkspace) {
              // Set primaryOwner's first ACTIVE workspace as default in backend
              try {
                await setDefaultWorkspace(
                  primaryOwnerActiveWorkspace.workspaceId
                );
              } catch (setDefaultError) {
                console.warn(
                  "Failed to set default workspace:",
                  setDefaultError
                );
                // Continue anyway - we'll still redirect to the workspace
              }

              // Dispatch an event to update the current workspace in Redux
              window.dispatchEvent(
                new CustomEvent("redirectToDefaultWorkspace", {
                  detail: {
                    defaultWorkspaceId: primaryOwnerActiveWorkspace.workspaceId,
                  },
                })
              );

              // Update current workspace in localStorage
              localStorage.setItem(
                "currentWorkspaceId",
                primaryOwnerActiveWorkspace.workspaceId
              );

              // Redirect to dashboard
              if (!window.location.pathname.includes("/auth")) {
                window.location.href = "/dashboard";
              }
            } else {
              // No primaryOwner ACTIVE workspace - find any ACTIVE workspace
              const anyActiveWorkspace = workspaces.find(
                (w) => w.status === "ACTIVE"
              );

              if (anyActiveWorkspace) {
                // Set this workspace as default in backend
                try {
                  await setDefaultWorkspace(anyActiveWorkspace.workspaceId);
                } catch (setDefaultError) {
                  console.warn(
                    "Failed to set default workspace:",
                    setDefaultError
                  );
                }

                window.dispatchEvent(
                  new CustomEvent("redirectToDefaultWorkspace", {
                    detail: {
                      defaultWorkspaceId: anyActiveWorkspace.workspaceId,
                    },
                  })
                );

                localStorage.setItem(
                  "currentWorkspaceId",
                  anyActiveWorkspace.workspaceId
                );

                if (!window.location.pathname.includes("/auth")) {
                  window.location.href = "/dashboard";
                }
              } else {
                // No active workspace found - redirect to workspace management
                console.warn(
                  "No active workspace found for passive workspace redirect"
                );
                if (!window.location.pathname.includes("/auth")) {
                  window.location.href = "/workspace/management";
                }
              }
            }
          } else if (
            defaultWorkspace &&
            defaultWorkspace.status === "PASSIVE" &&
            !isCurrentWorkspaceDefault
          ) {
            // Step 4: Current workspace is NOT the default workspace, but default is PASSIVE
            // This shouldn't happen normally, but if it does, just redirect to default (don't change default)
            // Actually, we should find primaryOwner's workspace since default is passive
            const primaryOwnerActiveWorkspace = workspaces.find(
              (w) => w.status === "ACTIVE" && w.accountType === "primaryOwner"
            );

            if (primaryOwnerActiveWorkspace) {
              window.dispatchEvent(
                new CustomEvent("redirectToDefaultWorkspace", {
                  detail: {
                    defaultWorkspaceId: primaryOwnerActiveWorkspace.workspaceId,
                  },
                })
              );

              localStorage.setItem(
                "currentWorkspaceId",
                primaryOwnerActiveWorkspace.workspaceId
              );

              if (!window.location.pathname.includes("/auth")) {
                window.location.href = "/dashboard";
              }
            } else {
              const anyActiveWorkspace = workspaces.find(
                (w) => w.status === "ACTIVE"
              );

              if (anyActiveWorkspace) {
                window.dispatchEvent(
                  new CustomEvent("redirectToDefaultWorkspace", {
                    detail: {
                      defaultWorkspaceId: anyActiveWorkspace.workspaceId,
                    },
                  })
                );

                localStorage.setItem(
                  "currentWorkspaceId",
                  anyActiveWorkspace.workspaceId
                );

                if (!window.location.pathname.includes("/auth")) {
                  window.location.href = "/dashboard";
                }
              } else {
                console.warn(
                  "No active workspace found for passive workspace redirect"
                );
                if (!window.location.pathname.includes("/auth")) {
                  window.location.href = "/workspace/management";
                }
              }
            }
          } else {
            // No default workspace - find primaryOwner's first ACTIVE workspace
            const primaryOwnerActiveWorkspace = workspaces.find(
              (w) => w.status === "ACTIVE" && w.accountType === "primaryOwner"
            );

            if (primaryOwnerActiveWorkspace) {
              window.dispatchEvent(
                new CustomEvent("redirectToDefaultWorkspace", {
                  detail: {
                    defaultWorkspaceId: primaryOwnerActiveWorkspace.workspaceId,
                  },
                })
              );

              localStorage.setItem(
                "currentWorkspaceId",
                primaryOwnerActiveWorkspace.workspaceId
              );

              if (!window.location.pathname.includes("/auth")) {
                window.location.href = "/dashboard";
              }
            } else {
              // No primaryOwner ACTIVE workspace - find any ACTIVE workspace
              const anyActiveWorkspace = workspaces.find(
                (w) => w.status === "ACTIVE"
              );

              if (anyActiveWorkspace) {
                window.dispatchEvent(
                  new CustomEvent("redirectToDefaultWorkspace", {
                    detail: {
                      defaultWorkspaceId: anyActiveWorkspace.workspaceId,
                    },
                  })
                );

                localStorage.setItem(
                  "currentWorkspaceId",
                  anyActiveWorkspace.workspaceId
                );

                if (!window.location.pathname.includes("/auth")) {
                  window.location.href = "/dashboard";
                }
              } else {
                // No active workspace found
                console.warn(
                  "No active workspace found for passive workspace redirect"
                );
                if (!window.location.pathname.includes("/auth")) {
                  window.location.href = "/workspace/management";
                }
              }
            }
          }
        } catch (workspaceError) {
          console.error(
            "Failed to fetch workspaces for passive workspace redirect:",
            workspaceError
          );
          // Fallback: just redirect to dashboard
          if (!window.location.pathname.includes("/auth")) {
            window.location.href = "/dashboard";
          }
        }

        return Promise.reject(error);
      }

      // Handle other 403 Forbidden
      if (status === 403) {
        console.error("Access forbidden");
      }

      // Handle 500 Internal Server Error
      if (status === 500) {
        console.error("Server error occurred");
      }
    } else if (error.request) {
      // Network error - no response received
      console.error("Network error - no response received");
    }

    return Promise.reject(error);
  }
);
