import { apiClient } from "@/lib/api";
import { 
    GetInstallUrlResponse, 
    GitHubRepo, 
    GitHubOverview, 
    ApiResponse,
    GitHubCommitSummary,
    GitHubCommitDetail,
    DebugGithubCommitResponse
} from "@/types/api-types";

export const getGithubInstallUrl = async (orgId: string): Promise<GetInstallUrlResponse> => {
    const response = await apiClient.get<GetInstallUrlResponse>(`/integrations/github/install/${orgId}`);
    return response.data;
};

// Optional "force" parameter to reconnect with a different GitHub account
export const getGithubOAuthUrl = async (orgId: string, force?: boolean): Promise<GetInstallUrlResponse> => {
    const response = await apiClient.get<GetInstallUrlResponse>(`/integrations/github/oauth/${orgId}`, {
        params: force ? { force: true } : undefined,
    });
    return response.data;
};

export const getGithubRepositories = async (integrationId: string): Promise<GitHubRepo[]> => {
    const response = await apiClient.get<GitHubRepo[]>(`/integrations/github/repo/${integrationId}`);
    return response.data;
};

export const syncGithubRepositories = async (integrationId: string) => {
    const response = await apiClient.post<ApiResponse>(`/integrations/github/sync-repos/${integrationId}`);
    return response.data;
};

export const getGithubOverview = async (integrationId: string): Promise<GitHubOverview> => {
    const response = await apiClient.get<GitHubOverview>(`/integrations/github/overview/${integrationId}`);
    return response.data;
};

export const ingestGithubData = async (integrationId: string, repoId?: string) => {
    const params = repoId ? { repoId } : {};
    const response = await apiClient.post<ApiResponse>(`/integrations/github/ingest/${integrationId}`, null, { params });
    return response.data;
};

export const getGithubCommits = async (integrationId: string): Promise<GitHubCommitSummary[]> => {
    const response = await apiClient.get<GitHubCommitSummary[]>(`/integrations/github/commits/${integrationId}`);
    return response.data;
};

export const getGithubCommitDetails = async (integrationId: string, sha: string): Promise<GitHubCommitDetail> => {
    const response = await apiClient.get<GitHubCommitDetail>(`/integrations/github/commit/details/${integrationId}/${sha}`);
    return response.data;
};

export const debugGithubCommit = async (integrationId: string, sha: string): Promise<DebugGithubCommitResponse> => {
    const response = await apiClient.get<DebugGithubCommitResponse>(`/integrations/github/debug/${integrationId}/${sha}`);
    return response.data;
};

// Auto-connect GitHub integration using installation from another org
export const autoConnectGithubIntegration = async (orgId: string, sourceOrgId: string) => {
    const response = await apiClient.post<ApiResponse>(`/orgs/${orgId}/integrations/github/auto-connect`, {
        sourceOrgId,
    });
    return response.data;
};

// Export types for convenience
export type { GitHubCommitSummary, GitHubCommitDetail, DebugGithubCommitResponse };
