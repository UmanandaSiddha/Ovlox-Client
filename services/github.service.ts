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

export type GitHubCommitDetail = {
    commit: {
        sha: string
        message: string
        author?: string
        date?: string
    }
    aiSummary: string
    codeQuality: {
        score: number | null
        summary: string
        issues: {
            type: string
            severity: "low" | "medium" | "high"
            description: string
        }[]
        suggestions: string[]
    }
    security: {
        risk: "none" | "low" | "medium" | "high"
        summary: string
        findings: {
            type: string
            severity: "low" | "medium" | "high"
            file?: string
            description: string
        }[]
        canAutoFix: boolean
    }
    canDebug: boolean
    files: {
        filename: string
        additions: number
        deletions: number
        patch?: string | null
    }[]
}

export type GitHubCommitSummary = {
    sha: string;
    message: string;
    author: string;
    date: string;
    authorAvatar?: string | null;
    authorUsername?: string | null;
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

export type DebugGithubCommitResponse = {
    explanation: string;
    patches: {
        filename: string;
        diff: string;
    }[];
    suggestedCode: string | null;
    risk: "none" | "low" | "medium" | "high";
    confidence: number;
    safeToApply: boolean;
};

export const debugGithubCommit = async (projectId: string, sha: string) => {
    const response = await apiClient.get<DebugGithubCommitResponse>(`/github/debug/c45cbcda-5fbb-4813-9cb3-22e3da4cb2ee/${sha}`);
    return response.data;
};
