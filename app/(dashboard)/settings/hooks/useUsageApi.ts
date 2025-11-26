import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { Usage } from "../types";

// Get usage statistics
export const useGetUsage = () => {
  return useQuery({
    queryKey: ["usage"],
    queryFn: async (): Promise<Usage> => {
      const response = await axiosInstance.get("/api/v1/usage");
      return response.data;
    },
  });
};
