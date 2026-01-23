import { axiosInstance } from "@/lib/axiosInstace";

export interface DiscoveredOption {
  label: string;
  value: string;
  [key: string]: any;
}

export interface DiscoveryResponse {
  success: boolean;
  discovered: {
    organizations?: DiscoveredOption[];
    series?: any[];
    publications?: DiscoveredOption[];
    collections?: DiscoveredOption[];
    [key: string]: any;
  };
  error?: string;
}

export async function discoverIntegrationSettings(
  blogId: string,
  integrationId: string | number,
): Promise<DiscoveryResponse> {
  const response = await axiosInstance.get(
    `/api/v1/blogs/${blogId}/integrations/${integrationId}/discover`,
  );
  return response.data;
}
