import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { Usage } from "../types";

// Get usage statistics
export const useGetUsage = (blogId?: string, options = {}) => {
  return useQuery({
    queryKey: ["usage", blogId],
    queryFn: async (): Promise<Usage> => {
      // Always use the nested route
      const url = `/api/v1/blogs/${blogId}/usage`;

      const response = await axiosInstance.get(url);
      return response.data;
    },
    enabled: !!blogId,
    ...options,
  });
};
