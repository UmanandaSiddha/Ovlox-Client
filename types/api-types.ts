import { IUser, IOrganization, IProject, IIntegration, IOrganizationMember, IInvite, IConversation, IChatMessage, IJob } from "./prisma-generated";
import { ExternalProvider, PredefinedOrgRole, IntegrationStatus, InviteStatus, ConversationType } from "./enum";

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
    totalCount?: number;
    totalPages?: number;
}

// API Error response
export interface ApiError {
    statusCode: number;
    message: string | string[];
    error: string;
}

// Auth API Types
export interface SignUpRequest {
    email?: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface SignInRequest {
    email?: string;
    phoneNumber?: string;
    password: string;
}

export interface RequestOtpRequest {
    email?: string;
    phoneNumber?: string;
}

export interface VerifyOtpRequest {
    email?: string;
    phoneNumber?: string;
    otp: string;
}

export interface AuthResponse {
    user: IUser;
    accessToken?: string;
    refreshToken?: string;
}

// Organization API Types
export interface CreateOrgRequest {
    name: string;
    inviteMembers?: Array<{
        email: string;
        predefinedRole: PredefinedOrgRole;
    }>;
    appProviders?: Array<{
        provider: ExternalProvider;
    }>;
}

export interface CreateOrgResponse {
    message: string;
    organization: IOrganization;
}

export interface ListOrgsResponse extends ApiResponse<IOrganization[]> {
    data: IOrganization[];
}

export interface UpdateOrgRequest {
    name?: string;
}

export interface InviteMemberRequest {
    email: string;
    predefinedRole?: PredefinedOrgRole;
    roleId?: string;
}

export interface UpdateMemberRequest {
    predefinedRole?: PredefinedOrgRole;
    roleId?: string;
}

export interface ListMembersResponse extends ApiResponse<IOrganizationMember[]> {
    data: IOrganizationMember[];
}

export interface ListInvitesResponse extends ApiResponse<IInvite[]> {
    data: IInvite[];
}

// Project API Types
export interface CreateProjectRequest {
    name: string;
    description?: string;
}

export interface CreateProjectResponse extends IProject {}

export interface ListProjectsResponse extends ApiResponse<IProject[]> {
    data: IProject[];
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
}

export interface LinkIntegrationRequest {
    integrationId: string;
    items: {
        repositories?: string[];
        channels?: string[];
        projects?: string[];
        [key: string]: any;
    };
}

export interface IntegrationResource {
    id: string;
    name: string;
    type: string;
    [key: string]: any;
}

export interface GetResourcesResponse {
    integrations: Array<{
        id: string;
        type: ExternalProvider;
        resources: IntegrationResource[];
    }>;
}

// Integration API Types
export interface GetInstallUrlResponse {
    url: string;
    message?: string;
}

export interface GitHubRepo {
    id: string;
    name: string;
    full_name: string;
    description?: string | null;
    private: boolean;
    default_branch: string;
    [key: string]: any;
}

export interface GitHubOverview {
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
}

export interface SlackChannel {
    id: string;
    name: string;
    is_private: boolean;
    is_archived: boolean;
    [key: string]: any;
}

export interface DiscordChannel {
    id: string;
    name: string;
    type: number;
    guild_id: string;
    [key: string]: any;
}

export interface JiraProject {
    id: string;
    key: string;
    name: string;
    projectTypeKey: string;
    [key: string]: any;
}

// GitHub Commit Types
export interface GitHubCommitSummary {
    sha: string;
    message: string;
    author: string;
    authorUsername?: string;
    authorAvatar?: string;
    date: string;
    filesChanged: number;
    additions: number;
    deletions: number;
}

export interface GitHubCodeQualityIssue {
    type: string;
    severity: string;
    description: string;
}

export interface GitHubCodeQuality {
    summary: string;
    score: number | null;
    issues: GitHubCodeQualityIssue[];
}

export interface GitHubSecurityFinding {
    type: string;
    severity: string;
    description: string;
    file?: string;
}

export interface GitHubSecurity {
    risk: "none" | "low" | "medium" | "high";
    summary: string;
    findings: GitHubSecurityFinding[];
}

export interface GitHubCommitFile {
    filename: string;
    patch?: string;
    additions?: number;
    deletions?: number;
    [key: string]: any;
}

export interface GitHubCommitDetail {
    commit: {
        sha: string;
        message: string;
        date?: string;
    };
    aiSummary: string;
    codeQuality?: GitHubCodeQuality;
    security: GitHubSecurity;
    files: GitHubCommitFile[];
    canDebug: boolean;
}

export interface DebugGithubCommitPatch {
    filename: string;
    diff: string;
}

export interface DebugGithubCommitResponse {
    explanation: string;
    suggestedCode?: string;
    patches?: DebugGithubCommitPatch[];
    risk: "low" | "medium" | "high";
    safeToApply: boolean;
    confidence: number;
}

// Chat/Conversation API Types
export interface CreateConversationRequest {
    projectId?: string;
    organizationId?: string;
    title?: string;
    type?: ConversationType;
}

export interface ListConversationsResponse extends Array<IConversation> {}

export interface SendMessageRequest {
    question: string;
}

export interface SendMessageResponse {
    status: "processing";
    jobId: string;
    userMessage: IChatMessage;
    message: string;
}

export interface JobStatusResponse extends IJob {}

// SSE Integration Status
export interface IntegrationStatusEvent {
    integrations: Array<{
        id: string;
        type: ExternalProvider;
        status: IntegrationStatus;
        [key: string]: any;
    }>;
}

// New SSE payload for org integration status (backend sends: { data: IntegrationStatusItem[] })
export type OrgIntegrationOauthStatus = "CONNECTED" | "NOT_CONNECTED";

export interface OrgIntegrationOauthAccount {
    identifier: string;
    providerUserId: string;
}

export interface OrgIntegrationStatusItem {
    app: ExternalProvider;
    authType: string;
    status: IntegrationStatus;
    integrationId: string;
    externalAccountId: string | null;
    externalAccount: string | null;
    statusMessage?: string;
    oauthStatus?: OrgIntegrationOauthStatus;
    oauthConnectedAt?: string | null;
    oauthAccount?: OrgIntegrationOauthAccount | null;
    canAutoConnect?: boolean;
    autoConnectCandidates?: Array<{
        orgId: string;
        orgSlug: string;
        orgName: string;
        integrationId: string;
        status: IntegrationStatus;
        externalAccountId: string | null;
        externalAccount: string | null;
        oauthAccount?: OrgIntegrationOauthAccount | null;
    }>;
    [key: string]: any;
}

export interface OrgIntegrationStatusSseEvent {
    data: OrgIntegrationStatusItem[];
}

// SSE Job Status
export interface JobStatusEvent {
    jobId: string;
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
    attempts: number;
    payload: Record<string, any>;
    updatedAt: string;
    completed?: boolean;
}
