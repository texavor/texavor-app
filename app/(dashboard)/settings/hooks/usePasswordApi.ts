import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";

interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Update user password
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const response = await axiosInstance.put("/api/v1/password/change", {
        current_password: data.current_password,
        user: {
          password: data.password,
          password_confirmation: data.password_confirmation,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully");
    },
    onError: (error: any) => {
      console.log(error);
    },
  });
};
