import { apiClient } from "@/lib/api";
import {
    CreateConversationRequest,
    ListConversationsResponse,
    SendMessageRequest,
    SendMessageResponse,
    JobStatusResponse,
    ApiResponse,
} from "@/types/api-types";
import { IConversation, IChatMessage, IJob } from "@/types/prisma-generated";

// Create a new conversation
export const createConversation = async (data: CreateConversationRequest): Promise<IConversation> => {
    const response = await apiClient.post<IConversation>("/chat/conversations", data);
    return response.data;
};

// List conversations
export const listConversations = async (params?: {
    projectId?: string;
    organizationId?: string;
}): Promise<ListConversationsResponse> => {
    const response = await apiClient.get<ListConversationsResponse>("/chat/conversations", { params });
    return response.data;
};

// Get conversation by ID
export const getConversation = async (conversationId: string): Promise<IConversation> => {
    const response = await apiClient.get<IConversation>(`/chat/conversations/${conversationId}`);
    return response.data;
};

// Update conversation
export const updateConversation = async (
    conversationId: string,
    data: { title?: string }
): Promise<IConversation> => {
    const response = await apiClient.put<IConversation>(`/chat/conversations/${conversationId}`, data);
    return response.data;
};

// Get messages with pagination
export const listMessages = async (
    conversationId: string,
    params?: { limit?: number; before?: string }
): Promise<ApiResponse<IChatMessage[]>> => {
    const response = await apiClient.get<ApiResponse<IChatMessage[]>>(
        `/chat/conversations/${conversationId}/messages`,
        { params }
    );
    return response.data;
};

// Send a message
export const sendMessage = async (
    conversationId: string,
    data: SendMessageRequest
): Promise<SendMessageResponse> => {
    const response = await apiClient.post<SendMessageResponse>(
        `/chat/conversations/${conversationId}/messages`,
        data
    );
    return response.data;
};

// Get job status
export const getJobStatus = async (jobId: string): Promise<JobStatusResponse> => {
    const response = await apiClient.get<JobStatusResponse>(`/chat/jobs/${jobId}/status`);
    return response.data;
};

// Retry a failed job
export const retryJob = async (jobId: string): Promise<{ status: string; jobId: string; message: string }> => {
    const response = await apiClient.post<{ status: string; jobId: string; message: string }>(
        `/chat/jobs/${jobId}/retry`
    );
    return response.data;
};
