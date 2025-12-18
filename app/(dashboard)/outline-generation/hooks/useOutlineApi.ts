import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

export interface OutlineSection {
  heading: string;
  key_points: string[];
}

export interface OutlineData {
  id?: string; // For saved outlines
  title: string;
  meta_description: string;
  introduction?: string;
  sections: OutlineSection[];
  conclusion?: string;
  estimated_word_count?: number;
  target_keywords?: string[];
  tone?: string;
  target_audience?: string;
  created_at?: string;
  topic: string;
}

export interface GenerateOutlineRequest {
  topic: string;
  tone?: string;
  target_audience?: string;
}

export const useOutlineApi = () => {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  // 1. Generate Outline
  const generateOutline = useMutation({
    mutationFn: async (data: GenerateOutlineRequest) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/outline_generation`,
        data
      );
      return response.data.data as OutlineData;
    },
    onSuccess: () => {
      // Invalidate recent searches to show the new one
      queryClient.invalidateQueries({
        queryKey: ["recentSearches", blogs?.id, "outline_generation"],
      });
    },
    onError: (error) => {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate outline. Please try again.");
    },
  });

  // 3. List Saved Outlines
  const savedOutlines = useQuery({
    queryKey: ["savedOutlines", blogs?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs?.id}/outlines`
      );
      return response.data.data as OutlineData[];
    },
    enabled: !!blogs?.id,
  });

  // 4. Create Saved Outline
  const saveOutline = useMutation({
    mutationFn: async (outline: OutlineData) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/outlines`,
        { outline }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedOutlines", blogs?.id] });
      toast.success("Outline saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving outline:", error);
      toast.error("Failed to save outline.");
    },
  });

  // 5. Update Saved Outline
  const updateOutline = useMutation({
    mutationFn: async ({
      id,
      outline,
    }: {
      id: string;
      outline: OutlineData;
    }) => {
      const response = await axiosInstance.put(
        `/api/v1/blogs/${blogs?.id}/outlines/${id}`,
        { outline }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedOutlines", blogs?.id] });
      toast.success("Outline updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating outline:", error);
      toast.error("Failed to update outline.");
    },
  });

  // 6. Delete Saved Outline
  const deleteOutline = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/api/v1/blogs/${blogs?.id}/outlines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedOutlines", blogs?.id] });
      toast.success("Outline deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting outline:", error);
      toast.error("Failed to delete outline.");
    },
  });

  return {
    generateOutline,
    savedOutlines,
    saveOutline,
    updateOutline,
    deleteOutline,
  };
};
