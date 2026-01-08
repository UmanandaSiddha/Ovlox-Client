import { apiClient } from "@/lib/api";

export type GitHubOverview = {
    repo: {
        name: string;
        description: string | null;
        defaultBranch: string;
        stars: number;
        forks: number;
    };
    activity: {
        commits: number;
        pullRequests: number;
        issues: number;
    };
    status: string;
};

export type GitHubCommitSummary = {
    sha: string;
    message: string;
    author: string;
    date: string;
    filesChanged: number;
    additions: number;
    deletions: number;
};

export type GitHubCommitFile = {
    filename: string;
    additions: number;
    deletions: number;
    patch: string;
};

export type GitHubCommitDetail = {
    commit: {
        sha: string;
        message: string;
        author: string;
        date: string;
    };
    aiSummary: string;
    codeQuality: string;
    security: {
        risk: string;
        notes: string[];
    };
    files: GitHubCommitFile[];
};

export const getGithubOverview = async (projectId: string) => {
    const response = await apiClient.get<GitHubOverview>(`/github/overview/c45cbcda-5fbb-4813-9cb3-22e3da4cb2ee`);
    return response.data;
};

export const getGithubCommits = async (projectId: string) => {
    const response = await apiClient.get<{ commits: GitHubCommitSummary[] }>(`/github/commits/c45cbcda-5fbb-4813-9cb3-22e3da4cb2ee`);
    return response.data.commits;
};

export const getGithubCommitDetails = async (projectId: string, sha: string) => {
    const response = await apiClient.get<GitHubCommitDetail>(`/github/commit/details/c45cbcda-5fbb-4813-9cb3-22e3da4cb2ee/${sha}`);
    return response.data;
};
