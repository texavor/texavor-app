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
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append("support_ticket[subject]", data.subject);
      formData.append("support_ticket[message]", data.message);
      formData.append("support_ticket[priority]", data.priority);
      formData.append("support_ticket[category]", data.category);

      if (data.attachments && data.attachments.length > 0) {
        Array.from(data.attachments).forEach((file: any) => {
          formData.append("support_ticket[attachments][]", file);
        });
      }

      return axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/support_tickets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },
  });
};
