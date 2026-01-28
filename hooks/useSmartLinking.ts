import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";

export interface LinkSuggestion {
  id: string; // Added ID from backend
  anchor_text: string;
  url: string;
  reason?: string;
  is_applied: boolean; // Added backend status
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
  scanVersion: number,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: ["smartLinks", blogId, articleId, includeExternal, scanVersion],
    queryFn: async () => {
      // Version <= 1: Initial fetch (GET to retrieve stored)
      // Version > 1: Re-scan (POST to generate new)
      const isRescan = scanVersion > 1;

      if (isRescan) {
        const response = await axiosInstance.post(
          `/api/v1/blogs/${blogId}/articles/${articleId}/link_suggestions`,
          {
            force_refresh: true,
            include_external: includeExternal,
          },
        );
        return response?.data as SmartLinksData;
      } else {
        // Initial load - just get what we have
        const response = await axiosInstance.get(
          `/api/v1/blogs/${blogId}/articles/${articleId}/link_suggestions`,
        );
        return response?.data as SmartLinksData;
      }
    },
    enabled: enabled,
    staleTime: Infinity, // Rely on store/manual refetch
    refetchOnWindowFocus: false,
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
      await queryClient.cancelQueries({
        queryKey: ["smartLinks", newLinkStatus.blogId, newLinkStatus.articleId],
      });

      const previousData = queryClient.getQueryData([
        "smartLinks",
        newLinkStatus.blogId,
        newLinkStatus.articleId,
      ]);

      queryClient.setQueriesData(
        {
          queryKey: [
            "smartLinks",
            newLinkStatus.blogId,
            newLinkStatus.articleId,
          ],
        },
        (old: SmartLinksData | undefined) => {
          if (!old || !old.suggestions) return old;

          // Ensure arrays exist before mapping
          let newInternal = old.suggestions.internal || [];
          let newExternal = old.suggestions.external || [];

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

      return { previousData };
    },
    // onError: Removed to avoid double invalidation. onSettled handles it.
    onSettled: (data, error, variables) => {
      if (error) {
        console.error("Mutation failed:", error);
      }
      queryClient.invalidateQueries({
        queryKey: ["smartLinks", variables.blogId, variables.articleId],
      });
    },
  });
};
