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

export const usePublicationsApi = (blogId: string, articleId: string) => {
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
    enabled: !!blogId && !!articleId,
    refetchInterval: (query) => {
      // Poll every 5 seconds if there are publishing or pending publications
      const hasActivePublications = query.state.data?.some(
        (p: Publication) => p.status === "publishing" || p.status === "pending"
      );
      return hasActivePublications ? 5000 : false;
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
      toast.error(message);
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
  };
};
