import { axiosInstance } from "@/lib/axiosInstace";

export interface ImageUploadResponse {
  id: string;
  url: string;
}

/**
 * Upload an image to the dedicated image upload endpoint
 * @param file - The image file to upload
 * @param altText - Optional alt text for the image
 * @returns The permanent URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  altText?: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("image[file]", file);

  if (altText) {
    formData.append("image[alt_text]", altText);
  }

  try {
    const response = await axiosInstance.post<ImageUploadResponse>(
      "/api/v1/images",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error; // Let global error handler or component handle it
  }
};
