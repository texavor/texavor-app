import { axiosInstance } from "@/lib/axiosInstace";

export interface Author {
  id: string;
  blog_id: string;
  user_id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: "owner" | "imported" | "writer";
  active: boolean;
  external_id?: string;
  external_platform?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAuthorPayload {
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    role?: string;
    active?: boolean;
  };
}

export interface ImportAuthorsResponse {
  success: boolean;
  message: string;
  imported_count: number;
  total_found: number;
  errors: string[];
}

export async function fetchAuthors(blogId: string): Promise<Author[]> {
  const response = await axiosInstance.get(`/api/v1/blogs/${blogId}/authors`);
  return response.data;
}

export async function createAuthor(
  blogId: string,
  authorData: CreateAuthorPayload
): Promise<Author> {
  const response = await axiosInstance.post(
    `/api/v1/blogs/${blogId}/authors`,
    authorData
  );
  return response.data;
}

export async function updateAuthor(
  blogId: string,
  authorId: string,
  updates: Partial<CreateAuthorPayload["author"]>
): Promise<Author> {
  const response = await axiosInstance.patch(
    `/api/v1/blogs/${blogId}/authors/${authorId}`,
    { author: updates }
  );
  return response.data;
}

export async function deleteAuthor(
  blogId: string,
  authorId: string
): Promise<void> {
  await axiosInstance.delete(`/api/v1/blogs/${blogId}/authors/${authorId}`);
}

export async function importAuthors(
  blogId: string,
  integrationId: string
): Promise<ImportAuthorsResponse> {
  const response = await axiosInstance.post(
    `/api/v1/blogs/${blogId}/authors/import/${integrationId}`
  );
  return response.data;
}
