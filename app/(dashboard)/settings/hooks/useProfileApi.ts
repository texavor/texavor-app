import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { UserProfile } from "../types";

// Get user profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const response = await axiosInstance.get("/api/v1/profile");
      return response.data;
    },
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await axiosInstance.put("/api/v1/profile", {
        user: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(data.message || "Profile updated successfully");
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors || [
        "Failed to update profile",
      ];
      errors.forEach((err: string) => toast.error(err));
    },
  });
};
