import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { CreditResponse } from "../types";

// Get credit balance and potential usage
export const useGetCredits = (blogId?: string, options = {}) => {
  return useQuery({
    queryKey: ["credits", blogId],
    queryFn: async (): Promise<CreditResponse> => {
      // Always use the nested route
      const url = `/api/v1/blogs/${blogId}/credits`;

      const response = await axiosInstance.get(url);
      return response.data;
    },
    enabled: !!blogId,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30s
    ...options,
  });
};
