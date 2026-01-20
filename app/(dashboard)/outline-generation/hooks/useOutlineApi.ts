import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { savedResultsService } from "@/lib/api/savedResults";

export interface ResearchBrief {
  market_gaps: string[];
  key_statistics: string[];
  common_questions: string[];
  sources: { title: string; url: string; key_takeaway: string }[];
}

export interface OutlineSection {
  heading: string;
  key_points: string[];
  citations?: { title: string; url: string }[];
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
  research_brief?: ResearchBrief;
}

export interface GenerateOutlineRequest {
  topic: string;
  tone?: string;
  target_audience?: string;
  article_id?: string;
  aeo_optimization?: boolean;
  deep_research?: boolean;
}

export const useOutlineApi = () => {
  const { blogs } = useAppStore();
  const queryClient = useQueryClient();

  // 1. Generate Outline
  const generateOutline = useMutation({
    mutationFn: async (data: GenerateOutlineRequest) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/outline_generation`,
        data,
      );
      return {
        ...response.data.data,
        topic: response.data.data.topic || data.topic,
      } as OutlineData;
    },
    onSuccess: () => {
      // Invalidate recent searches to show the new one
      queryClient.invalidateQueries({
        queryKey: ["recentSearches", blogs?.id, "outline_generation"],
      });
    },
    onError: (error) => {
      console.error("Error generating outline:", error);
    },
  });

  // 3. List Saved Outlines (using saved_results API)
  const savedOutlines = useQuery({
    queryKey: ["savedResults", blogs?.id, "outline_generation"],
    queryFn: async () => {
      const response = await savedResultsService.list(blogs?.id || "", {
        type: "outline_generation",
      });
      // Transform saved results to OutlineData format
      return response.data.map((result) => ({
        id: result.id,
        ...result.result_data,
        topic: result.search_params?.topic || "",
        created_at: result.saved_at,
      })) as OutlineData[];
    },
    enabled: !!blogs?.id,
  });

  // 4. Create Saved Outline (using saved_results API)
  const saveOutline = useMutation({
    mutationFn: async (outline: OutlineData) => {
      const response = await savedResultsService.create(blogs?.id || "", {
        result_type: "outline_generation",
        title: outline.title,
        search_params: {
          topic: outline.topic,
          tone: outline.tone,
          target_audience: outline.target_audience,
        },
        result_data: {
          title: outline.title,
          meta_description: outline.meta_description,
          introduction: outline.introduction,
          sections: outline.sections,
          conclusion: outline.conclusion,
          estimated_word_count: outline.estimated_word_count,
          target_keywords: outline.target_keywords,
          tone: outline.tone,
          target_audience: outline.target_audience,
        },
      });
      // Transform back to OutlineData format
      return {
        id: response.id,
        ...response.result_data,
        topic: response.search_params?.topic || "",
        created_at: response.saved_at,
      } as OutlineData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savedResults", blogs?.id, "outline_generation"],
      });
      toast.success("Outline saved successfully!");
    },
    onError: (error) => {
      console.error("Error saving outline:", error);
    },
  });

  // 5. Update Saved Outline (using saved_results API)
  const updateOutline = useMutation({
    mutationFn: async ({
      id,
      outline,
    }: {
      id: string;
      outline: OutlineData;
    }) => {
      // Update the result_data with new outline
      const response = await axiosInstance.patch(
        `/api/v1/blogs/${blogs?.id}/saved_results/${id}`,
        {
          saved_result: {
            title: outline.title,
            result_data: {
              title: outline.title,
              meta_description: outline.meta_description,
              introduction: outline.introduction,
              sections: outline.sections,
              conclusion: outline.conclusion,
              estimated_word_count: outline.estimated_word_count,
              target_keywords: outline.target_keywords,
              tone: outline.tone,
              target_audience: outline.target_audience,
            },
            search_params: {
              topic: outline.topic,
              tone: outline.tone,
              target_audience: outline.target_audience,
            },
          },
        },
      );
      return {
        id: response.data.data.id,
        ...response.data.data.result_data,
        topic: response.data.data.search_params?.topic || "",
        created_at: response.data.data.saved_at,
      } as OutlineData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savedResults", blogs?.id, "outline_generation"],
      });
      toast.success("Outline updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating outline:", error);
    },
  });

  // 6. Delete Saved Outline (using saved_results API)
  const deleteOutline = useMutation({
    mutationFn: async (id: string) => {
      await savedResultsService.delete(blogs?.id || "", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savedResults", blogs?.id, "outline_generation"],
      });
      toast.success("Outline deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting outline:", error);
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
