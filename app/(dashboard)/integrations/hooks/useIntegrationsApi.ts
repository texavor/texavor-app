import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { Platform } from "@/app/onboarding/hooks/useOnboardingApi";
import { toast } from "sonner";

export interface Integration {
  id: string;
  platform: string; // e.g. "medium", "devto"
  name: string;
  connected_at: string;
  status: "active" | "inactive" | "error";
  settings?: Record<string, any>;
}

export const useIntegrationsApi = () => {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  // 1. List Available Platforms (Reuse onboarding endpoint or dashboard specific?)
  // Assuming we can reuse the onboarding one for the list of supported platforms
  const getPlatforms = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        "/api/v1/onboarding/integrations/platforms"
      );
      return response.data.platforms as Platform[];
    },
  });

  // 2. List Connected Integrations (Actually returns all platforms with connection status)
  const getIntegrations = useQuery({
    queryKey: ["integrations", blogs?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/integrations`
      );
      // The API returns the array under response.data.integrations
      const integrations = response.data.integrations || [];
      return integrations as Platform[];
    },
    enabled: !!blogs?.id,
  });

  // 3. Connect Integration
  const connectIntegration = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/integrations`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", blogs?.id] });
      // toast.success("Integration connected successfully!");
    },
    onError: (error) => {
      console.error("Error connecting integration:", error);
      // toast.error("Failed to connect integration.");
    },
  });

  // 4. Disconnect Integration
  const disconnectIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      await axiosInstance.delete(
        `/api/v1/blogs/${blogs?.id}/integrations/${integrationId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", blogs?.id] });
      toast.success("Integration disconnected.");
    },
    onError: (error) => {
      console.error("Error disconnecting integration:", error);
      toast.error("Failed to disconnect integration.");
    },
  });

  return {
    getPlatforms,
    getIntegrations,
    connectIntegration,
    disconnectIntegration,
  };
};
