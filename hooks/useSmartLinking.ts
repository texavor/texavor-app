import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";

export interface LinkSuggestion {
  id: string; // Added ID from backend
  anchor_text: string;
  url: string;
  reason?: string;
  simulated_click_text?: string; // New field from backend
  is_applied: boolean; // Added backend status
  valid?: boolean; // New field from backend
  position: number; // Character position in article where anchor text starts
  exact_match: string; // The actual text found in article (may differ in case from anchor_text)
  match_type: "exact" | "case_insensitive"; // Type of match
}

export interface ExistingLink {
  anchor_text: string;
  url: string;
  type: "internal" | "external";
}

export interface SmartLinksData {
  suggestions: {
    internal: LinkSuggestion[];
    external: LinkSuggestion[];
    usage?: {
      azure_input_token: number;
      azure_output_token: number;
    };
    existing: ExistingLink[];
  };
  cached: boolean;
}

export const useSmartLinking = () => {
  // Legacy mutation hook if needed, but we are moving to query + update mutation
  const getSmartLinks = useMutation({
    mutationFn: async ({
      blogId,
      articleId,
      forceRefresh = false,
      includeExternal = false,
    }: {
      blogId: string;
      articleId: string;
      forceRefresh?: boolean;
      includeExternal?: boolean;
    }) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/link_suggestions`,
        {
          force_refresh: forceRefresh,
          include_external: includeExternal,
        },
      );
      return response?.data as SmartLinksData;
    },
  });

  return {
    getSmartLinks,
  };
};

export const useSmartLinksQuery = (
  blogId: string,
  articleId: string,
  includeExternal: boolean,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["smartLinks", blogId, articleId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogId}/articles/${articleId}/link_suggestions`,
        {
          params: { include_external: includeExternal },
        },
      );
      return response?.data as SmartLinksData;
    },
    enabled: enabled && !!blogId && !!articleId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });
};

export const useRegenerateSmartLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blogId,
      articleId,
      includeExternal = false,
    }: {
      blogId: string;
      articleId: string;
      includeExternal?: boolean;
    }) => {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/link_suggestions`,
        {
          force_refresh: true,
          include_external: includeExternal,
        },
      );
      return response?.data as SmartLinksData;
    },
    onSuccess: (data, variables) => {
      // Update the query cache with the newly generated suggestions
      queryClient.setQueryData(
        [
          "smartLinks",
          variables.blogId,
          variables.articleId,
          variables.includeExternal,
        ],
        data,
      );
      // Also invalidate to be safe
      queryClient.invalidateQueries({
        queryKey: ["smartLinks", variables.blogId, variables.articleId],
      });
    },
  });
};

export const useUpdateLinkStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blogId,
      articleId,
      suggestionId,
      isApplied,
      applyAll,
    }: {
      blogId: string;
      articleId: string;
      suggestionId?: string;
      isApplied?: boolean;
      applyAll?: boolean;
    }) => {
      let payload: any = {};

      if (applyAll) {
        payload = { apply_all: true };
      } else {
        payload = {
          id: suggestionId,
          is_applied: isApplied,
        };
      }

      console.log("Sending PATCH payload:", payload);

      const response = await axiosInstance.patch(
        `/api/v1/blogs/${blogId}/articles/${articleId}/link_suggestions`,
        payload,
      );
      return response?.data;
    },
    onMutate: async (newLinkStatus) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["smartLinks", newLinkStatus.blogId, newLinkStatus.articleId],
      });

      // Snapshot the previous values for all matching queries
      const queriesData = queryClient.getQueriesData<SmartLinksData>({
        queryKey: ["smartLinks", newLinkStatus.blogId, newLinkStatus.articleId],
      });

      // Optimistically update all matching queries
      queryClient.setQueriesData<SmartLinksData>(
        {
          queryKey: [
            "smartLinks",
            newLinkStatus.blogId,
            newLinkStatus.articleId,
          ],
        },
        (old) => {
          if (!old || !old.suggestions) return old;

          let newInternal = [...(old.suggestions.internal || [])];
          let newExternal = [...(old.suggestions.external || [])];

          if (newLinkStatus.applyAll) {
            newInternal = newInternal.map((link) => ({
              ...link,
              is_applied: true,
            }));
            newExternal = newExternal.map((link) => ({
              ...link,
              is_applied: true,
            }));
          } else if (newLinkStatus.suggestionId) {
            newInternal = newInternal.map((link) =>
              link.id === newLinkStatus.suggestionId
                ? { ...link, is_applied: newLinkStatus.isApplied! }
                : link,
            );
            newExternal = newExternal.map((link) =>
              link.id === newLinkStatus.suggestionId
                ? { ...link, is_applied: newLinkStatus.isApplied! }
                : link,
            );
          }

          return {
            ...old,
            suggestions: {
              ...old.suggestions,
              internal: newInternal,
              external: newExternal,
            },
          };
        },
      );

      return { queriesData };
    },
    onSuccess: (data, variables) => {
      // If the backend returns updated suggestions, sync them
      if (data?.suggestions) {
        queryClient.setQueriesData<SmartLinksData>(
          {
            queryKey: ["smartLinks", variables.blogId, variables.articleId],
          },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              suggestions: data.suggestions,
            };
          },
        );
      }
    },
    onSettled: (data, error, variables) => {
      if (error) {
        console.error("Mutation failed:", error);
      }
      // Re-invalidate to ensure we are eventually consistent
      queryClient.invalidateQueries({
        queryKey: ["smartLinks", variables.blogId, variables.articleId],
      });
    },
  });
};
