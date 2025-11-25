
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

export const useGetSupportTickets = () => {
  const { blogs } = useAppStore();
  return useQuery({
    queryKey: ["supportTickets", blogs?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/support_tickets`
      );
      return res.data;
    },
    enabled: !!blogs?.id,
  });
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const { blogs } = useAppStore();

  return useMutation({
    mutationFn: (data: {
      subject: string;
      message: string;
      priority: string;
      category: string;
    }) => {
      return axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/support_tickets`,
        { support_ticket: data }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },
  });
};
