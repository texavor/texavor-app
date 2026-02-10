import axios from "axios";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";

export const baseURL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000"
    : "https://www.api.texavor.com";

// export const baseURL = "https://www.api.texavor.com";

export const axiosInstance = axios.create({
  baseURL,
  // timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;

    // Handle limit enforcement (403 with upgrade_required flag)
    if (response?.status === 403 && response?.data?.upgrade_required === true) {
      // Import dynamically to avoid circular dependencies
      import("@/lib/upgradePromptState").then(({ triggerUpgradePrompt }) => {
        triggerUpgradePrompt({
          error: response.data.error || "Limit exceeded",
          message: response.data.message || "You've reached your plan limit",
          current_usage: response.data.current_usage || 0,
          limit: response.data.limit || 0,
          suggested_tier: response.data.suggested_tier || "professional",
          upgrade_required: true,
        });
      });
      return Promise.reject(error);
    }

    // Handle credit exhaustion (402 Payment Required)
    if (response?.status === 402) {
      import("@/lib/upgradePromptState").then(({ triggerUpgradePrompt }) => {
        triggerUpgradePrompt({
          error: response.data.error || "Credit exhausted",
          message:
            response.data.message ||
            "You have run out of credits. Please upgrade your plan or top up to continue.",
          current_usage: response.data.available || 0,
          limit: response.data.required || 0,
          suggested_tier: "professional", // Default suggestion
          upgrade_required: true,
        });
      });
      return Promise.reject(error);
    }

    if (
      response &&
      response?.status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login" &&
      response?.config?.method === "get" &&
      !response?.config?.url?.includes("integration")
    ) {
      try {
        await axios.post("/api/logout");
      } catch (error) {
        console.error("Logout failed:", error);
      }

      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else {
      const flattenErrors = (errors: any) => {
        if (!errors) return null;

        if (
          Array.isArray(errors) &&
          errors.every((e) => typeof e === "string")
        ) {
          return errors.join("; ");
        }

        if (typeof errors === "object" && !Array.isArray(errors)) {
          const messages = Object.keys(errors)
            .map((key) => {
              const value = errors[key];
              if (typeof value === "string") {
                return `${key.charAt(0).toUpperCase() + key.slice(1)} ${value}`;
              }
              if (Array.isArray(value)) {
                return `${
                  key.charAt(0).toUpperCase() + key.slice(1)
                } ${value.join(", ")}`;
              }
              return null;
            })
            .filter(Boolean)
            .join("; ");
          return messages || null;
        }
        return null;
      };

      const data = response?.data;
      let message = "Error occurred";

      if (data) {
        const flattened =
          flattenErrors(data.errors) || flattenErrors(data.status?.errors);
        if (flattened) {
          message = flattened;
        } else if (data.error) {
          message = data.error;
        } else if (data.message) {
          message = data.message;
        } else if (data.status?.message) {
          message = data.status.message;
        }
      }

      toast.error(message);
    }
    Sentry.captureException(error);
    return Promise.reject(error);
  },
);
