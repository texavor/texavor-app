import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";

interface WaitlistPayload {
  email: string;
  country: string;
}

const joinWaitlistAPI = async (payload: WaitlistPayload) => {
  const { data } = await axiosInstance.post("/waitlists", payload);
  return data;
};

export const useJoinWaitlist = () => {
  return useMutation({
    mutationFn: joinWaitlistAPI,
    onSuccess: () => {
      toast.success("You have been added to the waitlist!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "An error occurred.");
    },
  });
};
