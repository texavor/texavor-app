import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { Blog } from "../types";

// Get all blogs
export const useGetBlogs = () => {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async (): Promise<Blog[]> => {
      const response = await axiosInstance.get("/api/v1/blogs");
      return response.data;
    },
  });
};

// Get specific blog
export const useGetBlog = (id: string | null) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async (): Promise<Blog> => {
      const response = await axiosInstance.get(`/api/v1/blogs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Update blog
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Blog> }) => {
      const response = await axiosInstance.put(`/api/v1/blogs/${id}`, {
        blog: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", data.id] });
      toast.success("Blog updated successfully");
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors || ["Failed to update blog"];
      errors.forEach((err: string) => toast.error(err));
    },
  });
};

// Create blog
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Blog>) => {
      const response = await axiosInstance.post("/api/v1/blogs", {
        blog: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success(data.message || "Blog created successfully");
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors || ["Failed to create blog"];
      errors.forEach((err: string) => toast.error(err));
    },
  });
};
