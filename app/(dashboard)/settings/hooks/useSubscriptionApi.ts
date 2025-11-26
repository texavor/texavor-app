import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { Subscription } from "../types";

// Get subscription information
export const useGetSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async (): Promise<Subscription> => {
      const response = await axiosInstance.get("/api/v1/subscription");
      return response.data;
    },
  });
};
