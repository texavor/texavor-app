"use client";

import { axiosInstance } from "@/lib/axiosInstace";

export interface SavedResult {
  id: string;
  user_id: string;
  blog_id: string;
  result_type: "keyword_research" | "outline_generation" | "topic_generation";
  title: string;
  search_params: Record<string, any>;
  result_data: Record<string, any>;
  tags?: string[];
  notes?: string;
  is_favorite: boolean;
  saved_at: string;
}

export interface CreateSavedResultRequest {
  result_type: "keyword_research" | "outline_generation" | "topic_generation";
  title: string;
  search_params: Record<string, any>;
  result_data: Record<string, any>;
  tags?: string[];
  notes?: string;
  is_favorite?: boolean;
}

export interface UpdateSavedResultRequest {
  title?: string;
  notes?: string;
  tags?: string[];
  is_favorite?: boolean;
}

export interface ListSavedResultsParams {
  type?: "keyword_research" | "outline_generation" | "topic_generation";
  favorites?: boolean;
  tag?: string;
  q?: string;
  page?: number;
  per_page?: number;
}

export const savedResultsService = {
  // List saved results
  list: async (
    blogId: string,
    params?: ListSavedResultsParams
  ): Promise<{ data: SavedResult[]; meta: any }> => {
    const response = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/saved_results`,
      { params }
    );
    return response.data;
  },

  // Get single saved result
  get: async (blogId: string, id: string): Promise<SavedResult> => {
    const response = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/saved_results/${id}`
    );
    return response.data.data;
  },

  // Create saved result
  create: async (
    blogId: string,
    data: CreateSavedResultRequest
  ): Promise<SavedResult> => {
    const response = await axiosInstance.post(
      `/api/v1/blogs/${blogId}/saved_results`,
      { saved_result: data }
    );
    return response.data.data;
  },

  // Update saved result
  update: async (
    blogId: string,
    id: string,
    data: UpdateSavedResultRequest
  ): Promise<SavedResult> => {
    const response = await axiosInstance.patch(
      `/api/v1/blogs/${blogId}/saved_results/${id}`,
      { saved_result: data }
    );
    return response.data.data;
  },

  // Delete saved result
  delete: async (blogId: string, id: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/blogs/${blogId}/saved_results/${id}`);
  },

  // Toggle favorite
  toggleFavorite: async (blogId: string, id: string): Promise<SavedResult> => {
    const response = await axiosInstance.post(
      `/api/v1/blogs/${blogId}/saved_results/${id}/toggle_favorite`
    );
    return response.data.data;
  },

  // Get statistics
  stats: async (blogId: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/api/v1/blogs/${blogId}/saved_results/stats`
    );
    return response.data.data;
  },
};
