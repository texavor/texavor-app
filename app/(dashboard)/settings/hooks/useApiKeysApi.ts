import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { ApiKey, NewApiKey } from "../types";

// Get all API keys
export const useGetApiKeys = () => {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async (): Promise<ApiKey[]> => {
      const response = await axiosInstance.get("/api/v1/api_keys");
      return response.data;
    },
  });
};

// Create API key
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; expires_at?: string }) => {
      const response = await axiosInstance.post("/api/v1/api_keys", {
        api_key: data,
      });
      return response.data as NewApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors || [
        "Failed to create API key",
      ];
      errors.forEach((err: string) => toast.error(err));
    },
  });
};

// Revoke API key
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/api/v1/api_keys/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(data.message || "API key revoked successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to revoke API key";
      toast.error(message);
    },
  });
};
