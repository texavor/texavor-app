import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";

interface Publication {
  id: string;
  article_id: string;
  integration_id: string;
  status: "pending" | "publishing" | "success" | "failed";
  external_url: string | null;
  external_id: string | null;
  error_message: string | null;
  published_at: string | null;
  attempted_at: string | null;
  retry_count: number;
  metadata: Record<string, any>;
  integration: {
    id: string;
    platform: string;
    name: string;
    logo_url?: string;
    settings: Record<string, any>;
  };
}

interface PublicationsResponse {
  publications: Publication[];
}

export const usePublicationsApi = (
  blogId: string,
  articleId: string,
  isEnabled: boolean = true
) => {
  const queryClient = useQueryClient();

  // Fetch publications for an article
  const getPublications = useQuery<Publication[]>({
    queryKey: ["publications", blogId, articleId],
    queryFn: async () => {
      const res = await axiosInstance.get<PublicationsResponse>(
        `/api/v1/blogs/${blogId}/articles/${articleId}/publications`
      );
      return res.data.publications || [];
    },
    enabled: !!blogId && !!articleId && articleId !== "new" && isEnabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: (query) => {
      // Only poll if enabled
      if (!isEnabled) return false;

      const publications = query.state.data as Publication[];
      if (!publications) return false;

      const shouldPoll = publications.some((p) => {
        // Always poll if publishing
        if (p.status === "publishing") return true;

        // Poll if pending AND updated/attempted recently (last 2 minutes)
        // This covers the "retry" scenario where the user just clicked retry
        if (p.status === "pending") {
          const lastActivity = p.attempted_at || p.published_at; // published_at tracks updated_at for pending in some APIs, or check logic
          if (lastActivity) {
            const timeDiff = Date.now() - new Date(lastActivity).getTime();
            return timeDiff < 2 * 60 * 1000; // 2 minutes
          }
          // If no timestamp but pending, it might be brand new.
          // But since user said "only when *I* click retry", implied active action.
          // We'll stick to timestamp check if possible, or maybe allow if NO timestamp (fresh)
          return false;
        }

        return false;
      });

      return shouldPoll ? 5000 : false;
    },
  });

  // Retry failed publication
  const retryMutation = useMutation({
    mutationFn: async (publicationId: string) => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/publications/${publicationId}/retry`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["publications", blogId, articleId],
      });
      toast.success("Publication retry initiated");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Failed to retry publication";
      // toast.error(message);
      console.log(message);
    },
  });

  // Publish article now to all selected integrations
  const publishNowMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/publish`
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["publications", blogId, articleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["article", blogId],
      });
      toast.success("Article publishing started");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Failed to publish article";
      toast.error(message);
    },
  });

  // Unpublish article
  const unpublishMutation = useMutation({
    mutationFn: async (data?: {
      integration_ids?: string[];
      all?: boolean;
    }) => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/unpublish`,
        data || { all: true }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["publications", blogId, articleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["article", blogId],
      });
      toast.success("Article unpublished successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Failed to unpublish article";
      toast.error(message);
    },
  });

  // Update published article
  const updatePublishedMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(
        `/api/v1/blogs/${blogId}/articles/${articleId}/update_published`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["publications", blogId, articleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["article", blogId],
      });
      toast.success("Article updated on platforms");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || "Failed to update published article";
      toast.error(message);
    },
  });

  return {
    publications: getPublications.data || [],
    isLoading: getPublications.isLoading,
    isError: getPublications.isError,
    error: getPublications.error,
    refetch: getPublications.refetch,
    retryPublication: retryMutation.mutate,
    isRetrying: retryMutation.isPending,
    publishNow: publishNowMutation.mutate,
    isPublishing: publishNowMutation.isPending,
    unpublish: unpublishMutation.mutate,
    isUnpublishing: unpublishMutation.isPending,
    updatePublished: updatePublishedMutation.mutate,
    isUpdatingPublished: updatePublishedMutation.isPending,
  };
};
