import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";

export interface Platform {
  id: string;
  name: string;
  type: "rss" | "api" | "oauth";
  icon: string;
  logo_url: string;
  description?: string;
  is_connected?: boolean;
  integration_id?: string;
  supports_authors?: boolean;
  is_ready_for_authors?: boolean;
  settings?: Record<string, any>;
  platform?: string;
}

export interface ConnectRequest {
  platform: string;
  credentials: Record<string, any>;
  settings?: Record<string, any>;
}

export const useOnboardingApi = () => {
  // 1. List Supported Platforms
  const getPlatforms = useQuery({
    queryKey: ["onboarding", "platforms"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/v1/onboarding/integrations/platforms"
      );
      return response.data.platforms as Platform[];
    },
  });

  // 2. Connect a Platform
  const connectPlatform = useMutation({
    mutationFn: async (data: ConnectRequest) => {
      const response = await axiosInstance.post(
        "/api/v1/onboarding/integrations/connect",
        data
      );
      return response.data;
    },
  });

  // 3. Import Articles
  const importArticles = useMutation({
    mutationFn: async (integrationId: string | number) => {
      const response = await axiosInstance.post(
        "/api/v1/onboarding/integrations/import",
        { integration_id: integrationId }
      );
      return response.data;
    },
  });

  return {
    getPlatforms,
    connectPlatform,
    importArticles,
  };
};
