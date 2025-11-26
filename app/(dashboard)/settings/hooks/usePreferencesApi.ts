import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { UserPreferences } from "../types";

// Get user preferences
export const useGetPreferences = () => {
  return useQuery({
    queryKey: ["preferences"],
    queryFn: async (): Promise<UserPreferences> => {
      const response = await axiosInstance.get("/api/v1/preferences");
      return response.data.preferences || {};
    },
  });
};

// Update user preferences (supports deep merge)
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const response = await axiosInstance.put("/api/v1/preferences", {
        preferences,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success(data.message || "Preferences updated successfully");
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors || [
        "Failed to update preferences",
      ];
      errors.forEach((err: string) => toast.error(err));
    },
  });
};
