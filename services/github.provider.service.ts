import { apiClient } from "@/lib/api";

export const githubInstall = async (id: string) => {
    const response = await apiClient.get(`/github/install/${id}`);
    return response.data;
};