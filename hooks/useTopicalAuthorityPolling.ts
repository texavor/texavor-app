import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

export const useTopicalAuthorityPolling = (jobId: number | null) => {
  const { blogs } = useAppStore();

  return useQuery({
    queryKey: ["topical-authority-polling", jobId],
    queryFn: async () => {
      if (!jobId || !blogs?.id) return null;
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/topical_authorities/${jobId}`,
      );
      return response.data;
    },
    enabled: !!jobId && !!blogs?.id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.job_status === "completed" || data?.job_status === "failed") {
        return false;
      }
      return 3000;
    },
  });
};
