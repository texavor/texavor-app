import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";

export interface SavedResult {
  id: string;
  user_id: string;
  blog_id: string;
  result_type: "keyword_research" | "outline_generation" | "topic_generation";
  title: string;
  search_params: any;
  result_data: any;
  tags: string[];
  notes?: string;
  is_favorite: boolean;
  saved_at: string;
}

export interface SavedResultsResponse {
  data: SavedResult[];
  pagination: {
    page: number;
    per_page: number;
    count: number;
    pages: number;
  };
}

export interface SavedResultsFilters {
  type?: string;
  favorites?: boolean;
  tag?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export const useSavedResultsApi = () => {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  // 1. List Saved Results
  const useSavedResults = (filters: SavedResultsFilters = {}) => {
    return useQuery({
      queryKey: ["savedResults", blogs?.id, filters],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filters.type && filters.type !== "all")
          params.append("type", filters.type);
        if (filters.favorites) params.append("favorites", "true");
        if (filters.tag) params.append("tag", filters.tag);
        if (filters.q) params.append("q", filters.q);
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.per_page)
          params.append("per_page", filters.per_page.toString());

        const response = await axiosInstance.get(
          `/api/v1/blogs/${blogs?.id}/saved_results?${params.toString()}`
        );
        return response.data as SavedResultsResponse;
      },
      enabled: !!blogs?.id,
    });
  };

  // 2. Create Saved Result
  const saveResult = useMutation({
    mutationFn: async (data: Partial<SavedResult>) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/saved_results`,
        { saved_result: data }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedResults", blogs?.id] });
    },
    onError: (error) => {
      console.error("Error saving result:", error);
    },
  });

  // 3. Update Saved Result
  const updateResult = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SavedResult>;
    }) => {
      const response = await axiosInstance.patch(
        `/api/v1/blogs/${blogs?.id}/saved_results/${id}`,
        { saved_result: data }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedResults", blogs?.id] });
      toast.success("Result updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating result:", error);
      toast.error("Failed to update result.");
    },
  });

  // 4. Delete Saved Result
  const deleteResult = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(
        `/api/v1/blogs/${blogs?.id}/saved_results/${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedResults", blogs?.id] });
      toast.success("Result deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting result:", error);
      toast.error("Failed to delete result.");
    },
  });

  // 5. Toggle Favorite
  const toggleFavorite = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/saved_results/${id}/toggle_favorite`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedResults", blogs?.id] });
      // toast.success("Favorite status updated!");
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status.");
    },
  });

  return {
    useSavedResults,
    saveResult,
    updateResult,
    deleteResult,
    toggleFavorite,
  };
};
